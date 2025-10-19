const mongoose = require('mongoose');
const dailyUseItem = new mongoose.Schema({
    name: {
        type: String,
    },
    amount: { type: Number, default: 0 },
    createdAt: { type: Number, default: 0 },
});
const dailyLedgerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.ObjectId, ref: 'user' },
    name: {
        type: String,
        required: true,
        trim: true
    },
    two_d: { type: Number, default: 0 },
    three_d_baht: { type: Number, default: 0 },
    three_d_kyat: { type: Number, default: 0 },
    lao: { type: Number, default: 0 },
    pre_pay: { type: Number, default: 0 },
    apar: { type: Number, default: 0 },
    six_d: { type: Number, default: 0 },
    cash_thai: { type: Number, default: 0 },
    withdraw_thai: { type: Number, default: 0 },
    items: {
        type: [dailyUseItem],
        default: null
    },
});

module.exports = mongoose.model('daily_ledger', dailyLedgerSchema);