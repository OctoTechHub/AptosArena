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
exports.User = exports.PlayerHistory = exports.Player = exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect('mongodb+srv://krishsoni:2203031050659@paytm.aujjoys.mongodb.net/aptos_users');
            console.log('Connected to MongoDB');
        }
        catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    });
}
exports.connectToDatabase = connectToDatabase;
const playerSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    value: { type: Number },
    quantity: { type: Number },
    imageUrl: { type: String },
    nationality: { type: String },
    role: { type: String },
    playerName: { type: String, unique: true, required: true } // Example field
});
const Player = mongoose_1.default.model('Player', playerSchema);
exports.Player = Player;
const playerHistorySchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});
const PlayerHistory = mongoose_1.default.model('PlayerHistory', playerHistorySchema);
exports.PlayerHistory = PlayerHistory;
const userSchema = new mongoose_1.default.Schema({
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    stocksOwned: { type: Array, default: [] },
});
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
