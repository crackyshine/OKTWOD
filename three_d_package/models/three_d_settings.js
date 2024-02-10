const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const threeDSettingSchema = new Schema({
    show_id: {type: Number, default: 0},
    close_time: {type: String, default: "14:00"},
    delete_minute: {type: Number, default: 5},
    title_one: {type: String, default: "ထီဆုႀကီးေပါက္ပါေစ"},
    title_two: {type: String, default: "(ထီဆိုင္ႀကီး)"},
    title_three: {type: String, default: "ထိုင္း 3D = 80 ဆ"},
    title_four: {type: String, default: "လက္မွတ္ပါထီနံပါတ္ႏွဳန္းတိုင္းအတည္ျပဳပါသည္။"},
    block_amount: {type: Number, default: 1000},
    za_amount: {type: Number, default: 1000},
    kyat_block_amount: {type: Number, default: 100},
    kyat_za_amount: {type: Number, default: 100},
    win_date: {type: Date, default: Date.now},
    win_percent: {type: Number, default: 500},
    three_d_cut_amount: {type: Number, default: 0},
    three_d_kyat_cut_amount: {type: Number, default: 0},
    apar: {type: Number, default: 0},
    one_num: {type: Number, default: 0},
});
const THREE_D_SETTING_DB = MONGO.model('three_d_setting', threeDSettingSchema);
module.exports = THREE_D_SETTING_DB;
