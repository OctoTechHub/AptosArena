import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import generateAccount from './playerAddress';
import { Account, Aptos, AptosConfig, Network, SigningSchemeInput } from '@aptos-labs/ts-sdk';
import { Player, PlayerHistory, User } from './db';
const app = express();
const port = 3000;

app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Aptos Arena!');
});

app.get('/generateAccount', (req: Request, res: Response) => {
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

app.post('/signin', async (req: Request, res: Response) => {
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

app.post('/addPlayer', async (req: Request, res: Response) => {
    const { firstName, lastName, value } = req.body;
    console.log('Adding Player:', firstName, lastName, value);

    if (!firstName || !lastName) {
        return res.status(400).send('First name and last name are required.');
    }

    try {
        let player = await Player.findOne({ firstName, lastName });

        if (player) {
            const previousValue = player.value;
            player.value = value !== undefined ? value : previousValue;
            await Player.create();
            console.log(`Player ${firstName} ${lastName} updated. Current value: ${player.value}`);

            const history = new PlayerHistory({ firstName, lastName, value: player.value });
            await history.save();


            res.send(`Player ${firstName} ${lastName} updated. Current value: ${player.value}`);
        } else {
            const aptosAccountAddress = await generateAccount();

            player = new Player({ firstName, lastName, aptosAccountAddress, value: value || 0 });
            await player.save();
            console.log(`New Player ${firstName} ${lastName} added with value ${player.value}`);

            const history = new PlayerHistory({ firstName, lastName, value: player.value });
            await history.save();
            console.log(`Player ${firstName} ${lastName} history added. Value: ${player.value}`);

            res.send(`New Player ${firstName} ${lastName} added with value ${player.value}`);
        }
    } catch (err) {
        
            res.status(500).send('Failed to process player.');
        console.log('Error adding player:', err);
    }
});


app.get('/playerHistory/:firstName/:lastName', async (req: Request, res: Response) => {
    const { firstName, lastName } = req.params;

    if (!firstName || !lastName) {
        return res.status(400).send('First name and last name are required.');
    }

    try {
        const history = await PlayerHistory.find({ firstName, lastName }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error('Error fetching player history:', err);
        res.status(500).send('Failed to fetch player history.');
    }
});

app.get('/players', async (req: Request, res: Response) => {
    try {
        const players = await Player.find({});
        res.json(players);
    } catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).send('Failed to fetch players.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
