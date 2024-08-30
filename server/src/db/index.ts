import mongoose from "mongoose";

async function connectToDatabase() {
    mongoose.connect('mongodb+srv://krishsoni:2203031050659@paytm.aujjoys.mongodb.net/aptos_users')
        .then(() => console.log('Connected to SecretBase'))
        .catch((err: any) => console.error('MongoDB connection error:', err));
}

const playerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    aptosAccountAddress: { type: String, required: true },
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