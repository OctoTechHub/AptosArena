import express, { Request, Response } from 'express';
import { Account, Aptos, AptosConfig, Ed25519Account, Network, Ed25519PrivateKey, SigningSchemeInput } from '@aptos-labs/ts-sdk';
import axios from 'axios';
import { configDotenv } from 'dotenv';
configDotenv();
const purchaseRouter = express.Router();
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);


purchaseRouter.get("/create-account", async (req: Request, res: Response) => {
    const account = Account.generate({
        scheme: SigningSchemeInput.Ed25519,
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
})
purchaseRouter.post('/fund-account', async (req: Request, res: Response) => {
    const { accountAddress } = req.body;

    if (!accountAddress) {
        return res.status(400).send('<p>Invalid account address</p>');
    }
    const amount = 1000000000;
    const fundedAccount = await aptos.fundAccount({ accountAddress, amount });
    console.log('Funded Account:');
    res.json(fundedAccount);

})
purchaseRouter.get("/get-balance/:account", async (req: Request, res: Response) => {
    const { account } = req.params;

    try {
        // Fetch account details
        const accountDetails = await axios.get(`https://api.testnet.staging.aptoslabs.com/v1/accounts/${account}/resources?limit=999`);
        res.json({"apt token":accountDetails.data[1].data.coin.value});
    } catch (error) {
        res.status(500).send(`<p>Failed to get balance:</p>`);
    }
});


purchaseRouter.post('/purchase', async (req: Request, res: Response) => {
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
        const sellerPrivateKey = new Ed25519PrivateKey(sellerPrivateKeyString);

        // Create an account object for the buyer using their private key
        const buyerAccount = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(privateKey) });
        console.log('Buyer Account:', buyerAccount.accountAddress.toString());

        // Create an account object for the seller using the seller private key
        const sellerAccount = Account.fromPrivateKey({ privateKey: sellerPrivateKey }) as Ed25519Account;
        console.log('Seller Account:', sellerAccount.accountAddress.toString());

        // Amount to transfer (in APT, ensure you use the correct format for the SDK)
        const amount = 0.1 * 1_000_000; // Amount in micro-APT
        console.log('Amount to Transfer:', amount);

        // Build the transaction
        const transaction = await aptos.transaction.build.simple({
            sender: sellerAccount.accountAddress,
            data: {
                function: '0x1::coin::transfer', // Replace with your custom function if needed
                functionArguments: [buyerAccount.accountAddress, amount],
            },
        });
        console.log('Transaction Built:', transaction);

        // Sign the transaction
        const signedTransaction = aptos.transaction.sign({
            signer: sellerAccount,
            transaction,
        });
        console.log('Signed Transaction:', signedTransaction);

        // Submit the transaction
        const pendingTxn = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator: signedTransaction,
        });
        console.log('Pending Transaction:', pendingTxn);

        // Wait for the transaction to be confirmed
        await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
        console.log('Transaction Confirmed:', pendingTxn.hash);

        res.send(`<p>Purchase successful. Transaction hash: ${pendingTxn.hash}</p>`);
    } catch (error : any) {
        console.error('Failed to process purchase:', error);
        res.status(500).send(`<p>Failed to process purchase: ${error.message}</p>`);
    }
});
export default purchaseRouter;