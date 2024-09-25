import express, { Request, Response } from 'express';
import { Account, Aptos, AptosConfig, Ed25519Account, Network, NetworkToNetworkName, Ed25519PrivateKey, SigningSchemeInput } from '@aptos-labs/ts-sdk';
import { configDotenv } from 'dotenv';
import { Player,User } from '../db';

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
purchaseRouter.post('/buy-player', async (req: Request, res: Response) => {
    const { privateKey, publicKey, amount, playerId, decrementAmount } = req.body;

    if (!privateKey) {
        return res.status(400).send('<p>Invalid request. Missing private key.</p>');
    }

    const player = await Player.findById(playerId);
    if (!player) {
        return res.status(400).send('<p>Invalid request. Player not found.</p>');
    }

    const user = await User.findOne({ publicKey });
    if (!user) {
        return res.status(400).send('<p>Invalid request. User not found.</p>');
    }

    if (!decrementAmount || decrementAmount <= 0) {
        return res.status(400).send('<p>Invalid request. Decrement amount must be greater than zero.</p>');
    }

    // Ensure that the player has enough quantity
    if ((player.quantity ?? 0) < decrementAmount) {
        return res.status(400).send('<p>Not enough player quantity available.</p>');
    }

    try {
        // 1. Generate a new seller account
        if (!process.env.TRANSFER_ACCOUNT_PRIVATE_KEY) {
            return res.status(500).send('<p>Transfer account not found.</p>');
        }
        const sellerPrivateKey = new Ed25519PrivateKey(process.env.TRANSFER_ACCOUNT_PRIVATE_KEY);
        const seller = Account.fromPrivateKey({ privateKey: sellerPrivateKey });
        // 2. Fund the seller account with 1 APT (for testing purposes)
        await aptos.fundAccount({ accountAddress: seller.accountAddress, amount: ALICE_INITIAL_BALANCE });

        // 3. Create an account object for the buyer using their private key
        const buyerPrivateKey = new Ed25519PrivateKey(privateKey);
        const buyer = Account.fromPrivateKey({ privateKey: buyerPrivateKey });
        
        const buyerBalance = await aptos.getAccountAPTAmount({ accountAddress: buyer.accountAddress });

        if (buyerBalance == 0) {
            const fundBuyer = await aptos.fundAccount({ accountAddress: buyer.accountAddress, amount: ALICE_INITIAL_BALANCE });
            console.log(`Buyer's address: ${buyer.accountAddress}`);
        }

        // Check if the buyer's account exists and is funded
        console.log(`Buyer balance before transaction: ${buyerBalance}`);

        if (buyerBalance < amount) {
            return res.status(400).send('<p>Buyer account does not have enough funds.</p>');
        }

        // 4. Transfer the amount from buyer to seller
        const transaction = await aptos.transferCoinTransaction({
            sender: buyer.accountAddress,
            recipient: seller.accountAddress,
            amount: amount,
        });

        const pendingTxn = await aptos.signAndSubmitTransaction({ signer: buyer, transaction });
        const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
        console.log(`Transaction successful: ${response.hash}`);

        // Show updated balances
        const newBuyerBalance = await aptos.getAccountAPTAmount({ accountAddress: buyer.accountAddress });
        const newSellerBalance = await aptos.getAccountAPTAmount({ accountAddress: seller.accountAddress });
        console.log(`Buyer balance after transaction: ${newBuyerBalance}`);

        // 5. Update player quantity
        const playerUpdate = await Player.findByIdAndUpdate(playerId, { $inc: { quantity: -decrementAmount } }, { new: true });

        // 6. Update user's stocksOwned field
        const stockIndex = user.stocksOwned.findIndex(stock => stock.playerId === playerId);

        if (stockIndex !== -1) {
            // Player already exists, increment the quantity
            user.stocksOwned[stockIndex].quantity += decrementAmount;
        } else {
            // Player doesn't exist, add a new entry
            user.stocksOwned.push({ playerId, quantity: decrementAmount });
        }

        // Save the updated user document
        const userUpdate = await user.save();

        res.send({
            message: 'Transaction successful',
            transactionHash: response.hash,
            newBuyerBalance,
            newSellerBalance,
            userUpdate,
            playerUpdate
        });
    } catch (error: any) {
        console.error('Failed to process transaction:', error);
        res.status(500).send(`<p>Failed to process transaction: ${error.message}</p>`);
    }
});


export default purchaseRouter;
