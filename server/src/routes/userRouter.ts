import express, { Request, Response } from 'express';
import { Account, SigningSchemeInput } from '@aptos-labs/ts-sdk';
import { User } from '../db';

const userRouter = express.Router();

// Sign-in Route
userRouter.post('/signin', async (req: Request, res: Response) => {
    const { publicKey, privateKey } = req.body;

    if (!publicKey || !privateKey) {
        return res.status(400).send('<p>Invalid credentials</p>');
    }

    try {
        // Check if the user already exists in the database
        let user = await User.findOne({ publicKey });

        if (!user) {
            // No hashing for private key, directly store both public and private keys
            user = new User({ publicKey, privateKey });
            await user.save();

            console.log('New User Created and Signed In:');
        } else {
            console.log('Existing User Signed In:');
        }

        console.log(`Public Key: ${publicKey}`);
        console.log(`Private Key: ${privateKey}`);

        res.send(`
            <h2>${user ? 'Sign-in Successful' : 'User Created and Signed In'}</h2>
            <p><strong>Public Key:</strong> ${publicKey}</p>
            <p><strong>Private Key:</strong> ${privateKey}</p>
        `);
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).send('Failed to sign in.');
    }
});

// Generate Account Route
userRouter.get('/generateAccount', async (req: Request, res: Response) => {
    try {
        // Generate a new Aptos account
        const account = Account.generate({
            scheme: SigningSchemeInput.Ed25519,
            legacy: false,
        });

        const { publicKey, privateKey } = account;

        // Store the generated account details in the database
        const user = new User({
            publicKey,
            privateKey
        });
        await user.save();

        console.log('Generated and stored new account:');
        console.log(`Public Key: ${publicKey}`);
        console.log(`Private Key: ${privateKey}`);

        // Send the response with the public and private keys
        res.send(`
            <h2>Generated Account</h2>
            <p><strong>Public Key:</strong> ${publicKey}</p>
            <p><strong>Private Key:</strong> ${privateKey} (make sure to store it securely)</p>
        `);
    } catch (error) {
        console.error('Error generating account:', error);
        res.status(500).send('Failed to generate account.');
    }
});

export default userRouter;
