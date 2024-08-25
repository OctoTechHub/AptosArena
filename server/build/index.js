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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
mongoose_1.default.connect('mongodb+srv://krishsoni:2203031050659@paytm.aujjoys.mongodb.net/aptos_users')
    .then(() => console.log('Connected to SecretBase'))
    .catch((err) => console.error('MongoDB connection error:', err));
const playerSchema = new mongoose_1.default.Schema({
    playerName: { type: String, required: true, unique: true },
    aptosAccountAddress: { type: String, required: true }
});
const Player = mongoose_1.default.model('Player', playerSchema);
const playerHistorySchema = new mongoose_1.default.Schema({
    playerName: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});
const PlayerHistory = mongoose_1.default.model('PlayerHistory', playerHistorySchema);
const userSchema = new mongoose_1.default.Schema({
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
});
const User = mongoose_1.default.model('User', userSchema);
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
    let user = yield User.findOne({ publicKey });
    if (!user) {
        const saltRounds = 10;
        const hashedPrivateKey = yield bcrypt_1.default.hash(privateKey, saltRounds);
        user = new User({ publicKey, privateKey: hashedPrivateKey });
        yield user.save();
        console.log('New User Created and Signed In:');
    }
    else {
        console.log('Existing User Signed In:');
    }
    console.log(`Public Key: ${publicKey}`);
    console.log(`Private Key (Original): ${privateKey}`);
    console.log(`Private Key (Hashed): ${user.privateKey}`);
    res.send(`
        <h2>${user ? 'Sign-in Successful' : 'User Created and Signed In'}</h2>
        <p><strong>Public Key:</strong> ${publicKey}</p>
        <p><strong>Private Key (Hashed):</strong> ${user.privateKey}</p>
    `);
}));
// app.post('/addPlayer', async (req: Request, res: Response) => {
//     const { playerName } = req.body;
//     if (!playerName) {
//         return res.status(400).send('Player name is required.');
//     }
//     try {
//         const config = new AptosConfig({ network: Network.DEVNET });
//         const aptos = new Aptos(config);
//         let player = await Player.findOne({ playerName });
//         let playerValue;
//         if (player) {
//             const account = await aptos.account(player.aptosAccountAddress);
//             playerValue = account.balance;
//             const history = new PlayerHistory({ playerName, value: playerValue });
//             await history.save();
//             res.send(`Player ${playerName} exists. Updated value: ${playerValue}`);
//         } else {
//             const aptosAccountAddress = await generateAccount();
//             const account = await aptos.account(aptosAccountAddress);
//             playerValue = account.balance;
//             player = new Player({ playerName, aptosAccountAddress });
//             await player.save();
//             const history = new PlayerHistory({ playerName, value: playerValue });
//             await history.save();
//             res.send(`New Player ${playerName} added with value ${playerValue}`);
//         }
//     } catch (err) {
//         console.error('Error handling player:', err);
//         res.status(500).send('Failed to process player.');
//     }
// });
app.get('/playerHistory/:playerName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playerName } = req.params;
    if (!playerName) {
        return res.status(400).send('Player name is required.');
    }
    try {
        const history = yield PlayerHistory.find({ playerName }).sort({ date: -1 });
        res.json(history);
    }
    catch (err) {
        console.error('Error fetching player history:', err);
        res.status(500).send('Failed to fetch player history.');
    }
}));
app.get('/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield Player.find({});
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
