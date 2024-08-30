"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const playerRouter_1 = __importDefault(require("./routes/playerRouter"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
(0, db_1.connectToDatabase)();
app.get('/', (req, res) => {
    res.send('Welcome to Aptos Arena!');
});
app.use('/api/user', userRouter_1.default);
app.use('/api/player', playerRouter_1.default);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
