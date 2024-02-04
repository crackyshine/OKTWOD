const DB = require('../models/DB');
const UTILS = require('../helpers/Utils');
const VALIDATOR = require('../helpers/validator');
const USER_GEN = require('../CKLibby/UserGen');
const MOMENT = require("moment-timezone");
const _ = require('underscore');

let setDefaultCutNumber = async (name, type, date) => {
    let data = await DB.TwoDCutNumber.find({ $and: [{ name: name }, { type: type }, { win_date: date }] });
    if (!data || data.length == 0) {
        let i = 0;
        while (i < 100) {
            let num = `${i}`.padStart(2, '0');
            await new DB.TwoDCutNumber({
                name: name,
                type: type,
                win_date: date,
                bet_num: num
            }).save();
            i++;
        }
    }
}
let setDefaultCutKyatNumber = async (name, type, date) => {
    let data = await DB.TwoDKyatCutNumber.find({ $and: [{ name: name }, { type: type }, { win_date: date }] });
    if (!data || data.length == 0) {
        let i = 0;
        while (i < 100) {
            let num = `${i}`.padStart(2, '0');
            await new DB.TwoDKyatCutNumber({
                name: name,
                type: type,
                win_date: date,
                bet_num: num
            }).save();
            i++;
        }
    }
}
let check_simple = (win_number, prices, ticket) => {
    let update_data = {
        status: false,
        amount: 0,
        win_title: []
    };
    let check_num = ticket.number;
    let count = ticket.count;
    if (win_number.first_prize.num == check_num) {
        update_data.win_title.push({
            title: prices.first_price,
            amount: win_number.first_prize.amount * count
        });
        update_data.status = true;
        update_data.amount += win_number.first_prize.amount * count;
    }
    win_number.first_close_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.first_near,
                amount: win_number.first_close_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.first_close_prize.amount * count;
        }
    });
    win_number.first_front_three_prize.num.forEach((value) => {
        if (value == check_num.substr(0, 3)) {
            update_data.win_title.push({
                title: prices.upper_three_d,
                amount: win_number.first_front_three_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.first_front_three_prize.amount * count;
        }
    });
    win_number.first_back_three_prize.num.forEach((value) => {
        if (value == check_num.substr(3)) {
            update_data.win_title.push({
                title: prices.below_three_d,
                amount: win_number.first_back_three_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.first_back_three_prize.amount * count;
        }
    });
    if (win_number.first_back_two_prize.num == check_num.substr(4)) {
        update_data.win_title.push({
            title: prices.below_two_d,
            amount: win_number.first_back_two_prize.amount * count
        });
        update_data.status = true;
        update_data.amount += win_number.first_back_two_prize.amount * count;
    }
    win_number.second_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.second_price,
                amount: win_number.second_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.second_prize.amount * count;
        }
    });
    win_number.third_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.third_price,
                amount: win_number.third_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.third_prize.amount * count;
        }
    });
    win_number.fourth_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.fourth_price,
                amount: win_number.fourth_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.fourth_prize.amount * count;
        }
    });
    win_number.fifth_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.fifth_price,
                amount: win_number.fifth_prize.amount * count
            });
            update_data.status = true;
            update_data.amount += win_number.fifth_prize.amount * count;
        }
    });
    return update_data;
}
let check_air = (win_number, first_three_permute, first_two_permute, prices, ticket) => {
    let update_data = {
        status: false,
        amount: 0,
        win_title: []
    };
    let check_num = ticket.number;
    if (win_number.first_prize.num == check_num) {
        update_data.win_title.push({
            title: prices.first_price.six_d.title,
            amount: prices.first_price.six_d.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.six_d.amount;
    } else if (win_number.first_prize.num.substr(1) == check_num.substr(1)) {
        update_data.win_title.push({
            title: prices.first_price.back_five_d.title,
            amount: prices.first_price.back_five_d.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.back_five_d.amount;
    } else if (win_number.first_prize.num.substr(3) == check_num.substr(3)) {
        update_data.win_title.push({
            title: prices.first_price.back_three_d.title,
            amount: prices.first_price.back_three_d.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.back_three_d.amount;
    } else if (win_number.first_prize.num.substr(0, 5) == check_num.substr(0, 5)) {
        update_data.win_title.push({
            title: prices.first_price.front_five_d.title,
            amount: prices.first_price.front_five_d.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.front_five_d.amount;
    } else if (win_number.first_close_prize.num[0].substr(3) == check_num.substr(3) || win_number.first_close_prize.num[1].substr(3) == check_num.substr(3)) {
        update_data.win_title.push({
            title: prices.first_price.back_three_near.title,
            amount: prices.first_price.back_three_near.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.back_three_near.amount;
    } else if (first_three_permute.includes(check_num.substr(3))) {
        update_data.win_title.push({
            title: prices.first_price.back_three_permute.title,
            amount: prices.first_price.back_three_permute.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.back_three_permute.amount;
    } else if (win_number.first_prize.num.substr(4) == check_num.substr(4)) {
        update_data.win_title.push({
            title: prices.first_price.back_two_d.title,
            amount: prices.first_price.back_two_d.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.back_two_d.amount;
    } else if (first_two_permute.includes(check_num.substr(4))) {
        update_data.win_title.push({
            title: prices.first_price.back_two_permute.title,
            amount: prices.first_price.back_two_permute.amount
        });
        update_data.status = true;
        update_data.amount += prices.first_price.back_two_permute.amount;
    }

    win_number.second_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.second_price.six_d.title,
                amount: prices.second_price.six_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.second_price.six_d.amount;
        }
        if (value.substr(0, 5) == check_num.substr(0, 5)) {
            update_data.win_title.push({
                title: prices.second_price.front_five_d.title,
                amount: prices.second_price.front_five_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.second_price.front_five_d.amount;
        }
        if (value.substr(1) == check_num.substr(1)) {
            update_data.win_title.push({
                title: prices.second_price.back_five_d.title,
                amount: prices.second_price.back_five_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.second_price.back_five_d.amount;
        }
        if (value.substr(2) == check_num.substr(2)) {
            update_data.win_title.push({
                title: prices.second_price.back_four_d.title,
                amount: prices.second_price.back_four_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.second_price.back_four_d.amount;
        }
        if (UTILS.isThreeEqual(value.substr(3))) {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.second_price.back_three_equal.title,
                    amount: prices.second_price.back_three_equal.amount
                });
                update_data.status = true;
                update_data.amount += prices.second_price.back_three_equal.amount;
            } else {
                if (value.substr(4) == check_num.substr(4)) {
                    update_data.win_title.push({
                        title: prices.second_price.back_two_d.title,
                        amount: prices.second_price.back_two_d.amount
                    });
                    update_data.status = true;
                    update_data.amount += prices.second_price.back_two_d.amount;
                }
            }
        } else {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.second_price.back_three_d.title,
                    amount: prices.second_price.back_three_d.amount
                });
                update_data.status = true;
                update_data.amount += prices.second_price.back_three_d.amount;
            }
            if (value.substr(4) == check_num.substr(4)) {
                update_data.win_title.push({
                    title: prices.second_price.back_two_d.title,
                    amount: prices.second_price.back_two_d.amount
                });
                update_data.status = true;
                update_data.amount += prices.second_price.back_two_d.amount;
            }
        }

    });

    win_number.third_prize.num.forEach((value) => {
        if (value == check_num) {
            update_data.win_title.push({
                title: prices.third_price.six_d.title,
                amount: prices.third_price.six_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.third_price.six_d.amount;
        }
        if (value.substr(1) == check_num.substr(1)) {
            update_data.win_title.push({
                title: prices.third_price.back_five_d.title,
                amount: prices.third_price.back_five_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.third_price.back_five_d.amount;
        }
        if (value.substr(2) == check_num.substr(2)) {
            update_data.win_title.push({
                title: prices.third_price.back_four_d.title,
                amount: prices.third_price.back_four_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.third_price.back_four_d.amount;
        }
        if (UTILS.isThreeEqual(value.substr(3))) {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.third_price.back_three_equal.title,
                    amount: prices.third_price.back_three_equal.amount
                });
                update_data.status = true;
                update_data.amount += prices.third_price.back_three_equal.amount;
            }
        } else {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.third_price.back_three_d.title,
                    amount: prices.third_price.back_three_d.amount
                });
                update_data.status = true;
                update_data.amount += prices.third_price.back_three_d.amount;
            }
        }
    });
    win_number.fourth_prize.num.forEach((value) => {
        if (value.substr(1) == check_num.substr(1)) {
            update_data.win_title.push({
                title: prices.fourth_price.back_five_d.title,
                amount: prices.fourth_price.back_five_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.fourth_price.back_five_d.amount;
        }
        if (value.substr(2) == check_num.substr(2)) {
            update_data.win_title.push({
                title: prices.fourth_price.back_four_d.title,
                amount: prices.fourth_price.back_four_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.fourth_price.back_four_d.amount;
        }
        if (UTILS.isThreeEqual(value.substr(3))) {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.fourth_price.back_three_equal.title,
                    amount: prices.fourth_price.back_three_equal.amount
                });
                update_data.status = true;
                update_data.amount += prices.fourth_price.back_three_equal.amount;
            }
        } else {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.fourth_price.back_three_d.title,
                    amount: prices.fourth_price.back_three_d.amount
                });
                update_data.status = true;
                update_data.amount += prices.fourth_price.back_three_d.amount;
            }
        }

    });
    win_number.fifth_prize.num.forEach((value) => {
        if (value.substr(1) == check_num.substr(1)) {
            update_data.win_title.push({
                title: prices.fifth_price.back_five_d.title,
                amount: prices.fifth_price.back_five_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.fifth_price.back_five_d.amount;
        }
        if (value.substr(2) == check_num.substr(2)) {
            update_data.win_title.push({
                title: prices.fifth_price.back_four_d.title,
                amount: prices.fifth_price.back_four_d.amount
            });
            update_data.status = true;
            update_data.amount += prices.fifth_price.back_four_d.amount;
        }
        if (UTILS.isThreeEqual(value.substr(3))) {
            if (value.substr(3) == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.fifth_price.back_three_equal.title,
                    amount: prices.fifth_price.back_three_equal.amount
                });
                update_data.status = true;
                update_data.amount += prices.fifth_price.back_three_equal.amount;
            }
        }

    });
    win_number.first_back_three_prize.num.forEach((value) => {
        let value_three_permute = UTILS.permute(value);
        if (UTILS.isThreeEqual(value)) {
            if (value == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.below_price.below_three_equal.title,
                    amount: prices.below_price.below_three_equal.amount
                });
                update_data.status = true;
                update_data.amount += prices.below_price.below_three_equal.amount;
            }
        } else {
            if (value == check_num.substr(3)) {
                update_data.win_title.push({
                    title: prices.below_price.below_three_d.title,
                    amount: prices.below_price.below_three_d.amount
                });
                update_data.status = true;
                update_data.amount += prices.below_price.below_three_d.amount;
            }
            if (value_three_permute.includes(check_num.substr(3))) {
                update_data.win_title.push({
                    title: prices.below_price.below_three_permute.title,
                    amount: prices.below_price.below_three_permute.amount
                });
                update_data.status = true;
                update_data.amount += prices.below_price.below_three_permute.amount;
            }
        }
    });
    if (win_number.first_back_two_prize.num == check_num.substr(4)) {
        update_data.win_title.push({
            title: prices.below_price.below_two_d.title,
            amount: prices.below_price.below_two_d.amount
        });
        update_data.status = true;
        update_data.amount += prices.below_price.below_two_d.amount;
    }
    let back_two_permute = UTILS.permute(win_number.first_back_two_prize.num);
    if (back_two_permute.includes(check_num.substr(4))) {
        update_data.win_title.push({
            title: prices.below_price.below_two_permute.title,
            amount: prices.below_price.below_two_permute.amount
        });
        update_data.status = true;
        update_data.amount += prices.below_price.below_two_permute.amount;
    }

    return update_data;

}
let getMoneyChangeID = async (agent) => {
    let date = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day');
    let money_change = await DB.MoneyChangeDB.findOne({ $and: [{ "agent.id": agent._id }, { date: date }] });
    if (!money_change) {
        money_change = new DB.MoneyChangeDB();
        money_change.agent.id = agent._id;
        money_change.agent.name = agent.full_name;
        money_change.agent.open = agent.unit;
        money_change.agent.close = agent.unit;
        money_change.date = date;
        await money_change.save();
    }
    return money_change._id;
}
let all_agent = async (req, res) => {
    try {
        let data = await DB.UserDB.find({}).select('-password -token');
        res.send({ status: 1, data });
    } catch (e) {
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getEditUser = async (req, res) => {
    try {
        let user_id = req.body.user_id;
        let data = await DB.UserDB.findOne({ _id: user_id }).select('-password -token');
        res.send({ status: 1, data });
    } catch (e) {
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let agent_list = async (req, res) => {
    try {
        let data = await DB.UserDB.find({}).select('_id full_name com unit is_permission');
        res.send({ status: 1, data });
    } catch (e) {
        res.send({ status: 0, msg: process.env.connect_dev });
    }

}
let register_user = async (req, res) => {
    try {
        let name = req.body.name;
        let full_name = req.body.full_name;
        let simple_com = req.body.simple_com;
        let air_com = req.body.air_com;
        let is_permission = req.body.is_permission;
        if (!name || !full_name || isNaN(simple_com) || isNaN(air_com) || typeof is_permission != "boolean") {
            res.send({ status: 0, msg: "အကောင့်တည်ဆောက်တာမှားယွင်းနေပါသည်။" });
            return;
        }
        let count = await DB.UserDB.find({ name: name }).countDocuments();
        if (count > 0) {
            res.send({ status: 0, msg: name + " ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။" });
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (air_com < setting.income || simple_com < setting.income) {
            res.send({ status: 0, msg: "ရောင်းကြေးကို " + setting.income + " ထက် လျော့ ပေးလို့မရပါဘူး" });
            return;
        }
        let data = new DB.UserDB();
        data.password = UTILS.encodePassword("Asdf123");
        data.token = VALIDATOR.genToken(data._id);
        data.name = name;
        data.full_name = full_name;
        data.com.air = air_com;
        data.com.simple = simple_com;
        data.is_permission = is_permission;
        await data.save();
        res.send({ status: 1, msg: full_name + " တည်ဆောက်တာအောင်မြင်ပါသည်" });
    } catch (err) {
        console.log("Error Register user => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let update_user = async (req, res) => {
    try {
        let user_id = req.body.user_id;
        let name = req.body.name;
        let full_name = req.body.full_name;
        let simple_com = req.body.simple_com;
        let air_com = req.body.air_com;
        let baht = req.body.baht;
        let kyat = req.body.kyat;
        let lao_apo = req.body.lao_apo;
        let thai_apo = req.body.thai_apo;
        let is_agent = req.body.is_agent;
        let special_seller = req.body.special_seller;
        if (!user_id || !UTILS.is_mongo(user_id) || !name || !full_name || isNaN(simple_com) || isNaN(air_com) || isNaN(baht) || isNaN(kyat) || isNaN(lao_apo) || isNaN(thai_apo) || typeof is_agent != "boolean" || typeof special_seller != "boolean") {
            res.send({ status: 0, msg: "အကောင့်ချိန်းတာမှားယွင်းနေပါသည်။" });
            return;
        }
        let count = await DB.UserDB.find({ $and: [{ _id: { $ne: user_id } }, { name: name }] }).countDocuments();
        if (count > 0) {
            res.send({ status: 0, msg: name + " ဖြင့် အကောင့်ရှိပြီးသားဖြစ်ပါသည်။" });
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (air_com < setting.income || simple_com < setting.income) {
            res.send({ status: 0, msg: "ရောင်းကြေးကို " + setting.income + " ထက် လျော့ ပေးလို့မရပါဘူး" });
            return;
        }
        let update_user = await DB.UserDB.findOne({ _id: user_id });
        if (update_user) {
            let update_data = {
                name: name,
                full_name: full_name,
                com: {
                    air: air_com,
                    simple: simple_com,
                },
                block: {
                    baht: baht,
                    kyat: kyat
                },
                lao_apo: lao_apo,
                thai_apo: thai_apo,
                is_agent: is_agent,
                special_seller: special_seller,
            };
            await DB.UserDB.updateOne({ _id: update_user._id }, { $set: update_data });
            res.send({ status: 1, msg: full_name + " အကောင့်ချိန်းတာအောင်မြင်ပါသည်။" });
        } else {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်" });
        }
    } catch (err) {
        console.log("Error Update user => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateDevice = async (req, res) => {
    try {
        let user_id = req.body.user_id;
        let name = req.body.name;
        let confirm = req.body.confirm;
        let device_id = req.body.device_id;
        let update_user = await DB.UserDB.findOne({ _id: user_id });
        if (update_user) {
            await DB.UserDB.updateOne({ $and: [{ _id: update_user._id }, { "user_list.device_id": device_id }] },
                {
                    $set: {
                        "user_list.$.device_id": device_id,
                        "user_list.$.name": name,
                        "user_list.$.confirm": confirm,
                    }
                });
            res.send({ status: 1, msg: "အောင်မြင်ပါသည်။" });
        } else {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်" });
        }
    } catch (err) {
        console.log("Error Update user => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteDeviceId = async (req, res) => {
    try {
        let user_id = req.body.user_id;
        let device_id = req.body.device_id;
        let update_user = await DB.UserDB.findOne({ _id: user_id });
        if (update_user) {
            await DB.UserDB.updateOne({ _id: update_user._id }, { $pull: { user_list: { device_id: device_id } } }, { safe: true, multi: true });
            res.send({ status: 1, msg: "အောင်မြင်ပါသည်။" });
        } else {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်" });
        }
    } catch (err) {
        console.log("Error Update user => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let delete_user = async (req, res) => {
    try {
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "မှားယွင်းနေပသည်" });
            return;
        }
        let user = await DB.UserDB.findOne({ _id: id });
        if (user) {
            await DB.UserDB.deleteOne({ _id: id });
            res.send({ status: 1, msg: user.full_name + " ကို ဖျတ်ပြီးပါပြီ" });
        } else {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်" });
            return;
        }
    } catch (err) {
        console.log("Error From delete_user => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let setting = async (req, res) => {
    let data = await USER_GEN.setting();

    res.send({ status: data == null ? 0 : 1, data });
}
let twoDSetting = async (req, res) => {
    let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
    let three_d_setting = await DB.THREE_D_SETTING_DB.findOne({ show_id: 0 });
    res.send({ status: 1, data: { setting, three_d_setting } });
}
let priceSetting = async (req, res) => {
    let data = await USER_GEN.priceSetting();
    res.send({ status: data == null ? 0 : 1, data });
}
let getTicketByAgent = async (req, res) => {
    try {
        let id = req.body.id;
        let search_date = req.body.search_date;

        if (!id || !search_date || !UTILS.is_mongo(id) || UTILS.is_date(search_date)) {
            res.send({ status: 0 });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let tickets = await DB.TicketLedgerDB.find({ $and: [{ "agent.id": id }, { "ticket.date": search_date }, { "delete.is_delete": false }] }).sort({ 'agent.date': -1 });
        let data = [];
        for (let tc of tickets) {
            let item = {
                id: tc._id,
                name: tc.agent.name,
                number: tc.ticket.number,
                is_air: tc.ticket.is_air,
                count: tc.ticket.count,
                amount: tc.sold_out.amount,
                date: tc.sold_out.date == null ? "" : MOMENT(tc.sold_out.date).tz("Asia/Rangoon").format("yyyy-MM-DD"),
                is_sold_out: tc.sold_out.is_sold_out,
            }
            data.push(item);
        }
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTicketByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let saveTickets = async (req, res) => {
    try {
        let id = req.body.id;
        let items = req.body.items;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        let agent = await DB.UserDB.findOne({ _id: id });
        if (!agent) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (MOMENT(setting.date).tz("Asia/Rangoon").startOf('day').isBefore(MOMENT(Date.now()).tz("Asia/Rangoon"))) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let save_data = [];

        let can_save = true;
        let msg = "";
        let air_count = 0;
        let simple_count = 0;
        let air_amount = 0;
        let simple_amount = 0;
        for (let item of items) {
            let data = {};
            if (item["is_air"] == true) {
                air_count++;
                air_amount += agent.com.air;
                let exist_count = items.filter(element => element["number"].substr(3) == item["number"].substr(3)).length;
                let pattern = new RegExp(`${item["number"].substr(3)}$`);
                let count = await DB.TicketLedgerDB.find({ $and: [{ "delete.is_delete": false }, { "ticket.date": setting.date }, { "ticket.is_air": true }, { "ticket.number": pattern }] }).countDocuments();
                if ((exist_count + count) > setting.air_count) {
                    let exist_msg = "";
                    let total_msg = "";
                    let server_msg = "";
                    let and_msg = "";
                    if (exist_count > 0) {
                        exist_msg = `စရင်းသွင်းရန် မှတ်ထားတဲ့ထဲတွင် ${exist_count} စောင်`
                    }
                    if (count > 0) {
                        server_msg = `server ထဲတွင် ${count}စောင်`;
                    }
                    if (exist_count > 0 && count > 0) {
                        and_msg = " နှင့်";
                        total_msg = `စုစုပေါင်း ${exist_count + count}စောင်`;
                    }
                    can_save = false;
                    msg = `${item["number"]} ဖြင့် ${exist_msg}${and_msg} ${server_msg} ${total_msg} ရှိနေပါသဖြင့် ထက်စရင်းသွင်း၍ မရနိုင်ပါ။`;
                    break;
                }
            } else {
                simple_count += item["count"];
                simple_amount += item["count"] * agent.com.simple;
            }
            data.ticket = {
                number: item["number"],
                scanner: item["scanner"],
                is_air: item["is_air"],
                count: item["count"],
                amount: setting["income"],
                date: MOMENT(setting.date).tz("Asia/Rangoon").startOf('day')
            };
            data.agent = {
                id: agent._id,
                name: agent.full_name,
                amount: item["is_air"] ? agent.com.air : agent.com.simple,
                date: MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day'),
            };

            data.sold_out = {
                is_sold_out: agent.is_permission ? false : true,
                name: agent.full_name,
                amount: item["is_air"] ? agent.com.air : agent.com.simple,
                date: MOMENT(Date.now()).tz("Asia/Rangoon")
            };
            save_data.push(data);
        }
        if (can_save) {
            let money_change_id = await getMoneyChangeID(agent);
            await DB.MoneyChangeDB.updateOne({ _id: money_change_id }, {
                $inc: {
                    "status.air_sold_out.count": air_count,
                    "status.air_sold_out.amount": -air_amount,
                    "status.simple_sold_out.count": simple_count,
                    "status.simple_sold_out.amount": -simple_amount,
                    "agent.close": -(air_amount + simple_amount),
                }
            });
            let user_unit = air_amount + simple_amount;
            await DB.UserDB.updateOne({ _id: agent._id }, { $inc: { "unit": -user_unit } });
            await DB.TicketLedgerDB.insertMany(save_data);
            res.send({ status: 1, msg: "လက်မှတ်များစရင်းသွင်းပြီးပါပြီ။" });
        } else {
            res.send({ status: 0, msg });
        }
    } catch (err) {
        console.log("Error From saveTickets => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteTicket = async (req, res) => {
    try {
        let auth_user = res.locals.auth_user;
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "မှားယွင်းနေပါသည်။" })
            return;
        }

        let ticket = await DB.TicketLedgerDB.findById(id);
        if (!ticket) {
            res.send({ status: 0, msg: "လက်မှတ် မှားယွင်းနေပါသည်။" })
            return;
        }
        let agent = await DB.UserDB.findById((ticket.agent.id));
        if (agent.is_permission == false || (agent.is_permission == true && ticket.sold_out.is_sold_out == false)) {
            await DB.TicketLedgerDB.updateOne({ _id: ticket._id }, {
                $set: {
                    "delete.is_delete": true,
                    "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon"),
                    "delete.name": auth_user.full_name,
                }
            });
            let agent_money_change_id = await getMoneyChangeID(agent);
            await DB.MoneyChangeDB.updateOne({ _id: agent_money_change_id }, {
                $inc: {
                    "status.air_sold_out.count": ticket.ticket.is_air ? -1 : 0,
                    "status.air_sold_out.amount": ticket.ticket.is_air ? ticket.agent.amount : 0,
                    "status.simple_sold_out.count": ticket.ticket.is_air ? 0 : -1,
                    "status.simple_sold_out.amount": ticket.ticket.is_air ? 0 : ticket.agent.amount,
                    "agent.close": ticket.agent.amount,
                }
            });
            await DB.UserDB.updateOne({ _id: agent._id }, { $inc: { "unit": ticket.agent.amount } });
            res.send({ status: 1, msg: ticket.ticket.number + " ကို အောင်မြင်စွာ ဖျတ်ပြီးပါပြီ။" });
        } else {
            res.send({ status: 0, msg: "ရောင်းပြီးသားလက်မှတ်ကို ဖျတ်လို့မရပါ။" });
        }
    } catch (err) {
        console.log("Error From deleteTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let ticketLedgers = async (req, res) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let data = await DB.TicketLedgerDB.find({
            $and: [{ "delete.is_delete": false }, {
                "agent.date": {
                    $gte: start_date,
                    $lte: end_date
                }
            }]
        });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From ticketLedgers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let ticketLedgerByAgent = async (req, res) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let data = await DB.TicketLedgerDB.find({
            $and: [{ "delete.is_delete": false }, {
                "sold_out.date": {
                    $gte: start_date,
                    $lte: end_date
                },
            }, { "agent.id": auth_user._id }]
        });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let ticketLedgerByAgentID = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let is_cash = req.body.is_cash;
        let is_air = req.body.is_air;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }

        if (typeof is_cash != "boolean" || typeof is_air != "boolean") {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ" });
            return;
        }

        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ satus: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်။" });
            return;
        }

        let agent = await DB.UserDB.findOne({ _id: agent_id });
        if (!agent) {
            res.send({ satus: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်။" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let search_data = {
            $or: [
                {
                    "agent.date": {
                        $gte: start_date,
                        $lte: end_date
                    }
                },
                {
                    "delete.date": {
                        $gte: start_date,
                        $lte: end_date
                    }
                }
            ]
        }

        if (is_cash) {
            if (is_air) {
                search_data = {
                    "air.date": {
                        $gte: start_date,
                        $lte: end_date
                    }
                }
            } else {
                search_data = {
                    "simple.date": {
                        $gte: start_date,
                        $lte: end_date
                    }
                }
            }
        }

        let data = await DB.TicketLedgerDB.find({
            $and: [search_data, { "agent.id": agent._id }]
        });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From ticketLedgerByAgentID => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let sellTickets = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let results = await DB.TicketLedgerDB.find({
            $and: [{ "delete.is_delete": false }, { "ticket.date": search_date }, { "sold_out.is_sold_out": false }]
        });
        let data = [];
        for (let result of results) {
            let item = {
                "id": result._id,
                "agent_id": result.agent.id,
                "name": result.agent.name,
                "number": result.ticket.number,
                "scanner": result.ticket.scanner,
                "count": result.ticket.count,
                "amount": result.sold_out.amount,
                "air": result.ticket.is_air,
                "date": result.agent.date,
                "can_sell": result.agent.id.equals(auth_user._id),
            };
            data.push(item);
        }
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From sellTickets => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let changePassword = async (req, res) => {
    try {
        let user_id = req.body.user_id;
        let old_password = req.body.old_password;
        let new_password = req.body.new_password;
        if (!user_id || !old_password || !new_password || !UTILS.is_mongo(user_id)) {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်။" })
            return;
        }
        let change_user = await DB.UserDB.findOne({ _id: user_id });
        if (change_user) {
            let is_match = UTILS.comparePassword(old_password, change_user.password);
            if (is_match) {
                let change_password = UTILS.encodePassword(new_password);
                await DB.UserDB.updateOne({ _id: change_user._id }, { $set: { password: change_password } });
                res.send({ status: 1, msg: change_user.full_name + " ကို လျှိုဝှက်နံပါတ်ချိန်းပြီးပါပြီ။" })
            } else {
                res.send({ status: 0, msg: "လျှိုဝှက်နံပါတ်မှားယွင်းနေပါသည်။" })
            }
        } else {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်။" })
        }
    } catch (err) {
        console.log("Error From changePassword => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let checkTicket = async (req, res) => {
    try {
        let exist_count = req.body.exist_count;
        let number = req.body.number;
        let scanner = req.body.scanner;
        console.log(req.body);

        if (isNaN(exist_count) || !number || number.length != 6) {
            res.send({ status: 0, msg: "နံပါတ်မှားယွင်းနေပါသည်" });
            return;
        }
        if (!scanner) {
            res.send({ status: 0, msg: "နံပါတ်မှားယွင်းနေပါသည်" });
            return;
        }

        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        let scanCount = await DB.TicketLedgerDB.find({ $and: [{ "delete.is_delete": false }, { "ticket.date": setting.date }, { "ticket.is_air": true }, { "ticket.scanner": scanner }] }).countDocuments();
        if (scanCount > 0) {
            res.send({ status: 0, msg: `${scanner} ဖြင့် စရင်းသွင်းပြီးသွားပါပြီ။` });
            return;
        }
        let pattern = new RegExp(`${number.substr(3)}$`);
        let count = await DB.TicketLedgerDB.find({ $and: [{ "delete.is_delete": false }, { "ticket.date": setting.date }, { "ticket.is_air": true }, { "ticket.number": pattern }] }).countDocuments();
        if ((exist_count + count + 1) > setting.air_count) {
            let exist_msg = "";
            let total_msg = "";
            let server_msg = "";
            let and_msg = "";
            if (exist_count > 0) {
                exist_msg = `စရင်းသွင်းရန် မှတ်ထားတဲ့ထဲတွင် ${exist_count} စောင်`
            }
            if (count > 0) {
                server_msg = `server ထဲတွင် ${count}စောင်`;
            }
            if (exist_count > 0 && count > 0) {
                and_msg = " နှင့်";
                total_msg = `စုစုပေါင်း ${exist_count + count}စောင်`;
            }
            res.send({
                status: 0,
                msg: `${number} ဖြင့် ${exist_msg}${and_msg} ${server_msg} ${total_msg} ရှိနေပါသဖြင့် ထက်စရင်းသွင်း၍ မရနိုင်ပါ။`
            });
            return;
        }
        res.send({ status: 1 });
    } catch (err) {
        console.log("Error From checkTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let sellSingleTicket = async (req, res) => {
    try {
        let ids = req.body.ids;
        let promotion = req.body.promotion;
        let contact = req.body.contact;
        if (!ids) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }

        ids.forEach((item) => {
            if (!item._id || !UTILS.is_mongo(item._id)) {
                res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
                return;
            }
        });
        let items = _.uniq(_.pluck(ids, "_id"));

        if (isNaN(promotion)) {
            res.send({ status: 0, msg: "Promotion တန်ဖိုးမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let tickets = await DB.TicketLedgerDB.find({
            $and: [
                { _id: { $in: Array.from(new Set(items)) } },
                { "agent.id": auth_user._id },
                { "sold_out.is_sold_out": false },
                { "delete.is_delete": false },
            ]
        });
        if (!tickets || tickets.length != items.length) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let strAry = [];
        let count = 0;
        let sold_out_date = MOMENT(Date.now()).tz("Asia/Rangoon");
        for await (let ticket of tickets) {
            await DB.TicketLedgerDB.updateOne({ _id: ticket._id }, {
                $set: {
                    "sold_out.is_sold_out": true,
                    "sold_out.name": contact,
                    "sold_out.date": sold_out_date,
                    "status.promotion": promotion
                }
            });
            strAry.push(ticket.ticket.number);
            count += ticket.sold_out.amount * ticket.ticket.count;
        }
        if (Number(promotion) > 0) {
            let save_promotion = new DB.PromotionDB();
            save_promotion.agent_id = auth_user._id;
            save_promotion.name = auth_user.full_name;
            save_promotion.ids = items;
            save_promotion.amount = promotion;
            save_promotion.date = sold_out_date;
            await save_promotion.save();
        }
        let result = strAry.join(",");
        res.send({
            status: 1,
            msg: `${result} ကို ${count} ဖြင့် ရောင်းပြီးပါပြီ။`
        })
    } catch (err) {
        console.log("Error From sellSingleTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let startCalculate = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        if (auth_user.is_agent == false) {
            res.send({ status: 0, msg: "စာရင်းတိုက်ခွင့်မရှိပါ။" });
            return;
        }

        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let setting_date = MOMENT(setting.date).tz("Asia/Rangoon").startOf('day');
        if (!setting_date.isSame(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.TicketLedgerDB.updateMany({ "ticket.date": search_date }, {
            $set: {
                air: {
                    status: false,
                    amount: 0,
                    cash: false,
                    date: null,
                    win_title: []
                },
                simple: {
                    status: false,
                    amount: 0,
                    cash: false,
                    date: null,
                    win_title: []
                },
                "status.status": 'PENDING',
                "status.finish": false,
            }
        });
        let win_number = await DB.WinNumberDB.findOne({ "date": search_date });
        if (!win_number) {
            res.send({ status: 0, msg: `${search_date.format("yyyy-MM-dd")} ဖြင့် မထွက်သေးပါ` });
            return;
        }
        let tickets = await DB.TicketLedgerDB.find({ $and: [{ "ticket.date": search_date }, { "delete.is_delete": false }] });
        let updateData = [];
        let first_three_permute = UTILS.permute(win_number.first_prize.num.substr(3));
        let first_two_permute = UTILS.permute(win_number.first_prize.num.substr(4));
        let prices = await DB.PriceSettingDB.findOne({ show_id: 0 });
        for (let ticket of tickets) {
            let update_data = {
                id: ticket._id,
                "status.status": "LOSE",
                "status.finish": true,
                "air.status": false,
                "air.amount": 0,
                "air.win_title": [],
                "simple.status": false,
                "simple.amount": 0,
                "simple.win_title": [],
            };
            let simple_update_data = check_simple(win_number, prices.simple, ticket.ticket);
            if (update_data["status.status"] == "LOSE" && simple_update_data.status == true) {
                update_data["status.status"] = "WIN";
            }
            update_data["simple.status"] = simple_update_data.status;
            update_data["simple.amount"] = simple_update_data.amount;
            update_data["simple.win_title"] = simple_update_data.win_title;
            if (ticket.ticket.is_air == true) {
                let air_update_data = check_air(win_number, first_three_permute, first_two_permute, prices.air, ticket.ticket);
                if (update_data["status.status"] == "LOSE" && air_update_data.status == true) {
                    update_data["status.status"] = "WIN";
                }
                update_data["air.status"] = air_update_data.status;
                update_data["air.amount"] = air_update_data.amount;
                update_data["air.win_title"] = air_update_data.win_title;
            }
            updateData.push(update_data);
        }

        for (let data of updateData) {
            let update_id = data.id;
            delete (data.id);
            await DB.TicketLedgerDB.updateOne({ _id: update_id }, { $set: data });
        }

        await DB.TicketLedgerDB.updateMany({ $and: [{ "ticket.date": search_date }, { "delete.is_delete": false }, { "simple.status": false }] }, {
            $set: {
                "simple.cash": true,
                "simple.date": MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day'),
            }
        });
        await DB.TicketLedgerDB.updateMany({ $and: [{ "ticket.date": search_date }, { "delete.is_delete": false }, { "air.status": false }] }, {
            $set: {
                "air.cash": true,
                "air.date": MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day'),
            }
        });
        res.send({ status: 1, msg: "ပေါက်မဲများ တွက်ပြီးပါပြီ" });
    } catch (err) {
        console.log("Error From startCalculate => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashAir = async (req, res) => {
    try {
        let ticket_id = req.body.ticket_id;
        if (!ticket_id || !UTILS.is_mongo(ticket_id)) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TicketLedgerDB.findOne({ _id: ticket_id });
        if (!ticket) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        if (ticket.air.amount <= 0) {
            res.send({ status: 0, msg: `${ticket.ticket.number} တွင် အဲ နိုင်ကြေးမရှိပါ။` });
            return;
        }
        if (!ticket.agent.id.equals(auth_user._id)) {
            res.send({ status: 0, msg: "ဆိုင်မတူရင် ငွေရှင်းလို့မရပါ" })
            return;
        }

        await DB.TicketLedgerDB.updateOne({ _id: ticket._id }, {
            $set: {
                "air.cash": true,
                "air.date": MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day')
            }
        });
        res.send({ status: 1, msg: `${ticket.ticket.number} အဲနိုင်ကြေး ${ticket.air.amount} ကို ငွေရှင်းပြီးပါပြီ` });
    } catch (err) {
        console.log("Error From cashAir => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashSimple = async (req, res) => {
    try {
        let ticket_id = req.body.ticket_id;
        if (!ticket_id || !UTILS.is_mongo(ticket_id)) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TicketLedgerDB.findOne({ _id: ticket_id });
        if (!ticket) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        if (ticket.simple.amount <= 0) {
            res.send({ status: 0, msg: `${ticket.ticket.number} တွင် ရိုးရိုးနိုင်ကြေးမရှိပါ။` });
            return;
        }
        if (!ticket.agent.id.equals(auth_user._id)) {
            res.send({ status: 0, msg: "ဆိုင်မတူရင် ငွေရှင်းလို့မရပါ" })
            return;
        }

        await DB.TicketLedgerDB.updateOne({ _id: ticket._id }, {
            $set: {
                "simple.cash": true,
                "simple.date": MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day')
            }
        });
        res.send({
            status: 1,
            msg: `${ticket.ticket.number} ရိုးရိုးနိုင်ကြေး ${ticket.simple.amount} ကို ငွေရှင်းပြီးပါပြီ`
        });
    } catch (err) {
        console.log("Error From cashSimple => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let refillAmount = async (req, res) => {
    try {
        let id = req.body.id;
        let refill_amount = req.body.refill_amount;
        let remark = req.body.remark;
        let auth_user = res.locals.auth_user;
        if (!id || !UTILS.is_mongo(id) || isNaN(refill_amount)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        let agent = await DB.UserDB.findOne({ _id: id }).select('_id full_name unit');
        if (!agent) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်" });
            return;
        }

        let status = "PAY";
        if (refill_amount < 0) {
            status = "WITHDRAW";
        }
        let money_change_id = await getMoneyChangeID(agent);
        let update_data = {}
        if (refill_amount < 0) {
            update_data = {
                $inc: { "agent.close": refill_amount, "status.withdraw": refill_amount },
            };
        } else {
            update_data = {
                $inc: { "agent.close": refill_amount, "status.pay": refill_amount },
            };
        }
        await DB.MoneyChangeDB.updateOne({ _id: money_change_id }, update_data);
        let refill_record = new DB.RefillRecordDB();
        refill_record.agent.id = agent._id;
        refill_record.agent.name = agent.full_name;
        refill_record.agent.open = agent.unit;
        refill_record.agent.amount = refill_amount;
        refill_record.agent.close = agent.unit + refill_amount;
        refill_record.status = status;
        refill_record.creator = auth_user.full_name;
        refill_record.remark = remark;
        await refill_record.save();
        await DB.UserDB.updateOne({ _id: agent._id }, { $inc: { unit: refill_amount } });
        if (status == "PAY") {
            res.send({ status: 1, msg: `${agent.full_name} ကို ငွေ ${refill_amount} သွင်းပြီးပါပြီ` });
        } else {
            res.send({ status: 1, msg: `${agent.full_name} ဆီမှ ငွေ ${Math.abs(refill_amount)} ထုတ်ပြီးပါပြီ` });
        }
    } catch (err) {
        console.log("Error From refillAmount => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let refillRecords = async (req, res) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲ မှားယွင်းနေပါသည်" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let data = await DB.RefillRecordDB.find({ date: { $gte: start_date, $lte: end_date } });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From refillRecords => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let agentLedger = async (req, res) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲ မှားယွင်းနေပါသည်" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let data = await DB.MoneyChangeDB.find({ date: { $gte: start_date, $lte: end_date } });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From agentLedger => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let refillRecordByAgentID = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let is_pay = req.body.is_pay;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date) || !agent_id || !UTILS.is_mongo(agent_id) || typeof is_pay != "boolean") {
            res.send({ status: 0, msg: "မှားယွင်းနေပါသည်" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let pay_search = "PAY";
        if (is_pay == false) {
            pay_search = "WITHDRAW";
        }
        let data = await DB.RefillRecordDB.find({
            $and: [{ date: { $gte: start_date, $lte: end_date } }, { "agent.id": agent_id }, { "status": pay_search }]
        });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From refillRecordByAgentID => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let simpleWinTicket = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let number = req.body.number;
        let scanner = req.body.scanner;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;

        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ် မှားယွင်းနေပါသည်" });
            return;
        }

        if (!number || !scanner) {
            res.send({ status: 0, msg: "နံပါတ်မှားယွင်းနေပါသည်" });
            return;
        }

        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။ " });
            return;
        }

        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');

        let ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { "sold_out.date": { $gte: start_date, $lte: end_date } },
                { "agent.id": agent_id },
                { "simple.status": true },
                { "ticket.scanner": scanner }
            ]
        });
        if (ticket) {
            if (ticket.simple.cash == true) {
                res.send({ status: 0, msg: `${ticket.ticket.number} သည် ငွေရှင်းပြီသား လက်မှတ်ဖြစ်ပါသည်။` });
                return;
            } else {
                res.send({ status: 1, ticket: ticket });
                return;
            }
        }

        ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { "sold_out.date": { $gte: start_date, $lte: end_date } },
                { "agent.id": agent_id },
                { "simple.status": true },
                { "ticket.number": number }
            ]
        });
        if (ticket) {
            if (ticket.simple.cash == true) {
                res.send({ status: 0, msg: `${ticket.ticket.number} သည် ငွေရှင်းပြီသား လက်မှတ်ဖြစ်ပါသည်။` });
                return;
            } else {
                res.send({ status: 1, ticket: ticket });
                return;
            }
        }
        res.send({ status: 0, msg: `${number} ဖြင့် လက်မှတ်မရှိပါ။` });
    } catch (err) {
        console.log("Error From simpleWinTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashSimpleTicket = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let items = req.body.items;
        let update_items = [];
        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ် မှားယွင်းနေပါသည်" });
            return;
        }

        if (!items) {
            res.send({ status: 0, msg: "နံပါတ်မှားယွင်းနေပါသည်" });
            return;
        }
        let agent = await DB.UserDB.findOne({ $and: [{ _id: agent_id }, { is_permission: false }] });
        if (!agent) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်" });
            return;
        }

        items.forEach((item) => {
            if (!item || !UTILS.is_mongo(item)) {
                res.send({ status: 0, msg: "နံပါတ်မှားယွင်းနေပါသည်" });
                return;
            }
            update_items.push(item);
        });

        let count = 0;
        let amount = 0;
        let tickets = await DB.TicketLedgerDB.find({
            $and: [
                { _id: { $in: update_items } },
                { "agent.id": agent._id },
            ]
        }).select("ticket simple");
        for (let ticket of tickets) {
            count += ticket.ticket.count;
            amount += ticket.simple.amount;
        }

        let date = MOMENT(Date.now()).tz("Asia/Rangoon");
        let money_change_id = await getMoneyChangeID(agent);
        await DB.MoneyChangeDB.updateOne({ _id: money_change_id }, {
            $inc: {
                "status.simple_withdraw.count": count,
                "status.simple_withdraw.amount": amount,
            }
        });
        await DB.UserDB.updateOne({ _id: agent._id }, { $inc: { "unit": amount } });
        await DB.TicketLedgerDB.updateMany({
            $and: [
                { _id: { $in: update_items } },
                { "agent.id": agent._id },
            ]
        }, {
            $set: {
                "simple.cash": true,
                "simple.date": date,
            }
        });
        res.send({ status: 1, msg: `${agent.full_name} လက်မှတ် ${count}စောင် ပမာဏ ${amount} ကို ငွေရှင်းပြီးပါပြီ` })

    } catch (err) {
        console.log("Error From cashSimpleTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let airWinTicket = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;

        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ် မှားယွင်းနေပါသည်" });
            return;
        }

        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။ " });
            return;
        }

        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');

        let data = await DB.TicketLedgerDB.find({
            $and: [
                { "sold_out.date": { $gte: start_date, $lte: end_date } },
                { "agent.id": agent_id },
                { "air.status": true },
                { "air.cash": false },
            ]
        });
        res.send({ status: 1, data });
        return;
    } catch (err) {
        console.log("Error From airWinTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashAirTicket = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။ " });
            return;
        }

        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ် မှားယွင်းနေပါသည်" });
            return;
        }

        let agent = await DB.UserDB.findOne({ $and: [{ _id: agent_id }, { is_permission: false }] });
        if (!agent) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်" });
            return;
        }


        let count = 0;
        let amount = 0;
        let tickets = await DB.TicketLedgerDB.find({
            $and: [
                { "sold_out.date": { $gte: start_date, $lte: end_date } },
                { "agent.id": agent._id },
                { "air.status": true },
                { "air.cash": false },
            ]
        }).select("ticket air");

        if (tickets.length == 0) {
            res.send({
                status: 0,
                msg: `${req.body.start_date} မှ ${req.body.end_date} အထိ ငွေရှင်းရန် အဲ လက်မှတ်မရှိပါ`
            });
            return;
        }


        for (let ticket of tickets) {
            count += ticket.ticket.count;
            amount += ticket.air.amount;
        }

        let date = MOMENT(Date.now()).tz("Asia/Rangoon");
        let money_change_id = await getMoneyChangeID(agent);
        await DB.MoneyChangeDB.updateOne({ _id: money_change_id }, {
            $inc: {
                "status.air_withdraw.count": count,
                "status.air_withdraw.amount": amount,
            }
        });
        await DB.UserDB.updateOne({ _id: agent._id }, { $inc: { "unit": amount } });
        await DB.TicketLedgerDB.updateMany({
            $and: [
                { "sold_out.date": { $gte: start_date, $lte: end_date } },
                { "agent.id": agent._id },
                { "air.status": true },
                { "air.cash": false },
            ]
        }, {
            $set: {
                "air.cash": true,
                "air.date": date,
            }
        });
        res.send({ status: 1, msg: `${agent.full_name} လက်မှတ် ${count} စောင် ပမာဏ ${amount} ကို ငွေရှင်းပြီးပါပြီ` })
    } catch (err) {
        console.log("Error From cashAirTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateFirstPrize = async (req, res) => {
    try {
        let six_d = req.body.six_d;
        let back_five_d = req.body.back_five_d;
        let back_three_d = req.body.back_three_d;
        let front_five_d = req.body.front_five_d;
        let back_three_near = req.body.back_three_near;
        let back_three_permute = req.body.back_three_permute;
        let back_two_d = req.body.back_two_d;
        let back_two_permute = req.body.back_two_permute;

        if (isNaN(six_d) || isNaN(back_five_d) || isNaN(back_three_d) || isNaN(front_five_d) || isNaN(back_three_near) ||
            isNaN(back_three_permute) || isNaN(back_two_d) || isNaN(back_two_permute)
        ) {
            res.send({ status: 0, msg: "အကွက်အားလုံး ဖြည့်ပါ။" })
            return;
        }
        await DB.PriceSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "air.first_price.six_d.amount": six_d,
                "air.first_price.back_five_d.amount": back_five_d,
                "air.first_price.back_three_d.amount": back_three_d,
                "air.first_price.front_five_d.amount": front_five_d,
                "air.first_price.back_three_near.amount": back_three_near,
                "air.first_price.back_three_permute.amount": back_three_permute,
                "air.first_price.back_two_d.amount": back_two_d,
                "air.first_price.back_two_permute.amount": back_two_permute,
            }
        });
        res.send({ status: 1, msg: "ပထမဆု ဆုကြေးများ ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateFirstPrize => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateSecondPrize = async (req, res) => {
    try {
        let six_d = req.body.six_d;
        let front_five_d = req.body.front_five_d;
        let back_five_d = req.body.back_five_d;
        let back_four_d = req.body.back_four_d;
        let back_three_d = req.body.back_three_d;
        let back_three_equal = req.body.back_three_equal;
        let back_two_d = req.body.back_two_d;

        if (isNaN(six_d) || isNaN(front_five_d) || isNaN(back_five_d) || isNaN(back_four_d) || isNaN(back_three_d) ||
            isNaN(back_three_equal) || isNaN(back_two_d)
        ) {
            res.send({ status: 0, msg: "အကွက်အားလုံး ဖြည့်ပါ။" })
            return;
        }
        await DB.PriceSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "air.second_price.six_d.amount": six_d,
                "air.second_price.front_five_d.amount": front_five_d,
                "air.second_price.back_five_d.amount": back_five_d,
                "air.second_price.back_four_d.amount": back_four_d,
                "air.second_price.back_three_d.amount": back_three_d,
                "air.second_price.back_three_equal.amount": back_three_equal,
                "air.second_price.back_two_d.amount": back_two_d,
            }
        });
        res.send({ status: 1, msg: "ဒုတိယဆု ဆုကြေးများ ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateSecondPrize => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateThirdPrize = async (req, res) => {
    try {
        let six_d = req.body.six_d;
        let back_five_d = req.body.back_five_d;
        let back_four_d = req.body.back_four_d;
        let back_three_d = req.body.back_three_d;
        let back_three_equal = req.body.back_three_equal;

        if (isNaN(six_d) || isNaN(back_five_d) || isNaN(back_four_d) || isNaN(back_three_d) ||
            isNaN(back_three_equal)
        ) {
            res.send({ status: 0, msg: "အကွက်အားလုံး ဖြည့်ပါ။" })
            return;
        }
        await DB.PriceSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "air.third_price.six_d.amount": six_d,
                "air.third_price.back_five_d.amount": back_five_d,
                "air.third_price.back_four_d.amount": back_four_d,
                "air.third_price.back_three_d.amount": back_three_d,
                "air.third_price.back_three_equal.amount": back_three_equal,
            }
        });
        res.send({ status: 1, msg: "တတိယဆု ဆုကြေးများ ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateThirdPrize => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateFourthPrize = async (req, res) => {
    try {
        let back_five_d = req.body.back_five_d;
        let back_four_d = req.body.back_four_d;
        let back_three_d = req.body.back_three_d;
        let back_three_equal = req.body.back_three_equal;

        if (isNaN(back_five_d) || isNaN(back_four_d) || isNaN(back_three_d) || isNaN(back_three_equal)) {
            res.send({ status: 0, msg: "အကွက်အားလုံး ဖြည့်ပါ။" })
            return;
        }
        await DB.PriceSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "air.fourth_price.back_five_d.amount": back_five_d,
                "air.fourth_price.back_four_d.amount": back_four_d,
                "air.fourth_price.back_three_d.amount": back_three_d,
                "air.fourth_price.back_three_equal.amount": back_three_equal,
            }
        });
        res.send({ status: 1, msg: "စတုတ္ထဆု ဆုကြေးများ ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateFourthPrize => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateFifthPrize = async (req, res) => {
    try {
        let back_five_d = req.body.back_five_d;
        let back_four_d = req.body.back_four_d;
        let back_three_equal = req.body.back_three_equal;

        if (isNaN(back_five_d) || isNaN(back_four_d) || isNaN(back_three_equal)) {
            res.send({ status: 0, msg: "အကွက်အားလုံး ဖြည့်ပါ။" })
            return;
        }
        await DB.PriceSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "air.fifth_price.back_five_d.amount": back_five_d,
                "air.fifth_price.back_four_d.amount": back_four_d,
                "air.fifth_price.back_three_equal.amount": back_three_equal,
            }
        });
        res.send({ status: 1, msg: "ပဉ္စမဆု ဆုကြေးများ ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateFifthPrize => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateBelowPrize = async (req, res) => {
    try {
        let below_three_d = req.body.below_three_d;
        let below_three_permute = req.body.below_three_permute;
        let below_three_equal = req.body.below_three_equal;
        let below_two_d = req.body.below_two_d;
        let below_two_permute = req.body.below_two_permute;

        if (isNaN(below_three_d) || isNaN(below_three_permute) || isNaN(below_three_equal) || isNaN(below_two_d) || isNaN(below_two_permute)) {
            res.send({ status: 0, msg: "အကွက်အားလုံး ဖြည့်ပါ။" })
            return;
        }
        await DB.PriceSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "air.below_price.below_three_d.amount": below_three_d,
                "air.below_price.below_three_permute.amount": below_three_permute,
                "air.below_price.below_three_equal.amount": below_three_equal,
                "air.below_price.below_two_d.amount": below_two_d,
                "air.below_price.below_two_permute.amount": below_two_permute,
            }
        });
        res.send({ status: 1, msg: "အောက် ဆုကြေးများ ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateBelowPrize => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateSetting = async (req, res) => {
    try {
        let income = req.body.income;
        let air_count = req.body.air_count;
        let born_count = req.body.born_count;
        let title_one = req.body.title_one;
        let title_two = req.body.title_two;
        let title_three = req.body.title_three;
        let win_date = req.body.win_date;

        if (isNaN(income)) {
            res.send({ status: 0, msg: "မူရင်းစျေးထည့်ရန် လိုအပ်ပါသည်။" });
            return;
        }
        if (isNaN(air_count)) {
            res.send({ status: 0, msg: "အဲ အကန့်အသတ် လိုအပ်ပါသည်။" });
            return;
        }
        if (isNaN(born_count)) {
            res.send({ status: 0, msg: "မွေးဂဏန်း အကန့်အသတ် လိုအပ်ပါသည်။" });
            return;
        }

        if (!win_date || UTILS.is_date(win_date)) {
            res.send({ status: 0, msg: "ထွက်မည့်ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }

        await DB.SettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "income": income,
                "air_count": air_count,
                "born_count": born_count,
                "title_one": title_one,
                "title_two": title_two,
                "title_three": title_three,
                "date": MOMENT(win_date).tz("Asia/Rangoon").startOf('day'),
            }
        });
        res.send({ status: 1, msg: "Setting ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateSetting => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let updateTwoDSetting = async (req, res) => {
    try {
        let title_one = req.body.title_one;
        let title_two = req.body.title_two;
        let title_three = req.body.title_three;
        let title_four = req.body.title_four;
        let block_amount = req.body.block_amount;
        let block_kyat_amount = req.body.block_kyat_amount;
        let percent = req.body.percent;
        let close_minute = req.body.close_minute;
        let block_minute = req.body.block_minute;

        if (block_amount == "") {
            res.send({ status: 0, msg: "အကန့်အသတ် ပမာဏ ထည့်ပါ။" });
            return;
        }
        if (block_kyat_amount == "") {
            res.send({ status: 0, msg: "အကန့်အသတ် ပမာဏ (ကျပ်) ထည့်ပါ။" });
            return;
        }
        if (percent == "") {
            res.send({ status: 0, msg: "ကော်မရှင် ပမာဏ ထည့်ပါ။" });
            return;
        }
        if (close_minute == "" || block_minute == "") {
            res.send({ status: 0, msg: "မှားယွင်းနေပါသည်။" });
            return;
        }


        await DB.TwoDSettingDB.updateOne({ show_id: 0 }, {
            $set: {
                "title_one": title_one,
                "title_two": title_two,
                "title_three": title_three,
                "title_four": title_four,
                "close_minute": close_minute,
                "block_minute": block_minute,
                "block_amount": block_amount,
                "block_kyat_amount": block_kyat_amount,
                "percent": percent,
            }
        });
        res.send({ status: 1, msg: "2D Setting ချိန်းပြီးပါပြီ။" });
    } catch (err) {
        console.log("Error From updateTwoDSetting => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let addBornNumber = async (req, res) => {
    try {
        let name = req.body.name;
        let born_num = req.body.born_num;
        let auth_user = res.locals.auth_user;
        if (!name) {
            res.send({ status: 0, msg: "နံမည်ထည့်ရန်လိုအပ်ပါသည်။" });
            return;
        }
        if (!born_num || born_num.length < 3) {
            res.send({ status: 0, msg: "မွေးဂဏန်းထည့်ရန်လိုအပ်ပါသည်။" });
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        let count = await DB.BornNumberDB.find({ born_num: born_num }).countDocuments();
        if (count >= setting.born_count) {
            res.send({ status: 0, msg: `${born_num} ဖြင့် မွေးဂဏန်း အရေအတွက် ${setting.born_count} ပြည့်သွားပါပြီ။` });
            return;
        }
        let save_data = new DB.BornNumberDB();
        save_data.agent_name = auth_user.name;
        save_data.name = name;
        save_data.born_num = born_num;
        await save_data.save();
        res.send({ status: 1, msg: `${born_num} ကို မွေးဂဏန်းထဲ စရင်းသွင်းပြီးပါပြီ။` });
    } catch (err) {
        console.log("Error From addBornNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getBornNumbers = async (req, res) => {
    try {
        let auth_user = res.locals.auth_user;
        let data = await DB.BornNumberDB.find({ agent_name: auth_user.name });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getBornNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getAllBornNumbers = async (req, res) => {
    try {
        let data = await DB.BornNumberDB.find();
        data = _.sortBy(data, 'born_num');
        data = _.groupBy(data, 'agent_name');
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getAllBornNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteBornNumber = async (req, res) => {
    try {
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "မွေးဂဏန်းမှားယွင်းနေပါသည်။" });
            return;
        }
        let born_num = await DB.BornNumberDB.findOne({ _id: id });
        if (!born_num) {
            res.send({ status: 0, msg: "မွေးဂဏန်းမှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.BornNumberDB.deleteOne({ _id: born_num._id });
        res.send({ status: 1, msg: `${born_num.born_num} ကို ဖျတ်ပြီးပါပြီ။` });
    } catch (err) {
        console.log("Error From deleteBornNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getAllProfit = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 1, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        ;
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = [];
        let tickets = await DB.TicketLedgerDB.find({ "ticket.date": search_date, "delete.is_delete": false });
        for (let d of tickets) {
            if (!data[d.agent.id]) {
                data[d.agent.id] = {
                    agent_id: d.agent.id,
                    name: d.agent.name,
                    simple: {
                        income_count: 0,
                        income_amount: 0,
                        sold_out_count: 0,
                        sold_out_amount: 0,
                        win_count: 0,
                        win_amount: 0,
                        profit: 0,
                    },
                    air: {
                        income_count: 0,
                        income_amount: 0,
                        sold_out_count: 0,
                        sold_out_amount: 0,
                        win_count: 0,
                        win_amount: 0,
                        profit: 0,
                    },
                    balance: {
                        income_count: 0,
                        income_amount: 0,
                        sold_out_count: 0,
                        sold_out_amount: 0,
                        win_count: 0,
                        win_amount: 0,
                        profit: 0,
                    },
                    total: {
                        income_count: 0,
                        income_amount: 0,
                        sold_out_count: 0,
                        sold_out_amount: 0,
                        win_count: 0,
                        win_amount: 0,
                        profit: 0,
                    },
                    date: d.ticket.date,
                };
            }
            let updateData = data[d.agent.id];
            let ticket = d.ticket;
            let agent = d.agent;
            let air = d.air;
            let simple = d.simple;
            let status = d.status;
            let sold_out = d.sold_out;

            if (sold_out.is_sold_out) {
                if (ticket.is_air) {
                    updateData.air.income_count += ticket.count;
                    updateData.air.income_amount -= ticket.count * ticket.amount;
                    updateData.air.sold_out_count += ticket.count;
                    updateData.air.sold_out_amount += ticket.count * agent.amount;
                    updateData.air.profit += ((ticket.count * agent.amount) - ticket.count * ticket.amount);
                    if (air.status) {
                        updateData.air.win_count += ticket.count;
                        updateData.air.win_amount -= air.amount;
                        updateData.total.win_count += ticket.count;
                        updateData.total.win_amount -= air.amount;
                        updateData.air.profit -= air.amount;
                        updateData.total.profit -= air.amount;
                    }
                } else {
                    updateData.simple.income_count += ticket.count;
                    updateData.simple.income_amount -= ticket.count * ticket.amount;
                    updateData.simple.sold_out_count += ticket.count;
                    updateData.simple.sold_out_amount += ticket.count * agent.amount;
                    updateData.simple.profit += ((ticket.count * agent.amount) - ticket.count * ticket.amount);
                    if (simple.status) {
                        updateData.simple.win_count += ticket.count;
                        updateData.simple.win_amount -= simple.amount;
                        updateData.total.win_count += ticket.count;
                        updateData.total.win_amount -= simple.amount;
                        // updateData.simple.profit -=simple.amount;
                        // updateData.total.profit -=simple.amount;
                    }
                }
                updateData.total.income_count += ticket.count;
                updateData.total.income_amount -= ticket.count * ticket.amount;
                updateData.total.sold_out_count += ticket.count;
                updateData.total.sold_out_amount += ticket.count * agent.amount;
                updateData.total.profit += ((ticket.count * agent.amount) - ticket.count * ticket.amount);
            } else {
                updateData.balance.income_count += ticket.count;
                updateData.balance.income_amount -= ticket.count * ticket.amount;
                updateData.total.income_count += ticket.count;
                updateData.total.income_amount -= ticket.count * ticket.amount;
                updateData.balance.profit -= (ticket.count * ticket.amount);
                updateData.total.profit -= (ticket.count * ticket.amount);
                if (simple.status) {
                    updateData.balance.win_count += ticket.count;
                    updateData.balance.win_amount += simple.amount;
                    updateData.total.win_count += ticket.count;
                    updateData.total.win_amount += simple.amount;
                    updateData.balance.profit += simple.amount;
                    updateData.total.profit += simple.amount;
                }
            }
        }
        data = _.values(data);
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getAllProfit => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getPrintTicket = async (req, res) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" })
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let tickets = await DB.TicketLedgerDB.find({ $and: [{ "agent.date": { $gte: start_date, $lte: end_date } }, { "delete.is_delete": false }] });
        let data = [];
        for (let ticket of tickets) {
            for (let i = 0; i < ticket.ticket.count; i++) {
                data.push({
                    agent_id: ticket.agent.id,
                    number: ticket.ticket.number,
                    is_air: ticket.ticket.is_air,
                    count: ticket.ticket.count,
                    income: ticket.agent.amount,
                    air_win: ticket.air.amount,
                    simple_win: ticket.simple.amount / ticket.ticket.count,
                    total_win: ticket.air.amount + (ticket.simple.amount / ticket.ticket.count),
                    is_win: (ticket.air.status || ticket.simple.status),
                    is_air_win: ticket.air.status,
                    is_simple_win: ticket.simple.status,
                });
            }
        }
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getPrintTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getImageData = async (req, res) => {
    try {
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        let search_date = MOMENT(setting.date).tz("Asia/Rangoon").startOf('day');
        let users = await DB.UserDB.find({ is_permission: true }).select("_id");
        let ids = _.pluck(users, '_id');
        let tickets = await DB.TicketLedgerDB.find({ $and: [{ "agent.id": { $in: Array.from(new Set(ids)) } }, { "ticket.date": search_date }, { "delete.is_delete": false }] }).select("ticket sold_out");
        let data = [];
        for (let ticket of tickets) {
            data.push({
                number: ticket.ticket.number,
                count: ticket.ticket.count,
                is_air: ticket.ticket.is_air,
                is_sold_out: ticket.sold_out.is_sold_out
            });
        }
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getImageData => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTransferTicket = async (req, res) => {
    try {
        let number = req.body.number;
        let scanner = req.body.scanner;
        if (number == "" || scanner == "") {
            res.send({ status: 0, msg: "နံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        let search_date = MOMENT(setting.date).tz("Asia/Rangoon").startOf('day');
        let ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { "delete.is_delete": false },
                { "ticket.date": search_date },
                { "agent.id": auth_user._id },
                { "ticket.scanner": scanner },
                { "sold_out.is_sold_out": false }
            ]
        });
        if (ticket) {
            res.send({ status: 1, ticket: ticket });
            return;
        }

        ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { "delete.is_delete": false },
                { "ticket.date": search_date },
                { "agent.id": auth_user._id },
                { "ticket.number": number },
                { "sold_out.is_sold_out": false }
            ]
        });

        if (ticket) {
            res.send({ status: 1, ticket: ticket });
        } else {
            res.send({ status: 0, msg: `${number} ဖြင့် လက်မှတ်မရှိပါ။` });
        }
    } catch (err) {
        console.log("Error From getTransferTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let setTransferTicket = async (req, res) => {
    try {
        let items = req.body.items;
        let agent_id = req.body.agent_id;
        if (agent_id == "" || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "လွဲပြောင်းမည့် agent မှားယွင်းနေပါသည်။" })
            return;
        }
        if (!items) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }

        let auth_user = res.locals.auth_user;
        let transfer_user = await DB.UserDB.findById(agent_id);
        if (!transfer_user) {
            res.send({ status: 0, msg: "လွဲပြောင်းမည့် agent မှားယွင်းနေပါသည်။" });
            return;
        }
        items = _.uniq(_.pluck(items, "_id"));
        let server_items = await DB.TicketLedgerDB.find({
            $and: [
                { "delete.is_delete": false },
                { "agent.id": auth_user._id },
                { _id: { $in: Array.from(new Set(items)) } }
            ]
        });
        let transfer_money = 0;
        let transfer_air = 0;
        let transfer_simple = 0;
        let transfer_air_ids = [];
        let transfer_simple_ids = [];
        let agent_money = 0;
        let agent_air = 0;
        let agent_simple = 0;
        let simple_count = 0;
        let air_count = 0;
        let count = 0;
        let sold_out_date = MOMENT(Date.now()).tz("Asia/Rangoon");
        for await (let item of server_items) {
            transfer_money += (item.ticket.is_air ? transfer_user.com.air : transfer_user.com.simple) * item.ticket.count;
            transfer_air += (item.ticket.is_air) ? (transfer_user.com.air * item.ticket.count) : 0;
            transfer_simple += item.ticket.is_air ? 0 : (transfer_user.com.simple * item.ticket.count);
            agent_money += item.agent.amount * item.ticket.count;
            agent_air += item.ticket.is_air ? (item.agent.amount * item.ticket.count) : 0;
            agent_simple += item.ticket.is_air ? 0 : (item.agent.amount * item.ticket.count);
            count += item.ticket.count;
            air_count += item.ticket.is_air ? item.ticket.count : 0;
            simple_count += item.ticket.is_air ? 0 : items.ticket.count;
            if (item.ticket.is_air) {
                transfer_air_ids.push(item._id);
            } else {
                transfer_simple_ids.push(item._id);
            }
            if (transfer_user.is_permission == false) {
                await DB.TicketLedgerDB.findByIdAndUpdate(item._id, {
                    "delete.is_delete": true,
                    "delete.name": auth_user.full_name,
                    "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
                });
                item = item.toObject();
                delete item._id;
                item.agent.id = transfer_user._id;
                item.agent.name = transfer_user.full_name;
                item.agent.amount = item.ticket.is_air ? transfer_user.com.air : transfer_user.com.simple;
                item.agent.date = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('day');
                item.sold_out.is_sold_out = transfer_user.is_permission ? false : true;
                item.sold_out.name = transfer_user.full_name;
                item.sold_out.amount = item.ticket.is_air ? transfer_user.com.air : transfer_user.com.simple;
                item.sold_out.date = sold_out_date;
                await new DB.TicketLedgerDB(item).save();
            }
        }
        await new DB.TransferDB({
            from: {
                id: auth_user._id,
                name: auth_user.full_name,
            },
            to: {
                id: transfer_user._id,
                name: transfer_user.full_name,
            },
            air: {
                ids: transfer_air_ids,
                amount: transfer_air
            },
            simple: {
                ids: transfer_simple_ids,
                amount: transfer_simple
            },
            date: sold_out_date,
        }).save();
        if (transfer_user.is_permission == false) {
            let agent_money_change_id = await getMoneyChangeID(auth_user);
            let transfer_money_change_id = await getMoneyChangeID(transfer_user);
            await DB.MoneyChangeDB.updateOne({ _id: agent_money_change_id }, {
                $inc: {
                    "status.air_transfer.count": air_count,
                    "status.air_transfer.amount": agent_air,
                    "status.simple_transfer.count": simple_count,
                    "status.simple_transfer.amount": agent_simple,
                    "agent.close": agent_money,
                }
            });
            await DB.MoneyChangeDB.updateOne({ _id: transfer_money_change_id }, {
                $inc: {
                    "status.air_sold_out.count": air_count,
                    "status.air_sold_out.amount": -transfer_air,
                    "status.simple_sold_out.count": simple_count,
                    "status.simple_sold_out.amount": -transfer_simple,
                    "agent.close": -transfer_money,
                }
            });
            await DB.UserDB.updateOne({ _id: auth_user._id }, { $inc: { "unit": agent_money } });
            await DB.UserDB.updateOne({ _id: transfer_user._id }, { $inc: { "unit": -transfer_money } });
        }
        res.send({
            status: 1,
            msg: `လက်မှတ် အစောင် ${count} ကို ${auth_user.full_name} မှ ${transfer_user.full_name} သို့ အောင်မြင်စွာ လွဲပြောင်းပြီးပါပြီ။`
        })

    } catch (err) {
        console.log("Error From setTransferTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTransferHistory = async (req, res) => {
    try {

        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let data = await DB.TransferDB.find({
            date: {
                $gte: start_date,
                $lte: end_date
            }
        });
        res.send({ status: 1, data })
    } catch (err) {
        console.log("Error From getTransferHistory => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTransferTickets = async (req, res) => {
    try {
        let items = req.body.items;
        if (!items || items.length < 1) {
            res.send({ status: 0, msg: "နံပါတ်မရှိပါ။" })
            return;
        }
        ;
        let ids = _.pluck(items, 'id');
        let data = await DB.TicketLedgerDB.find({ _id: { $in: Array.from(new Set(ids)) } });
        res.send({ status: 1, data })
    } catch (err) {
        console.log("Error From getTransferTickets => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTransferIDS = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let is_air = req.body.is_air;
        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ် မှားယွင်းနေပါသည်။" });
            return;
        }
        if (typeof is_air != "boolean") {
            res.send({ status: 0, msg: "အဲ (သို့မဟုတ်) ရိုးရိုးဖြစ်ရပါမည်။" });
            return;
        }
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');

        let transfers = await DB.TransferDB.find({
            $and: [
                { "from.id": agent_id },
                { date: { $gte: start_date, $lte: end_date } }
            ]
        });
        let data = [];
        for (let transfer of transfers) {
            if (is_air) {
                data = data.concat(transfer.air.ids);
            } else {
                data = data.concat(transfer.simple.ids);
            }
        }
        ;
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTransferIDS => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let DeleteTicketByAgent = async (req, res) => {
    try {
        let agent_id = req.body.agent_id;
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        let auth_user = res.locals.auth_user;
        if (!agent_id || !UTILS.is_mongo(agent_id)) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let agent = await DB.UserDB.findOne({ _id: agent_id });
        if (!agent) {
            res.send({ status: 0, msg: "ကိုယ်စလှယ်မှားယွင်းနေပါသည်။" });
            return;
        }

        let tickets = await DB.TicketLedgerDB.find({
            $and: [
                { "delete.is_delete": false },
                { "agent.id": agent._id },
                { "ticket.date": MOMENT(setting.date).tz("Asia/Rangoon") }
            ]
        });
        let simple_count = 0;
        let simple_amount = 0;
        let air_count = 0;
        let air_amount = 0;
        let amount = 0;
        tickets.forEach((ticket) => {
            if (ticket.ticket.is_air) {
                air_count += ticket.ticket.count;
                air_amount += (ticket.agent.amount * ticket.ticket.count);
            } else {
                simple_count += ticket.ticket.count;
                simple_amount += (ticket.agent.amount * ticket.ticket.count);
            }
            amount += (ticket.agent.amount * ticket.ticket.count);
        });

        await DB.TicketLedgerDB.updateMany(
            {
                $and: [
                    { "delete.is_delete": false },
                    { "agent.id": agent._id },
                    { "ticket.date": MOMENT(setting.date).tz("Asia/Rangoon") }
                ]
            }, {
            $set: {
                "delete.is_delete": true,
                "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon"),
                "delete.name": auth_user.full_name,
            }
        });

        let agent_money_change_id = await getMoneyChangeID(agent);
        await DB.MoneyChangeDB.updateOne({ _id: agent_money_change_id }, {
            $inc: {
                "status.air_sold_out.count": -air_count,
                "status.air_sold_out.amount": air_amount,
                "status.simple_sold_out.count": -simple_count,
                "status.simple_sold_out.amount": simple_amount,
                "agent.close": amount,
            }
        });
        await DB.UserDB.updateOne({ _id: agent._id }, { $inc: { "unit": amount } });
        res.send({
            status: 1,
            msg: `${agent.full_name} ${MOMENT(setting.date).tz("Asia/Rangoon").format("yyyy-MM-DD")} ဖျတ်ပြီးပါပြီ။`
        });

    } catch (err) {
        console.log("Error From DeleteTicketByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let UnSellTicket = async (req, res) => {
    try {
        let ticket_id = req.body.ticket_id;
        if (!ticket_id || !UTILS.is_mongo(ticket_id)) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { _id: ticket_id },
                { "agent.id": auth_user.id },
                { "sold_out.is_sold_out": true }
            ]
        });
        if (!ticket) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်" });
            return;
        }
        await DB.TicketLedgerDB.updateOne({
            $and: [
                { _id: ticket._id },
                { "agent.id": auth_user.id },
                { "sold_out.is_sold_out": true }
            ]
        },
            {
                $set: {
                    "sold_out.is_sold_out": false,
                    "sold_out.name": auth_user.full_name,
                    "status.promotion": 0,
                }
            }
        );
        if (ticket.status.promotion > 0) {
            let promotion = await DB.PromotionDB.findOne({
                $and: [
                    { agent_id: auth_user.id },
                    { date: ticket.sold_out.date }
                ]
            });
            if (promotion) {
                let ids = promotion.ids;
                ids = ids.filter((item) => item != ticket._id);
                if (ids.length == 0) {
                    await DB.PromotionDB.deleteOne({ _id: promotion._id });
                } else {
                    await DB.PromotionDB.updateOne({ _id: promotion._id }, { $set: { ids: ids } });
                }

            }
        }
        res.send({ status: 1, msg: `${ticket.ticket.number} ကို မရောင်းရရန် ထဲ ပြန်ထည့်ပြီးပါပြီ` });
    } catch (err) {
        console.log("Error From UnSellTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let CancelTransferSingleTicket = async (req, res) => {
    try {
        let ticket_id = req.body.ticket_id;
        if (!ticket_id || !UTILS.is_mongo(ticket_id)) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { _id: ticket_id },
                { "agent.id": auth_user._id },
            ]
        });
        if (!ticket) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်" });
            return;
        }
        let transfer_ticket = await DB.TicketLedgerDB.findOne({
            $and: [
                { "ticket.scanner": ticket.ticket.scanner },
                { "delete.is_delete": false }
            ]
        });
        let transfer_user = await DB.UserDB.findOne({ _id: transfer_ticket.agent.id });

        if (transfer_user.is_permission == false) {
            await DB.TicketLedgerDB.deleteOne({ _id: transfer_ticket._id });
            await DB.TicketLedgerDB.updateOne({ _id: ticket._id }, {
                $set: {
                    "delete.is_delete": false,
                    "delete.name": "",
                    "delete.date": null,
                }
            });

            let agent_money_change_id = await getMoneyChangeID(auth_user);
            let transfer_money_change_id = await getMoneyChangeID(transfer_user);
            await DB.MoneyChangeDB.updateOne({ _id: agent_money_change_id }, {
                $inc: {
                    "status.air_transfer.count": ticket.ticket.is_air ? -1 : 0,
                    "status.air_transfer.amount": ticket.ticket.is_air ? -ticket.agent.amount * ticket.ticket.count : 0,
                    "status.simple_transfer.count": ticket.ticket.is_air ? 0 : -ticket.ticket.count,
                    "status.simple_transfer.amount": ticket.ticket.is_air ? 0 : -ticket.agent.amount * ticket.ticket.count,
                    "agent.close": -ticket.agent.amount * ticket.ticket.count,
                }
            });
            await DB.MoneyChangeDB.updateOne({ _id: transfer_money_change_id }, {
                $inc: {
                    "status.air_sold_out.count": transfer_ticket.ticket.is_air ? 1 : 0,
                    "status.air_sold_out.amount": transfer_ticket.ticket.is_air ? transfer_ticket.agent.amount * transfer_ticket.ticket.count : 0,
                    "status.simple_sold_out.count": transfer_ticket.ticket.is_air ? 0 : transfer_ticket.agent.amount,
                    "status.simple_sold_out.amount": transfer_ticket.ticket.is_air ? 0 : transfer_ticket.agent.amount * transfer_ticket.ticket.count,
                    "agent.close": transfer_ticket.agent.amount * transfer_ticket.ticket.count,
                }
            });
            await DB.UserDB.updateOne({ _id: auth_user._id }, { $inc: { "unit": -ticket.agent.amount * ticket.ticket.count } });
            await DB.UserDB.updateOne({ _id: transfer_user._id }, { $inc: { "unit": transfer_ticket.agent.amount * transfer_ticket.ticket.count } });
        }
        let transfer_data = await DB.TransferDB.findOne({
            $and: [
                { "from.id": auth_user._id },
                { date: MOMENT(transfer_ticket.sold_out.date) }
            ]
        });
        if (transfer_data) {
            if (ticket.ticket.is_air) {
                let ids = transfer_data.air.ids;
                ids = ids.filter((item) => item.toString() != ticket._id.toString());
                if (ids.length == 0) {
                    await DB.TransferDB.deleteOne({ _id: transfer_data._id });
                } else {
                    await DB.TransferDB.updateOne({ _id: transfer_data._id }, { $set: { "air.ids": ids } });
                }
            } else {
                let ids = transfer_data.simple.ids;
                ids = ids.filter((item) => item.toString() != ticket._id.toString());
                if (ids.length == 0) {
                    await DB.TransferDB.deleteOne({ _id: transfer_data._id });
                } else {
                    await DB.TransferDB.updateOne({ _id: transfer_data._id }, { $set: { "simple.ids": ids } });
                }
            }
        }
        res.send({ status: 1, msg: `${ticket.ticket.number} ကို လွဲထားသောမှာ ပယ်ဖျတ်ပြီပါပြီ။` });

    } catch (err) {
        console.log("Error From UnSellTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let CancelTransferMultiTicket = async (req, res) => {
    try {
        let transfer_id = req.body.transfer_id;
        if (!transfer_id || !UTILS.is_mongo(transfer_id)) {
            res.send({ status: 0, msg: "မှားယွင်းနေပါသည်။" });
            return;
        }

        let transfer = await DB.TransferDB.findById(transfer_id);
        if (!transfer) {
            res.send({ status: 0, msg: "မှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        if (!transfer.from.id.equals(auth_user._id)) {
            res.send({ status: 0, msg: "အကောင့်မှားယွင်းနေပါသည်။" });
            return;
        }
        let transfer_user = await DB.UserDB.findById(transfer.to.id);
        let ids = transfer.air.ids.concat(transfer.simple.ids);
        if (ids.length == 0) {
            res.send({ status: 0, msg: "မှားယွင်းနေပါသည်။" });
            return;
        }

        let tickets = await DB.TicketLedgerDB.find({ _id: { $in: Array.from(new Set(ids)) } });
        let scanner = tickets.map((ticket) => ticket.ticket.scanner);
        let transfer_tickets = await DB.TicketLedgerDB.find({
            $and: [
                { "ticket.scanner": { $in: Array.from(new Set(scanner)) } },
                { "agent.id": transfer.to.id }
            ]
        });
        if (transfer_user.is_permission == false) {
            let transfer_ids = _.pluck(transfer_tickets, "_id");
            await DB.TicketLedgerDB.deleteMany({ _id: { $in: Array.from(new Set(transfer_ids)) } });
            await DB.TicketLedgerDB.updateMany({ _id: { $in: Array.from(new Set(ids)) } }, {
                "delete.is_delete": false,
                "delete.name": "",
                "delete.date": null,
            });
            let amount = 0;
            let air_amount = 0;
            let air_count = 0;
            let simple_count = 0;
            let simple_amount = 0;

            let transfer_amount = 0;
            let transfer_air_amount = 0;
            let transfer_air_count = 0;
            let transfer_simple_amount = 0;
            let transfer_simple_count = 0;

            tickets.forEach((ticket) => {
                amount += ticket.agent.amount * ticket.ticket.count;
                air_amount += ticket.ticket.is_air ? ticket.agent.amount * ticket.ticket.count : 0;
                air_count += ticket.ticket.is_air ? 1 : 0;
                simple_amount += ticket.ticket.is_air ? 0 : ticket.agent.amount * ticket.ticket.count;
                simple_count += ticket.ticket.is_air ? 0 : 1;
            });

            transfer_tickets.forEach((ticket) => {
                transfer_amount += ticket.agent.amount * ticket.ticket.count;
                transfer_air_amount += ticket.ticket.is_air ? ticket.agent.amount * ticket.ticket.count : 0;
                transfer_air_count += ticket.ticket.is_air ? 1 : 0;
                transfer_simple_amount += ticket.ticket.is_air ? 0 : ticket.agent.amount * ticket.ticket.count;
                transfer_simple_count += ticket.ticket.is_air ? 0 : 1;
            });

            let agent_money_change_id = await getMoneyChangeID(auth_user);
            let transfer_money_change_id = await getMoneyChangeID(transfer_user);

            await DB.MoneyChangeDB.updateOne({ _id: agent_money_change_id }, {
                $inc: {
                    "status.air_transfer.count": -air_count,
                    "status.air_transfer.amount": -air_amount,
                    "status.simple_transfer.count": -simple_count,
                    "status.simple_transfer.amount": -simple_amount,
                    "agent.close": -amount,
                }
            });
            await DB.MoneyChangeDB.updateOne({ _id: transfer_money_change_id }, {
                $inc: {
                    "status.air_transfer.count": transfer_air_count,
                    "status.air_transfer.amount": transfer_air_amount,
                    "status.simple_transfer.count": transfer_simple_count,
                    "status.simple_transfer.amount": transfer_simple_amount,
                    "agent.close": transfer_amount,
                }
            });

            await DB.UserDB.updateOne({ _id: auth_user._id }, { $inc: { "unit": -amount } });
            await DB.UserDB.updateOne({ _id: transfer_user._id }, { $inc: { "unit": transfer_amount } });
        }

        await DB.TransferDB.deleteOne({ _id: transfer._id });
        res.send({
            status: 1,
            msg: `${transfer.from.name} မှ ${transfer.to.name} လွဲထားသော လက်မှတ် ${ids.length} စောင် ကို ပယ်ဖျတ်ပြီးပါပြီ။`
        });

    } catch (err) {
        console.log("Error From CancelTransferMultiTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getPromotionTickets = async (req, res) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || !end_date || UTILS.is_date(start_date) || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        start_date = MOMENT(start_date).tz("Asia/Rangoon").startOf('day');
        end_date = MOMENT(end_date).tz("Asia/Rangoon").endOf('day');
        let data = await DB.PromotionDB.find({ date: { $gte: start_date, $lte: end_date } });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getPromotionTickets => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getPromotionTicketDetail = async (req, res) => {
    try {
        let id = req.body.promotion_id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let promotion = await DB.PromotionDB.findById(id);
        if (!promotion) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" });
            return;
        }

        let data = await DB.TicketLedgerDB.find({ _id: { $in: Array.from(new Set(promotion.ids)) } });
        res.send({ status: 1, data })
    } catch (err) {
        console.log("Error From getPromotionTicketDetail => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let checkTwoDNumbers = async (req, res) => {
    try {
        let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
        let items = req.body.items;
        let auth_user = res.locals.auth_user;
        let confirm = false;
        const { is_close, type, date } = UTILS.getTwoDData(setting);
        // if (is_close && auth_user.is_agent == false) {
        if (is_close) {
            res.send({ status: 0, msg: "လောင်းကြေးပိတ်သွားပါပြီ။" });
            return;
        }
        if (!items || !Array.isArray(items)) {
            res.send({ status: 0, msg: "လောင်းကြေးမှားယွင်းနေပါသည်။" });
            return;
        }
        let data = [];
        for (let item of items) {
            if (item.num.includes(' ')) {
                res.send({ status: 0, msg: `${item.num} မှားယွင်းနေပါသည်။` });
                return;
            }
        }
        for await (let item of items) {
            let response = await DB.TwoDNumberDB.find({ $and: [{ type: type }, { "date.win": date }, { "items.num": item.num }, { "delete.is_delete": false }] });
            let server_amount = 0;
            let old_bet_amount = 0;
            for (let res of response) {
                server_amount += res.items.find(e => e.num == item.num).bet_amount;
                if (res.agent.id.toString() == auth_user._id.toString()) {
                    old_bet_amount += res.items.find(e => e.num == item.num).bet_amount;
                }

            }
            let block_number = await DB.TwoDBlockNumberDB.findOne({ block_num: item.num });
            if (block_number) {
                server_amount += block_number.amount;
            }

            if (data.some(e => e.num === item.num)) {
                for (let d of data) {
                    if (d.num == item.num) {
                        d.bet_amount += item.bet_amount;
                        d.original_amount += item.bet_amount;
                        d.server_amount = server_amount;
                        d.old_bet_amount = old_bet_amount;
                    }
                }
            } else {
                item.server_amount = server_amount;
                item.old_bet_amount = old_bet_amount;
                data.push(item);
            }
        }

        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        for (let d of data) {
            let block_number = await DB.TwoDBlockNumberDB.findOne({ block_num: d.num });
            if (d.server_amount >= setting.block_amount) {
                d.bet_amount = 0;
                confirm = true;
            } else if (block_number && MOMENT(block_number.created).tz("Asia/Rangoon").add(setting.block_minute, 'minutes').isAfter(now) && ((d.bet_amount + d.old_bet_amount) >= auth_user.block.baht)) {
                d.bet_amount = auth_user.block.baht - d.old_bet_amount;
                d.bet_amount = d.bet_amount < 0 ? 0 : d.bet_amount;
                confirm = true;
                if ((d.bet_amount + d.server_amount) > setting.block_amount) {
                    d.bet_amount = setting.block_amount - d.server_amount;
                }
            } else if ((d.bet_amount + d.server_amount) > setting.block_amount) {
                d.bet_amount = setting.block_amount - d.server_amount;
                confirm = true;
            }
            delete d.old_bet_amount;
        }
        res.send({ status: 1, data: { confirm, numbers: data } });
    } catch (err) {
        console.log("Error From checkTwoDNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let checkTwoDKyatNumbers = async (req, res) => {
    try {
        let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
        let items = req.body.items;
        let confirm = false;
        let auth_user = res.locals.auth_user;
        const { is_close, type, date } = UTILS.getTwoDData(setting);
        if (is_close && auth_user.is_agent == false) {
            res.send({ status: 0, msg: "လောင်းကြေးပိတ်သွားပါပြီ။" });
            return;
        }
        if (!items || !Array.isArray(items)) {
            res.send({ status: 0, msg: "လောင်းကြေးမှားယွင်းနေပါသည်။" });
            return;
        }
        let data = [];
        for (let item of items) {
            if (item.num.includes(' ')) {
                res.send({ status: 0, msg: `${item.num} မှားယွင်းနေပါသည်။` });
                return;
            }
        }
        for await (let item of items) {
            let response = await DB.TwoDKyatNumberDB.find({ $and: [{ type: type }, { "date.win": date }, { "items.num": item.num }, { "delete.is_delete": false }] });
            let server_amount = 0;
            let old_bet_amount = 0;
            for (let res of response) {
                server_amount += res.items.find(e => e.num == item.num).bet_amount;
                if (res.agent.id.toString() == auth_user._id.toString()) {
                    old_bet_amount += res.items.find(e => e.num == item.num).bet_amount;
                }
            }
            let block_number = await DB.TwoDBlockKyatNumberDB.findOne({ block_num: item.num });
            if (block_number) {
                server_amount += block_number.amount;
            }

            if (data.some(e => e.num === item.num)) {
                for (let d of data) {
                    if (d.num == item.num) {
                        d.bet_amount += item.bet_amount;
                        d.original_amount += item.bet_amount;
                        d.server_amount = server_amount;
                        d.old_bet_amount = old_bet_amount;
                    }
                }
            } else {
                item.server_amount = server_amount;
                item.old_bet_amount = old_bet_amount;
                data.push(item);
            }
        }

        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        for (let d of data) {
            let block_number = await DB.TwoDBlockKyatNumberDB.findOne({ block_num: d.num });
            if (d.server_amount >= setting.block_kyat_amount) {
                d.bet_amount = 0;
                confirm = true;
            } else if (block_number && MOMENT(block_number.created).tz("Asia/Rangoon").add(setting.block_minute, 'minutes').isAfter(now) && ((d.bet_amount + d.old_bet_amount) >= auth_user.block.kyat)) {
                d.bet_amount = auth_user.block.kyat - d.old_bet_amount;
                d.bet_amount = d.bet_amount < 0 ? 0 : d.bet_amount;
                confirm = true;
                if ((d.bet_amount + d.server_amount) > setting.block_kyat_amount) {
                    d.bet_amount = setting.block_amount - d.server_amount;
                }
            } else if ((d.bet_amount + d.server_amount) > setting.block_kyat_amount) {
                d.bet_amount = setting.block_kyat_amount - d.server_amount;
                confirm = true;
            }
            delete d.old_bet_amount;
        }
        res.send({ status: 1, data: { confirm, numbers: data } });
    } catch (err) {
        console.log("Error From checkTwoDKyatNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let saveTwoDNumber = async (req, res) => {
    try {
        let name = req.body.name;
        let items = req.body.items;
        let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
        let auth_user = res.locals.auth_user;
        const { is_close, type, date } = UTILS.getTwoDData(setting);
        let confirm = false;
        if (is_close && auth_user.is_agent == false) {
            res.send({ status: 0, msg: "လောင်းကြေးပိတ်သွားပါပြီ။" });
            return;
        }
        if (items.length == 0) {
            res.send({ status: 0, msg: "အနည်းဆုံး တစ်ကွက် စာရင်းရှိရပါမည်။" });
            return;
        }
        let total = 0;
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        for (let item of items) {
            if (item.num.includes(' ')) {
                res.send({ status: 0, msg: `${item.num} မှားယွင်းနေပါသည်။` });
                return;
            }
        }
        for await (let item of items) {
            let response = await DB.TwoDNumberDB.find({ $and: [{ type: type }, { "date.win": date }, { "items.num": item.num }, { "delete.is_delete": false }] });
            let server_amount = 0;
            let old_bet_amount = 0;
            for (let res of response) {
                server_amount += res.items.find(e => e.num == item.num).bet_amount;
                if (res.agent.id.toString() == auth_user._id.toString()) {
                    old_bet_amount += res.items.find(e => e.num == item.num).bet_amount;
                }
            }
            let block_number = await DB.TwoDBlockNumberDB.findOne({ block_num: item.num });
            if (block_number) {
                server_amount += block_number.amount;
            }
            if (server_amount >= setting.block_amount) {
                item.bet_amount = 0;
                confirm = true;
            } else if (block_number && MOMENT(block_number.created).tz("Asia/Rangoon").add(setting.block_minute, 'minutes').isBefore(now) && ((item.bet_amount + old_bet_amount) >= auth_user.block.baht)) {
                item.bet_amount = auth_user.block.baht - server_amount;
                confirm = true;
                if ((item.bet_amount + server_amount) > setting.block_amount) {
                    item.bet_amount = setting.block_amount - server_amount;
                }
            } else if ((item.bet_amount + server_amount) > setting.block_amount) {
                item.bet_amount = setting.block_amount - server_amount;
                confirm = true;
            }
        }

        if (confirm) {
            res.send({ status: 1, data: { confirm, numbers: items } });
            return;
        }
        for (let item of items) {
            if ('original_amount' in item) {
                delete item.original_amount;
                item.win_amount = 0;
                total += item.bet_amount;
            }
        }

        let save_data = new DB.TwoDNumberDB();
        save_data.agent.id = auth_user._id;
        save_data.agent.name = auth_user.full_name;
        save_data.agent.sold_out_name = name;
        save_data.items = items;
        save_data.amount.total = total;
        save_data.date.win = date;
        save_data.type = type;
        let save_data_result = await save_data.save();
        await setDefaultCutNumber("Company", type, date);
        for await (let item of items) {
            await DB.TwoDCutNumber.updateOne({
                $and: [
                    { bet_num: item.num },
                    { name: "Company" },
                    { type: type },
                    { win_date: date },
                ]
            }, { $inc: { amount: item.bet_amount } });
        }
        res.send({
            status: 1,
            data: { confirm, numbers: items },
            msg: `${items.length} ကွက် စုစုပေါင်း ${total} ကို စရင်းသွင်းပြီးပါပြီ။`,
            voucher_no: save_data_result.voucher_id.toString().padStart(6, '0'),
            id: save_data_result.id,
            win_date: `${MOMENT(save_data_result.date.win).tz("Asia/Rangoon").format('yyyy-MM-DD')} ( ${save_data_result.type == "MORNING" ? "နံနက္" : "ညေန"} )`,
            bet_time: MOMENT(save_data_result.date.created).tz("Asia/Rangoon").format('hh:mm:ss A'),
        });
    } catch (err) {
        console.log("Error From saveTwoDNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let saveTwoDKyatNumber = async (req, res) => {
    try {
        let name = req.body.name;
        let items = req.body.items;
        let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
        let auth_user = res.locals.auth_user;
        const { is_close, type, date } = UTILS.getTwoDData(setting);
        if (is_close && auth_user.is_agent == false) {
            res.send({ status: 0, msg: "လောင်းကြေးပိတ်သွားပါပြီ။" });
            return;
        }
        if (items.length == 0) {
            res.send({ status: 0, msg: "အနည်းဆုံး တစ်ကွက် စာရင်းရှိရပါမည်။" });
            return;
        }
        let total = 0;
        let confirm = false;
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        for (let item of items) {
            if (item.num.includes(' ')) {
                res.send({ status: 0, msg: `${item.num} မှားယွင်းနေပါသည်။` });
                return;
            }
        }
        for await (let item of items) {
            let response = await DB.TwoDKyatNumberDB.find({ $and: [{ type: type }, { "date.win": date }, { "items.num": item.num }, { "delete.is_delete": false }] });
            let server_amount = 0;
            let old_bet_amount = 0;
            for (let res of response) {
                server_amount += res.items.find(e => e.num == item.num).bet_amount;
                if (res.agent.id.toString() == auth_user._id.toString()) {
                    old_bet_amount += res.items.find(e => e.num == item.num).bet_amount;
                }
            }
            let block_number = await DB.TwoDBlockKyatNumberDB.findOne({ block_num: item.num });
            if (block_number) {
                server_amount += block_number.amount;
            }
            if (server_amount >= setting.block_kyat_amount) {
                item.bet_amount = 0;
                confirm = true;
            } else if (block_number && MOMENT(block_number.created).tz("Asia/Rangoon").add(setting.block_minute, 'minutes').isBefore(now) && ((item.bet_amount + old_bet_amount) >= auth_user.block.kyat)) {
                item.bet_amount = auth_user.block.kyat - server_amount;
                confirm = true;
                if ((item.bet_amount + server_amount) > setting.block_kyat_amount) {
                    item.bet_amount = setting.block_amount - server_amount;
                }
            } else if ((item.bet_amount + server_amount) > setting.block_kyat_amount) {
                item.bet_amount = setting.block_kyat_amount - server_amount;
                confirm = true;
            }
        }
        if (confirm) {
            res.send({ status: 1, data: { confirm, numbers: items } });
            return;
        }
        for (let item of items) {
            if ('original_amount' in item) {
                delete item.original_amount;
                item.win_amount = 0;
                total += item.bet_amount;
            }
        }


        let save_data = new DB.TwoDKyatNumberDB();
        save_data.agent.id = auth_user._id;
        save_data.agent.name = auth_user.full_name;
        save_data.agent.sold_out_name = name;
        save_data.items = items;
        save_data.amount.total = total;
        save_data.date.win = date;
        save_data.type = type;
        let save_data_result = await save_data.save();
        await setDefaultCutKyatNumber("Company", type, date);
        for await (let item of items) {
            await DB.TwoDKyatCutNumber.updateOne({
                $and: [
                    { bet_num: item.num },
                    { name: "Company" },
                    { type: type },
                    { win_date: date },
                ]
            }, { $inc: { amount: item.bet_amount } });
        }
        res.send({
            status: 1,
            msg: `${items.length} ကွက် စုစုပေါင်း ${total} ကို စရင်းသွင်းပြီးပါပြီ။`,
            data: { confirm, numbers: items },
            voucher_no: save_data_result.voucher_id.toString().padStart(6, '0'),
            id: save_data_result.id,
            win_date: `${MOMENT(save_data_result.date.win).tz("Asia/Rangoon").format('yyyy-MM-DD')} ( ${save_data_result.type == "MORNING" ? "နံနက္" : "ညေန"} )`,
            bet_time: MOMENT(save_data_result.date.created).tz("Asia/Rangoon").format('hh:mm:ss A'),
        });
    } catch (err) {
        console.log("Error From saveTwoDKyatNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDNumbers = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDNumberDB.find({ $and: [{ "delete.is_delete": false }, { "date.win": search_date }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDDeleteNumber = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDNumberDB.find({ $and: [{ "delete.is_delete": true }, { "date.win": search_date }, { "agent.id": auth_user._id }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDDeleteNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDKyatNumbers = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDKyatNumberDB.find({ $and: [{ "delete.is_delete": false }, { "date.win": search_date }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDKyatNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDKyatDeleteNumber = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDKyatNumberDB.find({ $and: [{ "delete.is_delete": true }, { "date.win": search_date }, { "agent.id": auth_user._id }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDKyatDeleteNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteTwoDTicket = async (req, res) => {
    try {
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TwoDNumberDB.findOne({ $and: [{ "agent.id": auth_user.id }, { _id: id }, { "delete.is_delete": false }, { "status.finish": false }] });
        if (!ticket) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        if (auth_user.is_agent == false && MOMENT(ticket.date.created).tz("Asia/Rangoon").add(setting.close_minute, 'minutes').isBefore(now)) {
            res.send({ status: 0, msg: "စာရင်း တင်ပြီးသွားသော နံပါတ်များကို ဖျတ်ခွင့်မရှိတော့ပါ။" });
            return;
        }
        await DB.TwoDNumberDB.findByIdAndUpdate(ticket._id, {
            "delete.is_delete": true,
            "delete.name": auth_user.full_name,
            "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
        });

        for await (let item of ticket.items) {
            await DB.TwoDCutNumber.updateOne({
                $and: [
                    { bet_num: item.num },
                    { name: "Company" },
                    { type: ticket.type },
                    { win_date: ticket.date.win },
                ]
            }, { $inc: { amount: -(item.bet_amount) } });
        }

        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${ticket.voucher_id.toString().padStart(6, '0')} ကို ဖျတ်ပြီပါပြီ။`
        });

    } catch (err) {
        console.log("Error From deleteTwoDTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteTwoDKyatTicket = async (req, res) => {
    try {
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TwoDKyatNumberDB.findOne({ $and: [{ "agent.id": auth_user.id }, { _id: id }, { "delete.is_delete": false }, { "status.finish": false }] });
        if (!ticket) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let setting = await DB.TwoDSettingDB.findOne({ show_id: 0 });
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        if (auth_user.is_agent && MOMENT(ticket.date.created).tz("Asia/Rangoon").add(setting.close_minute, 'minutes').isBefore(now)) {
            res.send({ status: 0, msg: "စာရင်း တင်ပြီးသွားသော နံပါတ်များကို ဖျတ်ခွင့်မရှိတော့ပါ။" });
            return;
        }
        await DB.TwoDKyatNumberDB.findByIdAndUpdate(ticket._id, {
            "delete.is_delete": true,
            "delete.name": auth_user.full_name,
            "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
        });

        for await (let item of ticket.items) {
            await DB.TwoDKyatCutNumber.updateOne({
                $and: [
                    { bet_num: item.num },
                    { name: "Company" },
                    { type: ticket.type },
                    { win_date: ticket.date.win },
                ]
            }, { $inc: { amount: -(item.bet_amount) } });
        }

        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${ticket.voucher_id.toString().padStart(6, '0')} ကို ဖျတ်ပြီပါပြီ။`
        });

    } catch (err) {
        console.log("Error From deleteTwoDKyatTicket => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let saveTwoDWinNumber = async (req, res) => {
    try {
        let win_num = req.body.win_num;
        let win_date = req.body.win_date;
        let type = req.body.type;
        if (!win_num || win_num.length != 2) {
            res.send({ status: 0, msg: "ပေါက်ဂဏန်းမှားယွင်းနေပါသည်။" });
            return;
        }
        if (!win_date || UTILS.is_date(win_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        if (!type || (type != "MORNING" && type != "EVENING")) {
            res.send({ status: 0, msg: "အချိန်မှားယွင်းနေပါသည်" });
            return;
        }

        win_date = MOMENT(win_date).tz("Asia/Rangoon").startOf('day');
        let tickets = await DB.TwoDNumberDB.find({ $and: [{ "delete.is_delete": false }, { type: type }, { "date.win": win_date }] });
        for await (let ticket of tickets) {
            let items = ticket.items;
            let win_amount = 0;
            items.forEach((item) => {
                if (item.num == win_num) {
                    item.win_amount = item.bet_amount * 80;
                    win_amount += item.bet_amount * 80;
                } else {
                    item.win_amount = 0;
                }
            });
            await DB.TwoDNumberDB.findByIdAndUpdate(ticket._id, {
                items: items,
                "amount.win": win_amount,
                "status.cash": win_amount == 0,
                "status.finish": true,
            });
        }
        let kyat_tickets = await DB.TwoDKyatNumberDB.find({ $and: [{ "delete.is_delete": false }, { type: type }, { "date.win": win_date }] });
        for await (let kyat_ticket of kyat_tickets) {
            let items = kyat_ticket.items;
            let win_amount = 0;
            items.forEach((item) => {
                if (item.num == win_num) {
                    item.win_amount = item.bet_amount * 80;
                    win_amount += item.bet_amount * 80;
                } else {
                    item.win_amount = 0;
                }
            });
            await DB.TwoDKyatNumberDB.findByIdAndUpdate(kyat_ticket._id, {
                items: items,
                "amount.win": win_amount,
                "status.cash": win_amount == 0,
                "status.finish": true,
            });
        }
        let auth_user = res.locals.auth_user;
        let win_data = await DB.TwoDWinNumberDB.findOne({ $and: [{ win_date: win_date }, { type: type }] });
        let save_data = {
            win_number: win_num,
            win_date: win_date,
            created: MOMENT(Date.now()).tz("Asia/Rangoon"),
            type: type,
            agent: {
                id: auth_user._id,
                name: auth_user.full_name,
            }
        };
        if (win_data) {
            await DB.TwoDWinNumberDB.findByIdAndUpdate(win_data._id, save_data);
        } else {
            await DB.TwoDWinNumberDB(save_data).save();
        }
        res.send({
            status: 1,
            msg: `${req.body.win_date} ${type == "MORNING" ? "နံနက်" : "ညနေ"}ပိုင် ပေါက်ဂဏန်း ${win_num} ကို စရင်းသွင်းပြီးပါပြီ။`
        })

    } catch (err) {
        console.log("Error From saveTwoDWinNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashTwoDVoucher = async (req, res) => {
    try {
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TwoDNumberDB.findOne({ $and: [{ "agent.id": auth_user.id }, { _id: id }, { "delete.is_delete": false }, { "status.finish": true }] });
        if (!ticket) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.TwoDNumberDB.findByIdAndUpdate(ticket._id, { "status.cash": true, });
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${ticket.voucher_id.toString().padStart(6, '0')} ကို ငွေရှင်းပြီးပါပြီ။`
        });
    } catch (err) {
        console.log("Error From cashTwoDVoucher => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashTwoDKyatVoucher = async (req, res) => {
    try {
        let id = req.body.id;
        if (!id || !UTILS.is_mongo(id)) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let auth_user = res.locals.auth_user;
        let ticket = await DB.TwoDKyatNumberDB.findOne({ $and: [{ "agent.id": auth_user.id }, { _id: id }, { "delete.is_delete": false }, { "status.finish": true }] });
        if (!ticket) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.TwoDKyatNumberDB.findByIdAndUpdate(ticket._id, { "status.cash": true, });
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါင်္တ ${ticket.voucher_id.toString().padStart(6, '0')} ကို ငွေရှင်းပြီးပါပြီ။`
        });
    } catch (err) {
        console.log("Error From cashTwoDVoucher => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDWinNumbers = async (req, res) => {
    try {
        let dateAry = ["MORNING_Mo", "EVENING_Mo", "MORNING_Tu", "EVENING_Tu", "MORNING_We", "EVENING_We", "MORNING_Th", "EVENING_Th", "MORNING_Fr", "EVENING_Fr"];
        let index = 0;
        // let data = await DB.TwoDWinNumberDB.find().sort({created: 1}).limit(490);
        let data = await DB.TwoDWinNumberDB.find().sort({ created: 1 });
        let is_monday = false;
        let remove_index = 0;
        // let exist_dates =[];
        // let delete_dates =[];
        // for(let a of data){
        //    let keys = `${a.win_date}${a.type}`;
        //    if(exist_dates.includes(keys)){
        //     delete_dates.push(a._id);
        //    }else{
        //     exist_dates.push(keys);
        //    }
        // }
        // await DB.TwoDWinNumberDB.deleteMany({_id:{$in:Array.from(new Set(delete_dates))}});


        for await (let cd of data) {
            let first_data = `${cd.type}_${MOMENT(cd.win_date).tz("Asia/Rangoon").format('dd')}`;
            if (first_data == "MORNING_Mo") {
                is_monday = true;
                break;
            } else {
                remove_index++;
            }
        }
        data = data.slice(remove_index);
        let start_index = 0;
        let final_data = [];
        for (let i = 0; i < Math.ceil(data.length / 10) * 2; i++) {
            for await (let d of dateAry) {
                if (start_index < data.length) {
                    let value = data[start_index];
                    let date_str = `${value.type}_${MOMENT(value.win_date).tz("Asia/Rangoon").format('dd')}`;
                    if (date_str == d) {
                        final_data.push(value.win_number);
                        start_index++;
                    } else {
                        final_data.push("**");
                    }
                }
            }
        }
        if (final_data.length > 500) {
            let index = Math.ceil(final_data.length / 10) - 50;
            final_data = final_data.slice(index * 10);
        }
        res.send({ status: 1, data: final_data });
    } catch (err) {
        console.log("Error From getTwoDWinNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDCutNumbers = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDCutNumber.find({ win_date: search_date });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDCutNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDDefaultCutNumbers = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDCutNumber.find({ $and: [{ name: "Company" }, { win_date: search_date }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDDefaultCutNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let setCutAgentNumbers = async (req, res) => {
    try {
        let type = req.body.type;
        let search_date = req.body.search_date;
        let name = req.body.name;
        let items = req.body.items;
        if (!type || (type != "MORNING" && type != "EVENING")) {
            res.send({ status: 0, msg: "အချိန်မှားနေပါသည်။" });
            return;
        }
        if (!name || name == "Company") {
            res.send({ status: 0, msg: "ဒိုင်နာမည်မှားနေပါသည်။" });
            return;
        }
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        if (!items || !Array.isArray(items)) {
            res.send({ status: 0, msg: "စရင်းမှားနေပါသည်။" });
            return;
        }
        await setDefaultCutNumber(name, type, search_date);
        let count = 0;
        let amount = 0;
        for await (let item of items) {
            if (item.bet_amount > 0) {
                count++;
                amount += item.bet_amount;
                await DB.TwoDCutNumber.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { name: name },
                        { type: type },
                        { win_date: search_date },
                    ]
                }, { $inc: { amount: (item.bet_amount) } });
                await DB.TwoDCutNumber.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { name: "Company" },
                        { type: type },
                        { win_date: search_date },
                    ]
                }, { $inc: { amount: -(item.bet_amount) } });
            }
        }

        res.send({
            status: 1,
            msg: `${name} ဖျတ်ယူထားသော အကွက်ရေ ${count} စုစုပေါင်း ${amount} ကို စရင်းသွင်းပြီးပါပြီ။`
        });

    } catch (err) {
        console.log("Error From setCutAgentNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDCutKyatNumbers = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDKyatCutNumber.find({ win_date: search_date });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDCutKyatNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDDefaultCutKyatNumbers = async (req, res) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let data = await DB.TwoDKyatCutNumber.find({ $and: [{ name: "Company" }, { win_date: search_date }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDDefaultCutKyatNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let setCutAgentKyatNumbers = async (req, res) => {
    try {
        let type = req.body.type;
        let search_date = req.body.search_date;
        let name = req.body.name;
        let items = req.body.items;
        if (!type || (type != "MORNING" && type != "EVENING")) {
            res.send({ status: 0, msg: "အချိန်မှားနေပါသည်။" });
            return;
        }
        if (!name || name == "Company") {
            res.send({ status: 0, msg: "ဒိုင်နာမည်မှားနေပါသည်။" });
            return;
        }
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        if (!items || !Array.isArray(items)) {
            res.send({ status: 0, msg: "စရင်းမှားနေပါသည်။" });
            return;
        }
        await setDefaultCutKyatNumber(name, type, search_date);
        let count = 0;
        let amount = 0;
        for await (let item of items) {
            if (item.bet_amount > 0) {
                count++;
                amount += item.bet_amount;
                await DB.TwoDKyatCutNumber.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { name: name },
                        { type: type },
                        { win_date: search_date },
                    ]
                }, { $inc: { amount: (item.bet_amount) } });
                await DB.TwoDKyatCutNumber.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { name: "Company" },
                        { type: type },
                        { win_date: search_date },
                    ]
                }, { $inc: { amount: -(item.bet_amount) } });
            }
        }

        res.send({
            status: 1,
            msg: `${name} ဖျတ်ယူထားသော အကွက်ရေ ${count} စုစုပေါင်း ${amount} ကို စရင်းသွင်းပြီးပါပြီ။`
        });

    } catch (err) {
        console.log("Error From setCutAgentKyatNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let addBlockNumbers = async (req, res) => {
    try {
        let items = req.body.items;
        for (let item of items) {
            let result = await DB.TwoDBlockNumberDB.findOne({ block_num: item.num });
            if (result) {
                await DB.TwoDBlockNumberDB.updateOne({ _id: result._id }, { $inc: { amount: item.bet_amount } });
            } else {
                await new DB.TwoDBlockNumberDB({ block_num: item.num, amount: item.bet_amount }).save();
            }
        }
        res.send({ status: 1, msg: `အကွက် ${items.length} ကို ကာပြီးပါပြီ။` });
    } catch (err) {
        console.log("Error From addBlockNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteSingleBlockNumber = async (req, res) => {
    try {
        let delete_id = req.body.delete_id;
        if (!UTILS.is_mongo(delete_id)) {
            res.send({ status: 0, msg: "ဖျတ်မည့် အကွက်မှားယွင်းနေပါသည်။" });
            return;
        }
        let item = await DB.TwoDBlockNumberDB.findOne({ _id: delete_id });
        await DB.TwoDBlockNumberDB.deleteOne({ _id: delete_id });
        res.send({ status: 1, msg: `${item.block_num} ကို ဖျတ်ပြီပါပြီ။` });
    } catch (err) {
        console.log("Error From deleteSingleBlockNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteAllBlockNumber = async (req, res) => {
    try {
        await DB.TwoDBlockNumberDB.deleteMany();
        res.send({ status: 1, msg: 'ပိတ်ဂဏန်းများအားလုံးဖျတ်ပြီးပါပြီ။' });
    } catch (err) {
        console.log("Error From deleteAllBlockNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDBlockNumber = async (req, res) => {
    try {
        let data = await DB.TwoDBlockNumberDB.find();
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDBlockNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let addBlockKyatNumbers = async (req, res) => {
    try {
        let items = req.body.items;
        for (let item of items) {
            let result = await DB.TwoDBlockKyatNumberDB.findOne({ block_num: item.num });
            if (result) {
                await DB.TwoDBlockKyatNumberDB.updateOne({ _id: result._id }, { $inc: { amount: item.bet_amount } });
            } else {
                await new DB.TwoDBlockKyatNumberDB({ block_num: item.num, amount: item.bet_amount }).save();
            }
        }
        res.send({ status: 1, msg: `အကွက် ${items.length} ကို ကာပြီးပါပြီ။` });
    } catch (err) {
        console.log("Error From addBlockKyatNumbers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteSingleBlockKyatNumber = async (req, res) => {
    try {
        let delete_id = req.body.delete_id;
        if (!UTILS.is_mongo(delete_id)) {
            res.send({ status: 0, msg: "ဖျတ်မည့် အကွက်မှားယွင်းနေပါသည်။" });
            return;
        }
        let item = await DB.TwoDBlockKyatNumberDB.findOne({ _id: delete_id });
        await DB.TwoDBlockKyatNumberDB.deleteOne({ _id: delete_id });
        res.send({ status: 1, msg: `${item.block_num} ကို ဖျတ်ပြီပါပြီ။` });
    } catch (err) {
        console.log("Error From deleteSingleBlockKyatNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteAllBlockKyatNumber = async (req, res) => {
    try {
        await DB.TwoDBlockKyatNumberDB.deleteMany();
        res.send({ status: 1, msg: 'ပိတ်ဂဏန်းများအားလုံးဖျတ်ပြီးပါပြီ။' });
    } catch (err) {
        console.log("Error From deleteSingleBlockKyatNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTwoDBlockKyatNumber = async (req, res) => {
    try {
        let data = await DB.TwoDBlockKyatNumberDB.find();
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getTwoDBlockKyatNumber => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let addMorningClose = async (req, res, next) => {
    try {
        let start = req.body.start;
        let end = req.body.end;
        if (start == "" || end == "") {
            res.send({ status: 0, msg: "အချိန် မှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.TwoDSettingDB.updateOne({ show_id: 0 }, {
            $push: {
                "morning": {
                    start: start,
                    end: end
                }
            }
        });
        res.send({
            status: 1,
            msg: `ပိတ်ချိန် စာရင်း သွင်းပြီပါပြီ`
        });
    } catch (error) {
        console.log("Error From addMorningClose => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let updateMorningClose = async (req, res, next) => {
    try {
        console.log(req.body);
        let update_id = req.body.update_id;
        let start = req.body.start;
        let end = req.body.end;
        if (start == "" || end == "") {
            res.send({ status: 0, msg: "အချိန် မှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.TwoDSettingDB.updateOne({ $and: [{ show_id: 0 }, { "morning._id": update_id }] }, {
            $set: {
                "morning.$.start": start,
                "morning.$.end": end,
            }
        });
        res.send({
            status: 1,
            msg: `ပိတ်ချိန် စာရင်း သွင်းပြီပါပြီ`
        });
    } catch (error) {
        console.log("Error From updateMorningClose => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let deleteMorningClose = async (req, res, next) => {
    try {
        let delete_id = req.body.delete_id;
        await DB.TwoDSettingDB.updateOne({ show_id: 0 }, {
            $pull: {
                "morning": {
                    _id: delete_id,
                }
            }
        }, {
            safe: true,
            multi: true
        });
        res.send({
            status: 1,
            msg: `မနက်ပိတ်ချိန် စာရင်း ဖျတ်ပြီပါပြီ`
        });
    } catch (error) {
        console.log("Error From deleteMorningClose => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let addEveningClose = async (req, res, next) => {
    let start = req.body.start;
    let end = req.body.end;
    if (start == "" || end == "") {
        res.send({ status: 0, msg: "အချိန် မှားယွင်းနေပါသည်။" });
        return;
    }
    try {
        await DB.TwoDSettingDB.updateOne({ show_id: 0 }, {
            $push: {
                "evening": {
                    start: start,
                    end: end
                }
            }
        });
        res.send({
            status: 1,
            msg: `ပိတ်ချိန် စာရင်း သွင်းပြီပါပြီ`
        });
    } catch (error) {
        console.log("Error From addEveningClose => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let updateEveningClose = async (req, res, next) => {
    try {
        let update_id = req.body.update_id;
        let start = req.body.start;
        let end = req.body.end;
        if (start == "" || end == "") {
            res.send({ status: 0, msg: "အချိန် မှားယွင်းနေပါသည်။" });
            return;
        }
        await DB.TwoDSettingDB.updateOne({ $and: [{ show_id: 0 }, { "evening._id": update_id }] }, {
            $set: {
                "evening.$.start": start,
                "evening.$.end": end,
            }
        });
        res.send({
            status: 1,
            msg: `ပိတ်ချိန် စာရင်း သွင်းပြီပါပြီ`
        });
    } catch (error) {
        console.log("Error From updateEveningClose => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let deleteEveningClose = async (req, res, next) => {
    try {
        let delete_id = req.body.delete_id;
        await DB.TwoDSettingDB.updateOne({ show_id: 0 }, {
            $pull: {
                "evening": {
                    _id: delete_id,
                }
            }
        }, {
            safe: true,
            multi: true
        });
        res.send({
            status: 1,
            msg: `ညနေပိတ်ချိန် စာရင်း ဖျတ်ပြီပါပြီ`
        });
    } catch (error) {
        console.log("Error From deleteEveningClose => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let twoDLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || UTILS.is_date(start_date) || !end_date || UTILS.is_date(end_date)) {
            res.send({ status: 0 });
            return;
        }
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let users = await DB.UserDB.find();
        users = _.indexBy(users, '_id');
        let tickets = await DB.TwoDNumberDB.find({
            $and: [{
                "date.win": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "delete.is_delete": false }]
        }).select("items agent amount type");
        tickets = _.groupBy(tickets, (e) => e.agent.id);
        let data = [];
        for (let [key, value] of Object.entries(tickets)) {
            if (key in users) {
                let user = users[key];
                let user_data = {
                    name: user.name,
                    morning: 0,
                    evening: 0,
                    bet: 0,
                    com: 0,
                    bet_com: 0,
                    win_amount: 0,
                    bet_win: 0,
                    total_plus: 0,
                    total_minus: 0
                }
                for (let bet of value) {
                    for (let item of bet.items) {
                        if (bet.type == "MORNING") {
                            user_data.morning += item.bet_amount;
                        } else {
                            user_data.evening += item.bet_amount;
                        }
                        user_data.bet += item.bet_amount;
                        user_data.win_amount += item.win_amount;
                        if (item.win_amount > 0) {
                            user_data.bet_win += item.bet_amount;
                        }
                    }
                }
                data.push(user_data);
            }
        }
        let total = {
            name: "Total",
            morning: 0,
            evening: 0,
            bet: 0,
            com: 0,
            bet_com: 0,
            win_amount: 0,
            bet_win: 0,
            total_plus: 0,
            total_minus: 0
        }
        for (let d of data) {
            d.com = parseInt(d.bet * 0.1);
            d.bet_com = d.bet - d.com;
            let total_win_lose = d.bet_com - d.win_amount;
            if (total_win_lose >= 0) {
                d.total_plus = total_win_lose;
            } else {
                d.total_minus = Math.abs(total_win_lose);
            }
            total.morning += d.morning;
            total.evening += d.evening;
            total.bet += d.bet;
            total.com += d.com;
            total.bet_com += d.bet_com;
            total.win_amount += d.win_amount;
            total.bet_win += d.bet_win;
            total.total_plus += d.total_plus;
            total.total_minus += d.total_minus;
        }
        if (total.total_plus >= total.total_minus) {
            total.total_plus = total.total_plus - total.total_minus;
            total.total_minus = 0;
        } else {
            total.total_minus = total.total_minus - total.total_plus;
            total.total_plus = 0;
        }
        res.send({
            status: 1,
            data,
            total,
        });
    } catch (error) {
        console.log("Error From twoDLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let twoDAgentLedger = async (req, res, next) => {
    try {
        let id = req.body.id;
        let search_date = req.body.start_date;
        if (!id || !UTILS.is_mongo(id) || !search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        let agent = await DB.UserDB.findOne({ _id: id });
        if (!agent) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let tickets = await DB.TwoDNumberDB.find({
            $and: [{
                "date.win": search_date,
            }, { "delete.is_delete": false }, { "agent.id": agent._id }]
        }).select("items amount type");
        let data = {
            name: agent.name,
            morning: 0,
            evening: 0,
            bet: 0,
            com: 0,
            bet_com: 0,
            win_amount: 0,
            bet_win: 0,
            total_plus: 0,
            total_minus: 0
        }
        for (let ticket of tickets) {
            for (let item of ticket.items) {
                if (ticket.type == "MORNING") {
                    data.morning += item.bet_amount;
                } else {
                    data.evening += item.bet_amount;
                }
                data.bet += item.bet_amount;
                data.win_amount += item.win_amount;
                if (item.win_amount > 0) {
                    data.bet_win += item.bet_amount;
                }
            }
        }
        res.send({
            status: 1,
            data,
        });
    } catch
    (error) {
        console.log("Error From twoDAgentLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getAllWinNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0 });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let tickets = await DB.TicketLedgerDB.find({ $and: [{ "ticket.date": search_date }, { "status.status": "WIN" }] });
        let data = [];
        let total = 0;
        for (let ticket of tickets) {
            let d = {
                number: ticket.ticket.number,
                agent: ticket.agent.name,
                user: ticket.sold_out.name,
                air: [],
                simple: [],
                total: 0,
            }
            if (ticket.air.status == true) {
                for (let win_title of ticket.air.win_title) {
                    d.air.push(
                        {
                            title: win_title.title,
                            amount: win_title.amount
                        }
                    );
                    d.total = d.total + win_title.amount;
                    total += win_title.amount;
                }
            }
            if (ticket.simple.status == true) {
                for (let win_title of ticket.simple.win_title) {
                    d.simple.push(
                        {
                            title: win_title.title,
                            amount: win_title.amount
                        }
                    );
                    total += win_title.amount;
                    d.total = d.total + win_title.amount;
                }
            }
            data.push(d);
        }
        data = _.sortBy(data, "number");
        data = _.sortBy(data, (item) => item.number.substring(3, 6)).reverse();
        data = _.sortBy(data, 'total').reverse();
        res.send({
            status: 1,
            data,
        });
    } catch (error) {
        console.log("Error From getAllWinNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getAllWinNumberByAgent = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0 });
            return;
        }
        search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
        let tickets = await DB.TicketLedgerDB.find({ $and: [{ "ticket.date": search_date }, { "status.status": "WIN" }] });
        let data = [];
        let total = 0;
        for (let ticket of tickets) {
            let d = {
                number: ticket.ticket.number,
                agent: ticket.agent.name,
                user: ticket.sold_out.name,
                air: [],
                simple: [],
                total: 0,
            }
            if (ticket.air.status == true) {
                for (let win_title of ticket.air.win_title) {
                    d.air.push(
                        {
                            title: win_title.title,
                            amount: win_title.amount
                        }
                    );
                    d.total = d.total + win_title.amount;
                    total += win_title.amount;
                }
            }
            if (ticket.simple.status == true) {
                for (let win_title of ticket.simple.win_title) {
                    d.simple.push(
                        {
                            title: win_title.title,
                            amount: win_title.amount
                        }
                    );
                    total += win_title.amount;
                    d.total = d.total + win_title.amount;
                }
            }
            data.push(d);
        }
        data = _.sortBy(data, "number");
        data = _.sortBy(data, (item) => item.number.substring(3, 6)).reverse();
        data = _.sortBy(data, 'total').reverse();
        data = _.groupBy(data, 'agent');
        res.send({
            status: 1,
            data,
        });
    } catch (error) {
        console.log("Error From getAllWinNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let twoDFinalLedger = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0 });
            return;
        }
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let tickets = await DB.TwoDNumberDB.find({ $and: [{ "date.win": search_date }, { "delete.is_delete": false }, { "agent.id": auth_user._id }] });
        let data = {
            name: auth_user.name,
            morning: 0,
            evening: 0,
            bet: 0,
            com: 0,
            bet_com: 0,
            win_amount: 0,
            bet_win: 0,
            morning_win: 0,
            evening_win: 0,
            total: 0
        };
        for (let bet of tickets) {
            for (let item of bet.items) {
                if (bet.type == "MORNING") {
                    data.morning += item.bet_amount;
                } else {
                    data.evening += item.bet_amount;
                }
                data.bet += item.bet_amount;
                data.win_amount += item.win_amount;
                if (item.win_amount > 0) {
                    if (bet.type == "MORNING") {
                        data.morning_win += item.bet_amount;
                    } else {
                        data.evening_win += item.bet_amount;
                    }
                    data.bet_win += item.bet_amount;
                }
            }
        }
        data.com = parseInt(data.bet * 0.1);
        data.bet_com = data.bet - data.com;
        data.total = parseInt(data.bet_com - data.win_amount);
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From twoDFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let twoDKyatFinalLedger = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0 });
            return;
        }
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let tickets = await DB.TwoDKyatNumberDB.find({ $and: [{ "date.win": search_date }, { "delete.is_delete": false }, { "agent.id": auth_user._id }] });
        let data = {
            name: auth_user.name,
            morning: 0,
            evening: 0,
            bet: 0,
            com: 0,
            bet_com: 0,
            win_amount: 0,
            bet_win: 0,
            morning_win: 0,
            evening_win: 0,
            total: 0
        };
        for (let bet of tickets) {
            for (let item of bet.items) {
                if (bet.type == "MORNING") {
                    data.morning += item.bet_amount;
                } else {
                    data.evening += item.bet_amount;
                }
                data.bet += item.bet_amount;
                data.win_amount += item.win_amount;
                if (item.win_amount > 0) {
                    if (bet.type == "MORNING") {
                        data.morning_win += item.bet_amount;
                    } else {
                        data.evening_win += item.bet_amount;
                    }
                    data.bet_win += item.bet_amount;
                }
            }
        }
        data.com = parseInt(data.bet * 0.1);
        data.bet_com = data.bet - data.com;
        data.total = parseInt(data.bet_com - data.win_amount);
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From twoDFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let remarkTwoD = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        await DB.TwoDNumberDB.updateOne({ _id: search_id }, { $set: { remark: remark } });
        res.send({ status: 1 });
    } catch (error) {
        console.log("Error From twoDFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let remarkTwoDKyat = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        await DB.TwoDKyatNumberDB.updateOne({ _id: search_id }, { $set: { remark: remark } });
        res.send({ status: 1 });
    } catch (error) {
        console.log("Error From twoDFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let remarkThai = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        await DB.TicketLedgerDB.updateOne({ _id: search_id }, { $set: { remark: remark } });
        res.send({ status: 1 });
    } catch (error) {
        console.log("Error From twoDFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let changeWinTicketNumber = async (req, res, next) => {
    try {
        let key = req.body.key;
        let index = req.body.index;
        let value = req.body.value;
        console.log(key, index, value);
        let settingData = await DB.SettingDB.findOne({ show_id: 0 }).select("date");
        let win_data = await DB.WinNumberDB.findOne({ date: settingData.date });
        if (win_data) {
            let update_data = win_data[key];
            if (key == "first_prize" || key == "first_back_two_prize") {
                update_data.num = `${value}`;
            } else {
                let num = update_data.num;
                num[index] = `${value}`;
                update_data.num = num;
            }
            win_data[key] = update_data;
            win_dat["pdf_url"] = "custom";
            await DB.WinNumberDB.updateOne({ _id: win_data._id }, { $set: win_data });
            res.send({
                status: 1,
                msg: `${value} နံပါတ်ချိန်းပြီးပါပြီ။`
            });
        } else {
            res.send({ status: 0, msg: `မအောင်မြင်ပါ။` });
        }
    } catch (error) {
        console.log("Error From changeWinTicketNumber => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let changeSingleTicketPhone = async (req, res, next) => {
    try {
        let id = req.body.id;
        let phone = req.body.phone;
        let user = res.locals.auth_user;
        let ticket = await DB.TicketLedgerDB.findById(id);
        if (ticket) {
            let update_name = "";
            if (phone != "") {
                update_name = `${phone}-(${user.name})`;
            }
            await DB.TicketLedgerDB.updateOne({ _id: ticket._id }, { $set: { "sold_out.name": update_name } });
            res.send({ status: 1 });
        } else {
            console.log("OK");
            res.send({ status: 0 });
        }
    } catch (error) {
        console.log("Error From changeWinTicketNumber => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
module.exports = {
    all_agent,
    getEditUser,
    register_user,
    update_user,
    updateDevice,
    deleteDeviceId,
    agent_list,
    setting,
    twoDSetting,
    getTicketByAgent,
    saveTickets,
    deleteTicket,
    ticketLedgers,
    ticketLedgerByAgent,
    ticketLedgerByAgentID,
    sellTickets,
    priceSetting,
    delete_user,
    changePassword,
    checkTicket,
    sellSingleTicket,
    startCalculate,
    cashAir,
    cashSimple,
    refillAmount,
    refillRecords,
    agentLedger,
    refillRecordByAgentID,
    simpleWinTicket,
    cashSimpleTicket,
    airWinTicket,
    cashAirTicket,
    updateFirstPrize,
    updateSecondPrize,
    updateThirdPrize,
    updateFourthPrize,
    updateFifthPrize,
    updateBelowPrize,
    updateSetting,
    updateTwoDSetting,
    addBornNumber,
    getBornNumbers,
    deleteBornNumber,
    getAllProfit,
    getPrintTicket,
    getImageData,
    getTransferTicket,
    setTransferTicket,
    getTransferHistory,
    getTransferTickets,
    getTransferIDS,
    DeleteTicketByAgent,
    UnSellTicket,
    CancelTransferSingleTicket,
    CancelTransferMultiTicket,
    getPromotionTickets,
    getPromotionTicketDetail,
    checkTwoDNumbers,
    checkTwoDKyatNumbers,
    saveTwoDNumber,
    getTwoDNumbers,
    getTwoDKyatNumbers,
    deleteTwoDTicket,
    deleteTwoDKyatTicket,
    saveTwoDWinNumber,
    saveTwoDKyatNumber,
    cashTwoDVoucher,
    cashTwoDKyatVoucher,
    getTwoDWinNumbers,
    getTwoDCutNumbers,
    getTwoDDefaultCutNumbers,
    setCutAgentNumbers,
    getTwoDCutKyatNumbers,
    getTwoDDefaultCutKyatNumbers,
    setCutAgentKyatNumbers,
    addBlockNumbers,
    deleteSingleBlockNumber,
    deleteAllBlockNumber,
    getTwoDBlockNumber,
    addBlockKyatNumbers,
    deleteSingleBlockKyatNumber,
    deleteAllBlockKyatNumber,
    getTwoDBlockKyatNumber,
    addMorningClose,
    updateMorningClose,
    deleteMorningClose,
    addEveningClose,
    updateEveningClose,
    deleteEveningClose,
    twoDLedger,
    twoDAgentLedger,
    getAllBornNumbers,
    getAllWinNumber,
    getAllWinNumberByAgent,
    twoDFinalLedger,
    twoDKyatFinalLedger,
    getTwoDDeleteNumber,
    getTwoDKyatDeleteNumber,
    remarkTwoD,
    remarkTwoDKyat,
    remarkThai,
    changeWinTicketNumber,
    changeSingleTicketPhone
}