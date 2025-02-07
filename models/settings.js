const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const settingSchema = new Schema({
    show_id: { type: Number, default: 0 },
    date: { type: Date, default: Date.now() },
    income: { type: Number, default: 0 },
    sold_out: {
        air: { type: Number, default: 270 },
        simple: { type: Number, default: 110 },
    },
    pair: [
        {
            count: { type: Number, default: 2 },
            amount: { type: Number, default: 230 }
        }
    ],
    open: { type: Boolean, default: false },
    air_count: { type: Number, default: 0 },
    born_count: { type: Number, default: 0 },
    title_one: { type: String, default: "ထီပေါက်စဉ်" },
    title_two: { type: String, default: "ထီနန်းထိုက်" },
    title_three: { type: String, default: "ထီဆုကြီးပေါက်ပါစေ" },
});
const settingDB = MONGO.model('setting', settingSchema);
module.exports = settingDB;
