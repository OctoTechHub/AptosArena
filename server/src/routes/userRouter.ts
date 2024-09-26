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
userRouter.get('/generateAccount', async (req: Request, res: Response) => {
    const account = Account.generate({
        scheme: SigningSchemeInput.Ed25519,
        legacy: false,
    });
    //save accout to db
    const newUser = new User({
        publicKey: account.publicKey,
        privateKey: account.privateKey,
    });
    await newUser.save();
    console.log('Generated Account:');
    console.log(`Public Key: ${account.publicKey}`);
    console.log(`Private Key: ${account.privateKey}`);

    res.send(`
        <h2>Generated Account</h2>
        <p><strong>Public Key:</strong> ${account.publicKey}</p>
        <p><strong>Private Key:</strong> ${account.privateKey}</p>
    `);
});
userRouter.get('/get-stocks/:publicKey', async (req: Request, res: Response) => {
    try {
        const { publicKey } = req.params;
        const user = await User.findOne({ publicKey });

        if (!user || !user.stocksOwned) {
            return res.status(404).json({ message: 'User or stocks not found' });
        }

        // Fetch player's values for each playerId
        const playerStocks = await Promise.all(
            user.stocksOwned.map(async (stock: { playerId: string; quantity: number }) => {
                const player = await Player.findById(stock.playerId);
                if (player) {
                    return {
                        playerId: stock.playerId,
                        quantity: stock.quantity,
                        value: player.value // Assuming the player's value is stored in the 'value' field
                    };
                } else {
                    return null;
                }
            })
        );

        // Filter out null values (if any player wasn't found)
        const filteredStocks = playerStocks.filter(stock => stock !== null);

        res.json(filteredStocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
export default userRouter;