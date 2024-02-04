const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const promotionSchama = new Schema({
    agent_id: {type: Schema.ObjectId, ref: 'user'},
    name: {type: String, required: true},
    ids: {type: Array, default: []},
    amount: {type: Number, default: 0},
    date: {type: Date, default: Date.now},
});
const promotionDB = MONGO.model('promotion', promotionSchama);
module.exports = promotionDB;