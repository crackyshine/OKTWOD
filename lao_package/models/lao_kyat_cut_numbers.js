const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const laoKyatCutNumberSchema = new Schema({
    name: {type: String, required: true},
    win_date: {type: Date, default: Date.now},
    bet_num: {type: String, default: ""},
    bet_amount: {type: Number, default: 0},
    original_amount: {type: Number, default: 0},
});
const LAO_KYAT_CUT_NUMBER_DB = MONGO.model('lao_kyat_cut_number', laoKyatCutNumberSchema);
module.exports = LAO_KYAT_CUT_NUMBER_DB;