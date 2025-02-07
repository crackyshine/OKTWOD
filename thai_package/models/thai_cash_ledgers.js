const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    user_id: { type: Schema.ObjectId, ref: 'user', required: true },
    name: { type: String, default: "" },
    // win: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     both: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         show: { type: Number, default: 0 },
    //     }
    // },
    // cash: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     both: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         show: { type: Number, default: 0 },
    //     }
    // },
    // to_cash: {
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     both: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     }, simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         show: { type: Number, default: 0 },
    //     }
    // },
    // un_pay_ticket: {
    //     count: { type: Number, default: 0 },
    //     amount: { type: Number, default: 0 },
    // },
    // cash_history: [{
    //     air: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     },
    //     both: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //     }, simple: {
    //         count: { type: Number, default: 0 },
    //         amount: { type: Number, default: 0 },
    //         show: { type: Number, default: 0 },
    //     },
    //     date: { type: Number, default: 0 },
    // }],
    win_amount:{type:Number,default:0},
    cash_history:[Number],
    balance_history: [{
        amount: { type: Number, default: 0 },
        remark: { type: String, default: 0 },
        date: { type: Number, default: 0 },
    }],
    balance: { type: Number, default: 0 },
    win_date: { type: Number, default: 0 },
});
ticketLedgerSchema.index({ "win_date": -1 });
const THAI_CASH_LEDGER = MONGO.model('thai_cash_ledger', ticketLedgerSchema);
module.exports = THAI_CASH_LEDGER;