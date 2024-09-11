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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const purchaseRouter = express_1.default.Router();
const config = new ts_sdk_1.AptosConfig({ network: ts_sdk_1.Network.TESTNET });
const aptos = new ts_sdk_1.Aptos(config);
purchaseRouter.get("/create-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const account = ts_sdk_1.Account.generate({
        scheme: ts_sdk_1.SigningSchemeInput.Ed25519,
        legacy: false,
    });
    console.log('Generated Account:');
    console.log(`Public Key: ${account.publicKey}`);
    console.log(`Private Key: ${account.privateKey}`);
    // res.send(`
    //     <h2>Generated Account</h2>
    //     <p><strong>Public Key:</strong> ${account.publicKey}</p>
    //     <p><strong>Private Key:</strong> ${account.privateKey}</p>
    // `);
    res.send(`${account.publicKey} ${account.privateKey}`);
}));
purchaseRouter.post('/fund-account', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountAddress } = req.body;
    if (!accountAddress) {
        return res.status(400).send('<p>Invalid account address</p>');
    }
    const amount = 1000000000;
    const fundedAccount = yield aptos.fundAccount({ accountAddress, amount });
    console.log('Funded Account:');
    res.json(fundedAccount);
}));
purchaseRouter.get("/get-balance/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account } = req.params;
    try {
        // Fetch account details
        const accountDetails = yield axios_1.default.get(`https://api.testnet.staging.aptoslabs.com/v1/accounts/${account}/resources?limit=999`);
        res.json({ "apt token": accountDetails.data[1].data.coin.value });
    }
    catch (error) {
        res.status(500).send(`<p>Failed to get balance:</p>`);
    }
}));
purchaseRouter.post('/purchase', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { privateKey } = req.body;
    if (!privateKey) {
        console.error('Missing private key in request.');
        return res.status(400).send('<p>Invalid request. Missing private key.</p>');
    }
    const sellerPrivateKeyString = process.env.TRANSFER_ACCOUNT_PRIVATE_KEY;
    if (!sellerPrivateKeyString) {
        console.error('Seller private key not configured in environment variables.');
        return res.status(500).send('<p>Seller private key not configured.</p>');
    }
    try {
        const sellerPrivateKey = new ts_sdk_1.Ed25519PrivateKey(sellerPrivateKeyString);
        // Create an account object for the buyer using their private key
        const buyerAccount = ts_sdk_1.Account.fromPrivateKey({ privateKey: new ts_sdk_1.Ed25519PrivateKey(privateKey) });
        console.log('Buyer Account:', buyerAccount.accountAddress.toString());
        // Create an account object for the seller using the seller private key
        const sellerAccount = ts_sdk_1.Account.fromPrivateKey({ privateKey: sellerPrivateKey });
        console.log('Seller Account:', sellerAccount.accountAddress.toString());
        // Amount to transfer (in APT, ensure you use the correct format for the SDK)
        const amount = 0.1 * 1000000; // Amount in micro-APT
        console.log('Amount to Transfer:', amount);
        // Build the transaction
        const transaction = yield aptos.transaction.build.simple({
            sender: sellerAccount.accountAddress,
            data: {
                function: '0x1::coin::transfer', // Replace with your custom function if needed
                functionArguments: [buyerAccount.accountAddress, amount],
            },
        });
        console.log('Transaction Built:', transaction);
        // Sign the transaction
        const signedTransaction = yield aptos.transaction.sign({
            signer: sellerAccount,
            transaction,
        });
        console.log('Signed Transaction:', signedTransaction);
        // Submit the transaction
        const pendingTxn = yield aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator: signedTransaction,
        });
        console.log('Pending Transaction:', pendingTxn);
        // Wait for the transaction to be confirmed
        yield aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
        console.log('Transaction Confirmed:', pendingTxn.hash);
        res.send(`<p>Purchase successful. Transaction hash: ${pendingTxn.hash}</p>`);
    }
    catch (error) {
        console.error('Failed to process purchase:', error);
        res.status(500).send(`<p>Failed to process purchase: ${error.message}</p>`);
    }
}));
exports.default = purchaseRouter;
