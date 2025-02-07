const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const thatBalanceSchemas = new Schema({
    user_id: { type: Schema.ObjectId, ref: 'user' },
    name: { type: String, required: true },
    voucher_total: { type: Number, default: 0 },
    voucher_cash: { type: Number, default: 0 },
    voucher_to_cash: { type: Number, default: 0 },
    voucher_balance: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    cash: { type: Number, default: 0 },
    to_cash: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    win_date: { type: Date, required: true },
});

const THAI_BALANCE_DB = MONGO.model('thai_balance', thatBalanceSchemas);
module.exports = THAI_BALANCE_DB;