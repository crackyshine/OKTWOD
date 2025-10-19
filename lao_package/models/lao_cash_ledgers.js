const mongoose = require('mongoose');
const balance_history = new mongoose.Schema({
    amount: { type: Number, default: 0 },
    remark: { type: String, default: "" },
    createdAt: { type: Number, default: 0 },
});
const laoCashLedgerSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    win_amount: { type: Number, default: 0 },
    cash_amount: { type: Number, default: 0 },
    shop_amount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    shop_history: {
        type: [balance_history],
        default: null
    },
    balance_history: {
        type: [balance_history],
        default: null
    },
    win_date: { type: Number, required: true },
});

module.exports = mongoose.model('lao_cash_ledger', laoCashLedgerSchema);