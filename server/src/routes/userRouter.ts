import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Account, SigningSchemeInput } from '@aptos-labs/ts-sdk';
const userRouter = express.Router();
import { User } from '../db';
userRouter.post('/signin', async (req: Request, res: Response) => {
    const { publicKey, privateKey } = req.body;

    if (!publicKey || !privateKey) {
        return res.status(400).send('<p>Invalid credentials</p>');
    }

    let user = await User.findOne({ publicKey });
    if (!user) {
        const saltRounds = 10;
        const hashedPrivateKey = await bcrypt.hash(privateKey, saltRounds);

        user = new User({ publicKey, privateKey: hashedPrivateKey });
        await user.save();
        console.log('New User Created and Signed In:');
    } else {
        console.log('Existing User Signed In:');
    }

    console.log(`Public Key: ${publicKey}`);
    console.log(`Private Key (Hashed): ${user.privateKey}`);

    res.send(`
        <h2>${user ? 'Sign-in Successful' : 'User Created and Signed In'}</h2>
        <p><strong>Public Key:</strong> ${publicKey}</p>
        <p><strong>Private Key (Hashed):</strong> ${user.privateKey}</p>
    `);
});
userRouter.get('/generateAccount', (req: Request, res: Response) => {
    const account = Account.generate({
        scheme: SigningSchemeInput.Ed25519,
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
export default userRouter;