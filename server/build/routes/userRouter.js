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
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const userRouter = express_1.default.Router();
const db_1 = require("../db");
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userRouter.get('/generateAccount', (req, res) => {
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
exports.default = userRouter;
