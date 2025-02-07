const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    ticket: {
        number: { type: String, required: true },
        scanner: { type: String, required: true },
        air_simple: { type: Boolean, required: true },
        count: { type: Number, default: 1 },
    },
    amount: {
        ticket: { type: Number, default: 0 },
        income: { type: Number, default: 0 },
        sold_out: { type: Number, default: 0 },
        com: { type: Number, default: 0 },
        promotion: { type: Number, default: 0 },
        cash: { type: Number, default: 0 },
    },
    income: {
        user_id: { type: Schema.ObjectId, ref: 'user' },
        name: { type: String, default: "" },
    },
    sold_out: {
        type: {
            user_id: { type: Schema.ObjectId, ref: 'user', default: null },
            name: { type: String, default: "" },
        }, default: null
    },
    cash: {
        type: {
            user_id: { type: Schema.ObjectId, ref: 'user', default: null },
            name: { type: String, default: "" },
        }, default: null
    },
    prizes: [{
        title: { type: String, default: "" },
        amount: { type: Number, default: 0 },
        show: { type: Number, default: 0 },
        air_simple: { type: Boolean, default: 0 },
    }],
    win_amount: {
        air: { type: Number, default: 0 },
        simple: { type: Number, default: 0 },
        simple_show: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    status: { type: String, enum: ['ACTIVE', 'DELETE', 'SOLD_OUT', 'LOSE', 'WIN', 'CLOSE', 'CASHED', 'COMPANY'], default: "ACTIVE" },
    contact: { type: String, default: "FT" },
    remark: { type: String, default: "" },
    win_date: { type: Number, default: 0 },
    sold_out_date: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
    // date: {
    //     income: { type: Number, default: 0 },
    //     delete: { type: Number, default: 0 },
    //     sold_out: { type: Number, default: 0 },
    //     cash: { type: Number, default: 0 },
    //     company: { type: Number, default: 0 },
    // }
});
ticketLedgerSchema.index({ "win_date": -1 });
const THAI_LEDGER = MONGO.model('thai_ledger', ticketLedgerSchema);
module.exports = THAI_LEDGER;