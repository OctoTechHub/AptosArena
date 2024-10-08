import express, { Request, Response } from 'express';
import { Player } from '../db';
const playerRouter = express.Router();
playerRouter.post('/addPlayer', async (req: Request, res: Response) => {
    const { firstName, lastName, value, quantity, imgUrl, nationality, role } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).send('Both firstName and lastName are required.');
    }

    const playerName = `${firstName}_${lastName}`; // Generate a unique playerName

    console.log('Adding Player:', { firstName, lastName, value, quantity, imgUrl, nationality, role, playerName });

    try {
        // Check for existing player by playerName
        const existingPlayer = await Player.findOne({ playerName });

        if (existingPlayer) {
            return res.status(400).send('Player already exists');
        }

        // Create new player
        const player = await Player.create({
            firstName,
            lastName,
            value,
            quantity,
            imageUrl: imgUrl,
            nationality,
            role,
            playerName // Ensure playerName is included
        });

        res.json({ player, message: 'Player added successfully' });

        } catch (error: any) {
        console.error('Error adding player:', {
            message: error.message,
            stack: error.stack,
            index: error.index,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });
        res.status(500).send('Failed to add player');
    }
});

playerRouter.put('/updatePlayer/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const {  quantity } = req.body;

   
    if (!quantity) {
        return res.status(400).send('Quantity is required.');
    }
    try {
        const player = await Player.findByIdAndUpdate(id, {  quantity }, { new: true });
        res.json(player);
    } catch (err) {
        console.error('Error updating player:', err);
        res.status(500).send('Failed to update player');
    }
});
playerRouter.put('/updatePlayerValue/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const {  value } = req.body;

   
    if (!value) {
        return res.status(400).send('Value is required.');
    }
    try {
        const player = await Player.findByIdAndUpdate(id, {  value }, { new: true });
        res.json(player);
    } catch (err) {
        console.error('Error updating player:', err);
        res.status(500).send('Failed to update player');
    }
});

//////delete player
playerRouter.delete('/deletePlayer/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await Player.findByIdAndDelete(id);
        res.send('Player deleted successfully');
    } catch (err) {
        console.error('Error deleting player:', err);
        res.status(500).send('Failed to delete player');
    }
});//////delete player

///Get player by id
playerRouter.get('/getPlayer/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const player = await Player.findById(id);
        res.json(player);
    } catch (err) {
        console.error('Error fetching player:', err);
        res.status(500).send('Failed to fetch player');
    }
});////Get player by id




playerRouter.get('/getallplayers', async (req: Request, res: Response) => {
    try {
        const players = await Player.find({});
        res.json(players);
    } catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).send('Failed to fetch players.');
    }
});
export default playerRouter;