const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const autoIncrement = require('mongoose-auto-increment');
const laoTicketSchema = new Schema({
    voucher_id: {type: Number, required: true},
    amount: {
        bet: {type: Number, required: true},
        win: {type: Number, default: 0},
    },
    agent: {
        id: {type: Schema.ObjectId, ref: 'user'},
        name: {type: String, required: true},
        sold_out_name: {type: String, default: ""},
    },
    items: [{
        num: {type: String},
        bet_amount: {type: Number, required: true},
        win: {
            amount: {type: Number, default: 0},
            str: {type: String, default: ""},
        }
    }],
    status: {
        cash: {type: Boolean, default: false},
        finish: {type: Boolean, default: false}
    },
    delete: {
        is_delete: {type: Boolean, default: false},
        name: {type: String, default: ""},
        date: {type: Date, default: null}
    },
    date: {
        win: {type: Date, default: Date.now},
        created: {type: Date, default: Date.now},
    },
    remark:{type:String,default:""}
});
autoIncrement.initialize(MONGO.connection); // 3. initialize autoIncrement
laoTicketSchema.plugin(autoIncrement.plugin, {
    model: "lao_tickets", // collection or table name in which you want to apply auto increment
    field: "voucher_id", // field of model which you want to auto increment
    startAt: 1, // start your auto increment value from 1
    incrementBy: 1, // incremented by 1
});
const LAO_TICKET_DB = MONGO.model('lao_ticket', laoTicketSchema);
module.exports = LAO_TICKET_DB;