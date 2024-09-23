import express, { Request, Response } from 'express';
import { Account, Aptos, AptosConfig, Ed25519Account, Network, NetworkToNetworkName ,Ed25519PrivateKey, SigningSchemeInput } from '@aptos-labs/ts-sdk';
import { configDotenv } from 'dotenv';

configDotenv();
const purchaseRouter = express.Router();

const APTOS_NETWORK: Network = NetworkToNetworkName[process.env.APTOS_NETWORK ?? Network.DEVNET];
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const ALICE_INITIAL_BALANCE = 1_000_000_000; // 1 APT in micro-APT
const TRANSFER_AMOUNT = 100_000; // 0.1 APT in micro-APT (Correct value)

// Route to create a new account
purchaseRouter.get("/create-account", async (req: Request, res: Response) => {
    try {
        const account = Account.generate({
            scheme: SigningSchemeInput.Ed25519,
            legacy: false,
        });

        console.log('Generated Account:');
        console.log(`Public Key: ${account.publicKey}`);
        console.log(`Private Key: ${account.privateKey}`);

        res.send(`${account.publicKey} ${account.privateKey}`);
    } catch (error) {
        console.error('Failed to create account:', error);
        res.status(500).send('<p>Failed to create account.</p>');
    }
});

// Route to fund an account using Aptos Testnet Faucet
purchaseRouter.post('/fund-account', async (req: Request, res: Response) => {
    const { accountAddress } = req.body;

    if (!accountAddress) {
        return res.status(400).send('<p>Invalid account address</p>');
    }

    try {
        const fundedAccount = await aptos.fundAccount({ accountAddress, amount: ALICE_INITIAL_BALANCE });
        console.log('Funded Account:', fundedAccount);

        res.json(fundedAccount);
    } catch (error) {
        console.error('Failed to fund account:', error);
        res.status(500).send('<p>Failed to fund account.</p>');
    }
});

// Route to get the balance of an account
purchaseRouter.get("/get-balance/:account", async (req: Request, res: Response) => {
    const { account } = req.params;

    try {
        // Fetch account balance using the Aptos SDK
        const balance = await aptos.getAccountAPTAmount({ accountAddress: account });
        res.json({ "apt token": balance });
    } catch (error) {
        console.error('Failed to get balance:', error);
        res.status(500).send('<p>Failed to get balance.</p>');
    }
});

// Route to handle the purchase transaction
// Route to handle the purchase transaction


purchaseRouter.post('/purchase', async (req: Request, res: Response) => {
    const { privateKey } = req.body;

    if (!privateKey) {
        return res.status(400).send('<p>Invalid request. Missing private key.</p>');
    }

    try {
        // 1. Generate a new seller account
        const seller = Account.generate({ scheme: SigningSchemeInput.Ed25519, legacy: false });
        console.log(`Seller's address: ${seller.accountAddress}`);

        // 2. Fund the seller account with 1 APT (for testing purposes)
        await aptos.fundAccount({ accountAddress: seller.accountAddress, amount: ALICE_INITIAL_BALANCE });

        // 3. Create an account object for the buyer using their private key
        // Convert the private key to an Ed25519PrivateKey object
        const buyerPrivateKey = new Ed25519PrivateKey(privateKey);
        const buyer = Account.fromPrivateKey({ privateKey: buyerPrivateKey });
        const fundBuyer=aptos.fundAccount({ accountAddress: buyer.accountAddress, amount: ALICE_INITIAL_BALANCE });
        console.log(`Buyer's address: ${buyer.accountAddress}`);

        // Check if the buyer's account exists and is funded
        const buyerBalance = await aptos.getAccountAPTAmount({ accountAddress: buyer.accountAddress });
        console.log(`Buyer balance before transaction: ${buyerBalance}`);

        if (buyerBalance < TRANSFER_AMOUNT) {
            return res.status(400).send('<p>Buyer account does not have enough funds.</p>');
        }

        // 4. Transfer the amount from buyer to seller
        const transaction = await aptos.transferCoinTransaction({
            sender: buyer.accountAddress,
            recipient: seller.accountAddress,
            amount: TRANSFER_AMOUNT,
        });

        const pendingTxn = await aptos.signAndSubmitTransaction({ signer: buyer, transaction });
        const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
        console.log(`Transaction successful: ${response.hash}`);

        // Show updated balances
        const newBuyerBalance = await aptos.getAccountAPTAmount({ accountAddress: buyer.accountAddress });
        const newSellerBalance = await aptos.getAccountAPTAmount({ accountAddress: seller.accountAddress });

        res.send({
            message: 'Transaction successful',
            transactionHash: response.hash,
            newBuyerBalance,
            newSellerBalance,
        });
        
    } catch (error: any) {
        console.error('Failed to process transaction:', error);
        res.status(500).send(`<p>Failed to process transaction: ${error.message}</p>`);
    }
});


export default purchaseRouter;
