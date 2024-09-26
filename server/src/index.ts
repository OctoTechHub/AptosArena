import express, { Request, Response } from 'express';
import  userRouter  from './routes/userRouter';
import  playerRouter  from './routes/playerRouter';
import cors from 'cors';

import { connectToDatabase } from './db';
import purchaseRouter from './routes/purchase';
const app = express();
const port = 3000;
app.use(cors({ origin: ['http://localhost:5173', 'https://cricktrade.vercel.app'] }));

app.use(express.json());

connectToDatabase();
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Aptos Arena!');
});

app.use('/api/user',userRouter);
app.use('/api/player',playerRouter);
app.use('/api/purchase',purchaseRouter);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
