"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const playerAddress_1 = __importDefault(require("./playerAddress"));
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const db_1 = require("./db");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Welcome to Aptos Arena!');
});
app.get('/generateAccount', (req, res) => {
    const account = ts_sdk_1.Account.generate({
        scheme: ts_sdk_1.SigningSchemeInput.Ed25519,
        legacy: false,
    });
    console.log('Generated Account:');
    console.log(`Public Key: ${account.publicKey}`);
    console.log(`Private Key: ${account.privateKey}`);
    res.send(`
        <h2>Generated Account</h2>
        <p><strong>Public Key:</strong> ${account.publicKey}</p>
        <p><strong>Private Key:</strong> ${account.privateKey}</p>
    `);
});
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, privateKey } = req.body;
    if (!publicKey || !privateKey) {
        return res.status(400).send('<p>Invalid credentials</p>');
    }
    let user = yield db_1.User.findOne({ publicKey });
    if (!user) {
        const saltRounds = 10;
        const hashedPrivateKey = yield bcrypt_1.default.hash(privateKey, saltRounds);
        user = new db_1.User({ publicKey, privateKey: hashedPrivateKey });
        yield user.save();
        console.log('New User Created and Signed In:');
    }
    else {
        console.log('Existing User Signed In:');
    }
    console.log(`Public Key: ${publicKey}`);
    console.log(`Private Key (Hashed): ${user.privateKey}`);
    res.send(`
        <h2>${user ? 'Sign-in Successful' : 'User Created and Signed In'}</h2>
        <p><strong>Public Key:</strong> ${publicKey}</p>
        <p><strong>Private Key (Hashed):</strong> ${user.privateKey}</p>
    `);
}));
app.post('/addPlayer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, value } = req.body;
    console.log('Adding Player:', firstName, lastName, value);
    if (!firstName || !lastName) {
        return res.status(400).send('First name and last name are required.');
    }
    try {
        let player = yield db_1.Player.findOne({ firstName, lastName });
        if (player) {
            const previousValue = player.value;
            player.value = value !== undefined ? value : previousValue;
            yield db_1.Player.create();
            console.log(`Player ${firstName} ${lastName} updated. Current value: ${player.value}`);
            const history = new db_1.PlayerHistory({ firstName, lastName, value: player.value });
            yield history.save();
            res.send(`Player ${firstName} ${lastName} updated. Current value: ${player.value}`);
        }
        else {
            const aptosAccountAddress = yield (0, playerAddress_1.default)();
            player = new db_1.Player({ firstName, lastName, aptosAccountAddress, value: value || 0 });
            yield player.save();
            console.log(`New Player ${firstName} ${lastName} added with value ${player.value}`);
            const history = new db_1.PlayerHistory({ firstName, lastName, value: player.value });
            yield history.save();
            console.log(`Player ${firstName} ${lastName} history added. Value: ${player.value}`);
            res.send(`New Player ${firstName} ${lastName} added with value ${player.value}`);
        }
    }
    catch (err) {
        res.status(500).send('Failed to process player.');
        console.log('Error adding player:', err);
    }
}));
app.get('/playerHistory/:firstName/:lastName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName } = req.params;
    if (!firstName || !lastName) {
        return res.status(400).send('First name and last name are required.');
    }
    try {
        const history = yield db_1.PlayerHistory.find({ firstName, lastName }).sort({ date: -1 });
        res.json(history);
    }
    catch (err) {
        console.error('Error fetching player history:', err);
        res.status(500).send('Failed to fetch player history.');
    }
}));
app.get('/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield db_1.Player.find({});
        res.json(players);
    }
    catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).send('Failed to fetch players.');
    }
}));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});