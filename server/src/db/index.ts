import mongoose from "mongoose";

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb+srv://krishsoni:2203031050659@paytm.aujjoys.mongodb.net/aptos_users');
        console.log('Connected to CrickDB');
    } catch (error) {
        console.error('Error connecting to CrickDB:', error);
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
    playerName: { type: String, unique: true, required: true } 
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
enum OrderStatus {
    Open = 'open',
    Close = 'close',
    Cancel = 'cancel'
}

const orderBookSchema = new mongoose.Schema({
    orderType: { type: String, required: true },
    playerId: { type: String, required: true },
    orderPrice: { type: Number, required: true },
    orderQuantity: { type: Number, required: true },
    privateKey: { type: String, required: true },
    orderStatus: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Open },
    orderTime: { type: Date, default: Date.now }
});
const OrderBook=mongoose.model('OrderBook',orderBookSchema);

export { connectToDatabase, Player, PlayerHistory, User, OrderBook };
