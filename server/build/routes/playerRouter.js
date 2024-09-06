"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const playerRouter = express_1.default.Router();
playerRouter.post('/addPlayer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, value, quantity } = req.body;
    // Ensure that required fields are not null or undefined
    if (!firstName || !lastName) {
        return res.status(400).send('Both firstName and lastName are required.');
    }
    console.log('Adding Player:', firstName, lastName, value);
    try {
        // Check for existing player
        const existingPlayer = yield db_1.Player.findOne({ firstName, lastName });
        if (existingPlayer) {
            return res.status(400).send('Player already exists');
        }
        // Attempt to create the player
        const player = yield db_1.Player.create({ firstName, lastName, quantity, value });
        res.json({ player, message: 'Player added successfully' });
    }
    catch (error) {
        // Log the specific error
        console.error('Error adding player:', error);
        res.status(500).send('Failed to add player');
    }
}));
playerRouter.put('/updatePlayer/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity) {
        return res.status(400).send('Quantity is required.');
    }
    try {
        const player = yield db_1.Player.findByIdAndUpdate(id, { quantity }, { new: true });
        res.json(player);
    }
    catch (err) {
        console.error('Error updating player:', err);
        res.status(500).send('Failed to update player');
    }
}));
playerRouter.put('/updatePlayerValue/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { value } = req.body;
    if (!value) {
        return res.status(400).send('Value is required.');
    }
    try {
        const player = yield db_1.Player.findByIdAndUpdate(id, { value }, { new: true });
        res.json(player);
    }
    catch (err) {
        console.error('Error updating player:', err);
        res.status(500).send('Failed to update player');
    }
}));
//////delete player
playerRouter.delete('/deletePlayer/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield db_1.Player.findByIdAndDelete(id);
        res.send('Player deleted successfully');
    }
    catch (err) {
        console.error('Error deleting player:', err);
        res.status(500).send('Failed to delete player');
    }
})); //////delete player
///Get player by id
playerRouter.get('/getPlayer/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const player = yield db_1.Player.findById(id);
        res.json(player);
    }
    catch (err) {
        console.error('Error fetching player:', err);
        res.status(500).send('Failed to fetch player');
    }
})); ////Get player by id
playerRouter.get('/getallplayers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield db_1.Player.find({});
        res.json(players);
    }
    catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).send('Failed to fetch players.');
    }
}));
exports.default = playerRouter;
