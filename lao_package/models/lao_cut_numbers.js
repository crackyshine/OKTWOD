const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const laoCutNumberSchema = new Schema({
    name: {type: String, required: true},
    win_date: {type: Date, default: Date.now},
    bet_num: {type: String, default: ""},
    bet_amount: {type: Number, default: 0},
    original_amount: {type: Number, default: 0},
});
const LAO_CUT_NUMBER_DB = MONGO.model('lao_cut_number', laoCutNumberSchema);
module.exports = LAO_CUT_NUMBER_DB;