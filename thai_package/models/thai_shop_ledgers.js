const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    user_id: { type: Schema.ObjectId, ref: 'user', required: true },
    name: { type: String, default: "" },
    // income: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         pair: [{
    //             type: { type: Number, default: 0 },
    //             count: { type: Number, default: 0 },
    //             amount: { type: Number, default: 0 },
    //         }]
    //     },
    // },
    // stock: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         pair: [{
    //             type: { type: Number, default: 0 },
    //             count: { type: Number, default: 0 },
    //             amount: { type: Number, default: 0 },
    //         }]
    //     },
    // },
    // sold_out: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         pair: [{
    //             type: { type: Number, default: 0 },
    //             count: { type: Number, default: 0 },
    //             amount: { type: Number, default: 0 },
    //         }]
    //     },
    // },
    // com: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         pair: [{
    //             type: { type: Number, default: 0 },
    //             count: { type: Number, default: 0 },
    //             amount: { type: Number, default: 0 },
    //         }]
    //     },
    // },
    // promotion: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         pair: [{
    //             type: { type: Number, default: 0 },
    //             count: { type: Number, default: 0 },
    //             amount: { type: Number, default: 0 },
    //         }]
    //     },
    // },
    balance_history: [{
        remark: { type: String, default: 0 },
        amount: { type: Number, default: 0 },
        date: { type: Number, default: 0 },
    }],
    balance: { type: Number, default: 0 },
    win_date: { type: Number, default: 0 },
});
ticketLedgerSchema.index({ "win_date": -1 });
const THAI_SHOP_LEDGER = MONGO.model('thai_shop_ledger', ticketLedgerSchema);
module.exports = THAI_SHOP_LEDGER;