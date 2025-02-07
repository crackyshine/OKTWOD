const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    first_prize: { type: Number, default: 0 },
    first_close_prize: { type: Number, default: 0 },
    first_front_three_prize: { type: Number, default: 0 },
    first_back_three_prize: { type: Number, default: 0 },
    first_back_two_prize: { type: Number, default: 0 },
    second_prize: { type: Number, default: 0 },
    third_prize: { type: Number, default: 0 },
    fourth_prize: { type: Number, default: 0 },
    fifth_prize: { type: Number, default: 0 },
});
const SIMPLE_PRICE_SETTING = MONGO.model('simple_price_setting', ticketLedgerSchema);
module.exports = SIMPLE_PRICE_SETTING;