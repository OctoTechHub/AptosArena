import mongoose from "mongoose";

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb+srv://DevPatils:DevPatils@cluster0.mywzttp.mongodb.net/aptos');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

const playerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    value: { type: Number, default: 0 }
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
});
const User = mongoose.model('User', userSchema);

export { connectToDatabase, Player, PlayerHistory, User };
