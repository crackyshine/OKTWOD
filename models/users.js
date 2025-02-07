const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const userSchema = new Schema({
    name: { type: String, required: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, default: "" },
    is_permission: { type: Boolean, default: false },
    is_owner: { type: Boolean, default: false },
    is_agent: { type: Boolean, default: false },
    own_shop: { type: Boolean, default: false },
    created: { type: Date, default: Date.now() },
    unit: { type: Number, default: 0 },
    lao_apo: { type: Number, default: 14 },
    thai_apo: { type: Number, default: 14 },
    com: {
        air: { type: Number, default: 0 },
        simple: { type: Number, default: 0 },
    },
    pair: [
        {
            count: { type: Number, default: 2 },
            amount: { type: Number, default: 230 }
        }
    ],
    block: {
        baht: { type: Number, default: 0 },
        kyat: { type: Number, default: 0 },
    },
    user_list: [
        {
            device_id: { type: String, default: "" },
            name: { type: String, default: "" },
            confirm: { type: Boolean, default: false }
        }],
    special_seller: { type: Boolean, default: false },
});

const UserDB = MONGO.model('user', userSchema);
module.exports = UserDB;