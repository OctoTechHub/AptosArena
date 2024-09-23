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
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const db_1 = require("../db");
const userRouter = express_1.default.Router();
// Sign-in Route
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, privateKey } = req.body;
    if (!publicKey || !privateKey) {
        return res.status(400).send('<p>Invalid credentials</p>');
    }
    try {
        // Check if the user already exists in the database
        let user = yield db_1.User.findOne({ publicKey });
        if (!user) {
            // No hashing for private key, directly store both public and private keys
            user = new db_1.User({ publicKey, privateKey });
            yield user.save();
            console.log('New User Created and Signed In:');
        }
        else {
            console.log('Existing User Signed In:');
        }
        console.log(`Public Key: ${publicKey}`);
        console.log(`Private Key: ${privateKey}`);
        res.send(`
            <h2>${user ? 'Sign-in Successful' : 'User Created and Signed In'}</h2>
            <p><strong>Public Key:</strong> ${publicKey}</p>
            <p><strong>Private Key:</strong> ${privateKey}</p>
        `);
    }
    catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).send('Failed to sign in.');
    }
}));
// Generate Account Route
userRouter.get('/generateAccount', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate a new Aptos account
        const account = ts_sdk_1.Account.generate({
            scheme: ts_sdk_1.SigningSchemeInput.Ed25519,
            legacy: false,
        });
        const { publicKey, privateKey } = account;
        // Store the generated account details in the database
        const user = new db_1.User({
            publicKey,
            privateKey
        });
        yield user.save();
        console.log('Generated and stored new account:');
        console.log(`Public Key: ${publicKey}`);
        console.log(`Private Key: ${privateKey}`);
        // Send the response with the public and private keys
        res.send(`
            <h2>Generated Account</h2>
            <p><strong>Public Key:</strong> ${publicKey}</p>
            <p><strong>Private Key:</strong> ${privateKey} (make sure to store it securely)</p>
        `);
    }
    catch (error) {
        console.error('Error generating account:', error);
        res.status(500).send('Failed to generate account.');
    }
}));
exports.default = userRouter;
