import express, { Request, Response } from 'express';
import { Account, Aptos, AptosConfig, Ed25519Account, Network, NetworkToNetworkName, Ed25519PrivateKey, SigningSchemeInput } from '@aptos-labs/ts-sdk';
import { configDotenv } from 'dotenv';
import { OrderBook, Player, User } from '../db';
// import bcrypt from 'bcrypt';\
import jwt, { JwtPayload } from 'jsonwebtoken';

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
    console.log(privateKey, publicKey, amount, playerId, decrementAmount);
    
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

            // Mark the array as modified
            user.markModified('stocksOwned');
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


purchaseRouter.post('/addToOrderBook', async (req: Request, res: Response) => {
    const { orderStatus, orderPrice, orderQuantity, playerId, orderType, publicKey, privateKey } = req.body;

    console.log(orderStatus, orderPrice, orderQuantity, playerId, publicKey);

    if (!publicKey) {
        return res.status(400).send('<p>Invalid request. Missing public key.</p>');
    }

    const user = await User.findOne({ publicKey });
    if (!user) {
        return res.status(400).send('<p>Invalid request. User not found.</p>');
    }

    if (orderQuantity <= 0) {
        return res.status(400).send('<p>Invalid request. Order quantity must be greater than zero.</p>');
    }

    const player = await Player.findById(playerId);
    if (!player) {
        return res.status(400).send('<p>Invalid request. Player not found.</p>');
    }

    // Sign the privateKey with JWT
    let tokenizedPrivateKey;
    try {
        tokenizedPrivateKey = jwt.sign({ privateKey }, process.env.JWT_SECRET ?? '');
    } catch (error) {
        console.error('Error signing private key with JWT:', error);
        return res.status(500).send('<p>Internal server error. Could not sign private key.</p>');
    }

    // Creating a new order for the order book
    const newOrder = new OrderBook({
        orderType,
        playerId,
        privateKey: tokenizedPrivateKey,  // Store the JWT token
        orderPrice,
        orderQuantity,
        orderStatus,
    });

    try {
        await newOrder.save();
        res.status(201).send({ message: 'Order added to the order book successfully', order: newOrder });
    } catch (error) {
        console.error('Error saving order to the order book:', error);
        res.status(500).send('<p>Internal server error. Could not save order.</p>');
    }
});

purchaseRouter.get('/getOrderBook', async (req: Request, res: Response) => {
    try {
        const orderBook = await OrderBook.find();
        res.json(orderBook);
    } catch (error) {
        console.error('Error fetching order book:', error);
        res.status(500).send('<p>Internal server error. Could not fetch order book.</p>');
    }
})
purchaseRouter.post('/buyFromOrderBook', async (req: Request, res: Response) => {
    const { orderId, publicKey, privateKey } = req.body;

    if (!publicKey) {
        return res.status(400).send('<p>Invalid request. Missing public key.</p>');
    }

    const order = await OrderBook.findById(orderId);
    if (!order) {
        return res.status(400).send('<p>Invalid request. Order not found.</p>');
    }

    const buyer = await User.findOne({ publicKey });
    if (!buyer) {
        return res.status(400).send('<p>Invalid request. Buyer not found.</p>');
    }

    // Decode the stored privateKey (JWT) from the order
    let decodedPrivateKey;
    try {
        const decoded = jwt.verify(order.privateKey, process.env.JWT_SECRET ?? '');  // Verify the token with the same secret
        decodedPrivateKey = (decoded as JwtPayload & { privateKey: string }).privateKey;
        console.log('Decoded private key:', decodedPrivateKey);
    } catch (error) {
        console.error('Error decoding private key from JWT:', error);
        return res.status(400).send('<p>Invalid request. Could not decode private key.</p>');
    }

    // Fetch seller using the decoded private key
    const seller = await User.findOne({ privateKey: decodedPrivateKey });
    if (!seller) {
        return res.status(400).send('<p>Invalid request. Seller not found.</p>');
    }

    const buyerPrivateKey = new Ed25519PrivateKey(privateKey);  // Assuming the buyer provides their raw private key
    const buyerAccount = Account.fromPrivateKey({ privateKey: buyerPrivateKey });
    const sellerpvt=new Ed25519PrivateKey(decodedPrivateKey);
    const sellerAccount=Account.fromPrivateKey({privateKey:sellerpvt});

    const buyerBalance = await aptos.getAccountAPTAmount({ accountAddress: buyerAccount.accountAddress });
    if (buyerBalance < order.orderPrice * order.orderQuantity) {
        return res.status(400).send('<p>Buyer account does not have enough funds.</p>');
    }

    try {
        // Perform the transfer transaction
        console.log("TRANSACTION STARTED")
        const transaction = await aptos.transferCoinTransaction({
            sender: buyerAccount.accountAddress,
            recipient: sellerAccount.accountAddress,
            amount: Math.round(order.orderPrice) * order.orderQuantity
        });
        const pendingTxn = await aptos.signAndSubmitTransaction({ signer: buyerAccount, transaction });
        const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
        console.log(`Transaction successful: ${response.hash}`);

        const newBuyerBalance = await aptos.getAccountAPTAmount({ accountAddress: buyerAccount.accountAddress });
        const newSellerBalance = await aptos.getAccountAPTAmount({ accountAddress: sellerAccount.accountAddress });

        // Update order status to 'closed'
        const orderUpdate = await OrderBook.findByIdAndUpdate(orderId, { orderStatus: 'closed' }, { new: true });

        // Update buyer's stock
        const buyerStockIndex = buyer.stocksOwned.findIndex(stock => stock.playerId === order.playerId);
        if (buyerStockIndex !== -1) {
            buyer.stocksOwned[buyerStockIndex].quantity += order.orderQuantity;
        } else {
            buyer.stocksOwned.push({ playerId: order.playerId, quantity: order.orderQuantity });
        }
        await buyer.save();

        // Update seller's stock by reducing the quantity or removing the stock if none left
        const sellerStockIndex = seller.stocksOwned.findIndex(stock => stock.playerId === order.playerId);
        if (sellerStockIndex !== -1) {
            if (seller.stocksOwned[sellerStockIndex].quantity >= order.orderQuantity) {
                seller.stocksOwned[sellerStockIndex].quantity -= order.orderQuantity;

                // Remove the stock if quantity becomes zero
                if (seller.stocksOwned[sellerStockIndex].quantity === 0) {
                    seller.stocksOwned.splice(sellerStockIndex, 1);
                }
            } else {
                return res.status(400).send('<p>Seller does not have enough quantity to sell.</p>');
            }
        } else {
            return res.status(400).send('<p>Seller does not own this stock.</p>');
        }
        await seller.save();

        res.send({
            message: 'Transaction successful',
            transactionHash: response.hash,
            newBuyerBalance,
            newSellerBalance,
            buyerUpdate: buyer,
            orderUpdate
        });

    } catch (error) {
        console.error('Failed to process transaction:', error);
        res.status(500).send(`<p>Failed to process transaction: ${error}</p>`);
    }
});

export default purchaseRouter;
