const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    number: { type: String, required: true },
    amount: { type: Number, required: true },
    income: {
        user_id: { type: Schema.ObjectId, ref: 'user' },
        name: { type: String, default: "" },
    },
    status: { type: String, enum: ['ACTIVE','DELETE', 'COMPANY'], default: "ACTIVE" },
    contact: { type: String, default: "" },
    remark: { type: String, default: "" },
    cash_date: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
});
ticketLedgerSchema.index({ "income.user_id": -1 });
ticketLedgerSchema.index({ "created": -1 });
const THAI_OTHER_TICKET_LEDGER = MONGO.model('thai_other_ticket_ledger', ticketLedgerSchema);
module.exports = THAI_OTHER_TICKET_LEDGER;