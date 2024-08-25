import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import generateAccount from './playerAddress'; 
import { Account, Aptos, AptosConfig, Network, SigningSchemeInput } from '@aptos-labs/ts-sdk';

const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect('mongodb+srv://krishsoni:2203031050659@paytm.aujjoys.mongodb.net/aptos_users')
  .then(() => console.log('Connected to SecretBase'))
  .catch((err: any) => console.error('MongoDB connection error:', err));

const playerSchema = new mongoose.Schema({
    playerName: { type: String, required: true, unique: true },
    aptosAccountAddress: { type: String, required: true }
});

const Player = mongoose.model('Player', playerSchema);

const playerHistorySchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const PlayerHistory = mongoose.model('PlayerHistory', playerHistorySchema);

const userSchema = new mongoose.Schema({
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

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
    console.log(`Private Key (Original): ${privateKey}`);
    console.log(`Private Key (Hashed): ${user.privateKey}`);

    res.send(`
        <h2>${user ? 'Sign-in Successful' : 'User Created and Signed In'}</h2>
        <p><strong>Public Key:</strong> ${publicKey}</p>
        <p><strong>Private Key (Hashed):</strong> ${user.privateKey}</p>
    `);
});


// app.post('/addPlayer', async (req: Request, res: Response) => {
//     const { playerName } = req.body;
    

//     if (!playerName) {
//         return res.status(400).send('Player name is required.');
//     }

//     try {
//         const config = new AptosConfig({ network: Network.DEVNET });
//         const aptos = new Aptos(config);

//         let player = await Player.findOne({ playerName });
//         let playerValue;

//         if (player) {
//             const account = await aptos.account(player.aptosAccountAddress);
//             playerValue = account.balance;

//             const history = new PlayerHistory({ playerName, value: playerValue });
//             await history.save();

//             res.send(`Player ${playerName} exists. Updated value: ${playerValue}`);
//         } else {
//             const aptosAccountAddress = await generateAccount();
//             const account = await aptos.account(aptosAccountAddress);
//             playerValue = account.balance;

//             player = new Player({ playerName, aptosAccountAddress });
//             await player.save();

//             const history = new PlayerHistory({ playerName, value: playerValue });
//             await history.save();

//             res.send(`New Player ${playerName} added with value ${playerValue}`);
//         }
//     } catch (err) {
//         console.error('Error handling player:', err);
//         res.status(500).send('Failed to process player.');
//     }
// });

app.get('/playerHistory/:playerName', async (req: Request, res: Response) => {
    const { playerName } = req.params;

    if (!playerName) {
        return res.status(400).send('Player name is required.');
    }

    try {
        const history = await PlayerHistory.find({ playerName }).sort({ date: -1 });
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