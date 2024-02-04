const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const winChangeMoneySchema = new Schema({
    id: {type: Schema.ObjectId, ref: 'user'},
    name: {type: String, required: true},
    amount: {type: Number, default: 0},
    date: {type: Date, required: true},
});

const WinChangeMoneyDB= MONGO.model('win_change_money', winChangeMoneySchema);
module.exports = WinChangeMoneyDB;