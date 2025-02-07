const { required } = require('joi');
const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    ticket_id: { type: Schema.ObjectId, ref: 'thai_ledger', required: true },
    remark_history: [{
        name: { type: String, default: true },
        message: { type: String, default: "" }
    }],
    device: {
        income: { type: String, default: "" },
        sold_out: { type: String, default: "" },
        cash: { type: String, default: "" },
        delete: { type: String, default: "" },
    },
    date: {
        win: { type: Number, default: 0 },
        income: { type: Number, default: 0 },
        delete: { type: Number, default: 0 },
        sold_out: { type: Number, default: 0 },
        cash: { type: Number, default: 0 },
        company: { type: Number, default: 0 },
    }
});
ticketLedgerSchema.index({ "date.win": -1 });
const THAI_EXTRA = MONGO.model('thai_extra', ticketLedgerSchema);
module.exports = THAI_EXTRA;