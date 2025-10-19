const mongoose = require('mongoose');

let share_cash_ledger_item = new mongoose.Schema({
    name: { type: String, default: "" },
    six_d: { type: Number, default: 0 },
    back_three_d: { type: Number, default: 0 },
    prices: { type: Number, default: 0 },
    three_d_baht: { type: Number, default: 0 },
    three_d_kyat: { type: Number, default: 0 },
    remark: { type: String, default: "" },
    createdAt: { type: Number, required: true, default: () => { return Math.floor(Date.now() / 1000); } },
});
const shareCashLedgerSchema = new mongoose.Schema({
    items: { type: [share_cash_ledger_item], default: null },
    balance: { type: Number, default: 0 },
    win_date: { type: Number, required: true },
    createdAt: {
        type: Number, required: true, default: () => {
            return Math.floor(Date.now() / 1000);
        }
    },
});

module.exports = mongoose.model('share_cash_ledger', shareCashLedgerSchema);