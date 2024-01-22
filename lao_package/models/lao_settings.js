const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const laoSettingSchema = new Schema({
    show_id: { type: Number, default: 0 },
    close_time: { type: String, default: "14:00" },
    delete_minute: { type: Number, default: 5 },
    title_one: { type: String, default: "ထီဆုႀကီးေပါက္ပါေစ" },
    title_two: { type: String, default: "(ထီဆိုင္ႀကီး)" },
    title_three: { type: String, default: "ထိုင္း 3D = 80 ဆ" },
    title_four: { type: String, default: "လက္မွတ္ပါထီနံပါတ္ႏွဳန္းတိုင္းအတည္ျပဳပါသည္။" },
    lao: [{
        type_name: { type: String, required: true },
        amount: { type: Number, required: true },
        amount_k: { type: Number, required: true },
        four_d: { type: Number, required: true },
        three_d: { type: Number, required: true },
        front_three_d: { type: Number, required: true },
        four_permute: { type: Number, required: true },
        three_permute: { type: Number, required: true },
        front_two_d: { type: Number, required: true },
        back_two_d: { type: Number, required: true },
        four_d_k: { type: Number, required: true },
        three_d_k: { type: Number, required: true },
        front_three_d_k: { type: Number, required: true },
        four_permute_k: { type: Number, required: true },
        three_permute_k: { type: Number, required: true },
        front_two_d_k: { type: Number, required: true },
        back_two_d_k: { type: Number, required: true },
        block_count: { type: Number, default: 5 }

    }],
    three_d: {
        block_amount: { type: Number, default: 1000 },
        block_amount_k: { type: Number, default: 1000 },
        win_percent: { type: Number, default: 500 }
    },
    lao_cut_count: {
        prize_one: { type: Number, default: 1 },
        prize_two: { type: Number, default: 1 },
        prize_three: { type: Number, default: 1 },
        prize_four: { type: Number, default: 1 },
    },
    three_d_cut_amount: { type: Number, default: 0 },
    three_d_cut_amount_k: { type: Number, default: 0 },
    win_date: { type: Date, default: Date.now }
});
const LAO_SETTING_DB = MONGO.model('lao_setting', laoSettingSchema);
module.exports = LAO_SETTING_DB;
