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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const purchaseRouter = express_1.default.Router();
const APTOS_NETWORK = ts_sdk_1.NetworkToNetworkName[(_a = process.env.APTOS_NETWORK) !== null && _a !== void 0 ? _a : ts_sdk_1.Network.DEVNET];
const config = new ts_sdk_1.AptosConfig({ network: APTOS_NETWORK });
const aptos = new ts_sdk_1.Aptos(config);
const ALICE_INITIAL_BALANCE = 1000000000; // 1 APT in micro-APT
const TRANSFER_AMOUNT = 100000; // 0.1 APT in micro-APT (Correct value)
// Route to create a new account
purchaseRouter.get("/create-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = ts_sdk_1.Account.generate({
            scheme: ts_sdk_1.SigningSchemeInput.Ed25519,
            legacy: false,
        });
        console.log('Generated Account:');
        console.log(`Public Key: ${account.publicKey}`);
        console.log(`Private Key: ${account.privateKey}`);
        res.send(`${account.publicKey} ${account.privateKey}`);
    }
    catch (error) {
        console.error('Failed to create account:', error);
        res.status(500).send('<p>Failed to create account.</p>');
    }
}));
// Route to fund an account using Aptos Testnet Faucet
purchaseRouter.post('/fund-account', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountAddress } = req.body;
    if (!accountAddress) {
        return res.status(400).send('<p>Invalid account address</p>');
    }
    try {
        const fundedAccount = yield aptos.fundAccount({ accountAddress, amount: ALICE_INITIAL_BALANCE });
        console.log('Funded Account:', fundedAccount);
        res.json(fundedAccount);
    }
    catch (error) {
        console.error('Failed to fund account:', error);
        res.status(500).send('<p>Failed to fund account.</p>');
    }
}));
// Route to get the balance of an account
purchaseRouter.get("/get-balance/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account } = req.params;
    try {
        // Fetch account balance using the Aptos SDK
        const balance = yield aptos.getAccountAPTAmount({ accountAddress: account });
        res.json({ "apt token": balance });
    }
    catch (error) {
        console.error('Failed to get balance:', error);
        res.status(500).send('<p>Failed to get balance.</p>');
    }
}));
// Route to handle the purchase transaction
// Route to handle the purchase transaction
purchaseRouter.post('/purchase', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { privateKey } = req.body;
    if (!privateKey) {
        return res.status(400).send('<p>Invalid request. Missing private key.</p>');
    }
    try {
        // 1. Generate a new seller account
        const seller = ts_sdk_1.Account.generate({ scheme: ts_sdk_1.SigningSchemeInput.Ed25519, legacy: false });
        console.log(`Seller's address: ${seller.accountAddress}`);
        // 2. Fund the seller account with 1 APT (for testing purposes)
        yield aptos.fundAccount({ accountAddress: seller.accountAddress, amount: ALICE_INITIAL_BALANCE });
        // 3. Create an account object for the buyer using their private key
        // Convert the private key to an Ed25519PrivateKey object
        const buyerPrivateKey = new ts_sdk_1.Ed25519PrivateKey(privateKey);
        const buyer = ts_sdk_1.Account.fromPrivateKey({ privateKey: buyerPrivateKey });
        const fundBuyer = aptos.fundAccount({ accountAddress: buyer.accountAddress, amount: ALICE_INITIAL_BALANCE });
        console.log(`Buyer's address: ${buyer.accountAddress}`);
        // Check if the buyer's account exists and is funded
        const buyerBalance = yield aptos.getAccountAPTAmount({ accountAddress: buyer.accountAddress });
        console.log(`Buyer balance before transaction: ${buyerBalance}`);
        if (buyerBalance < TRANSFER_AMOUNT) {
            return res.status(400).send('<p>Buyer account does not have enough funds.</p>');
        }
        // 4. Transfer the amount from buyer to seller
        const transaction = yield aptos.transferCoinTransaction({
            sender: buyer.accountAddress,
            recipient: seller.accountAddress,
            amount: TRANSFER_AMOUNT,
        });
        const pendingTxn = yield aptos.signAndSubmitTransaction({ signer: buyer, transaction });
        const response = yield aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
        console.log(`Transaction successful: ${response.hash}`);
        // Show updated balances
        const newBuyerBalance = yield aptos.getAccountAPTAmount({ accountAddress: buyer.accountAddress });
        const newSellerBalance = yield aptos.getAccountAPTAmount({ accountAddress: seller.accountAddress });
        res.send({
            message: 'Transaction successful',
            transactionHash: response.hash,
            newBuyerBalance,
            newSellerBalance,
        });
    }
    catch (error) {
        console.error('Failed to process transaction:', error);
        res.status(500).send(`<p>Failed to process transaction: ${error.message}</p>`);
    }
}));
exports.default = purchaseRouter;
