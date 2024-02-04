const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const twoDSettingSchema = new Schema({
    show_id: {type: Number, default: 0},
    morning: [
        {
            start: {type: String, default: "06:00"},
            end: {type: String, default: "10:50"},
        }
    ],
    evening: [
        {
            start: {type: String, default: "12:05"},
            end: {type: String, default: "16:00"},
        }
    ],
    close_minute:{type:Number,default:5},
    block_minute:{type:Number,default:5},
    title_one: {type: String, default: "ထီဆုႀကီးေပါက္ပါေစ"},
    title_two: {type: String, default: "(ထီဆိုင္ႀကီး)"},
    title_three: {type: String, default: "ထိုင္း 2D = 80 ဆ"},
    title_four: {type: String, default: "ကံေကာင္းပါေစ"},
    block_amount: {type: Number, default: 1000},
    block_kyat_amount: {type: Number, default: 1000},
    percent: {type: Number, default: 92},
});
const TwoDSettingDB = MONGO.model('two_d_setting', twoDSettingSchema);
module.exports = TwoDSettingDB;
