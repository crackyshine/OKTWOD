const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const moneyChangeSchema = new Schema({
    agent: {
        id: {type: Schema.ObjectId, ref: 'user'},
        name: {type: String, default: ""},
        open: {type: Number, default: 0},
        close: {type: Number, default: 0},
    },
    status: {
        pay: {type: Number, default: 0},
        withdraw: {type: Number, default: 0},
        air_sold_out: {
            count:{type: Number, default: 0},
            amount:{type: Number, default: 0}
        },
        air_withdraw: {
            count:{type: Number, default: 0},
            amount:{type: Number, default: 0}
        },
        air_transfer: {
            count:{type: Number, default: 0},
            amount:{type: Number, default: 0}
        },
        simple_sold_out: {
            count:{type: Number, default: 0},
            amount:{type: Number, default: 0}
        },
        simple_withdraw: {
            count:{type: Number, default: 0},
            amount:{type: Number, default: 0}
        },
        simple_transfer: {
            count:{type: Number, default: 0},
            amount:{type: Number, default: 0}
        },
    },
    date:{type:Date,default:Date.now}
});
const moneyChangeDB = MONGO.model('money_change', moneyChangeSchema);
module.exports = moneyChangeDB;