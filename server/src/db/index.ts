import mongoose from "mongoose";

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb+srv://krishsoni:2203031050659@paytm.aujjoys.mongodb.net/aptos_users');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

const playerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    value: { type: Number },
    quantity: { type: Number },
    imageUrl: { type: String },
    nationality: { type: String },
    role: { type: String },
    playerName: { type: String, unique: true, required: true } // Example field
});
const Player = mongoose.model('Player', playerSchema);

const playerHistorySchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});
const PlayerHistory = mongoose.model('PlayerHistory', playerHistorySchema);

const userSchema = new mongoose.Schema({
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    stocksOwned: { type: Array, default: [] },
});
const User = mongoose.model('User', userSchema);

export { connectToDatabase, Player, PlayerHistory, User };
