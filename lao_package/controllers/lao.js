const DB = require('../../models/DB');
const UTILS = require('../../helpers/Utils');
const _ = require('underscore');
const MOMENT = require('moment-timezone');
const RULE = require('../libby/rule');
let LAO_GEN = require('../libby/lao_gen');
let SAVE_CUT_LAO = async (items, name, win_date) => {
    for await (let item of items) {
        let data = null;
        if (item.num.length == 3) {
            data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }] });
        } else {
            data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }, { original_amount: item.original_amount }] });
        }
        if (data) {
            await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: data._id }, { $inc: { bet_amount: item.bet_amount } });
        } else {
            await DB.LAO_CUT_NUMBER_DB({
                name: name,
                win_date: win_date,
                bet_num: item.num,
                original_amount: item.bet_amount,
                bet_amount: item.bet_amount,
            }).save();
        }
    }
}
let SAVE_CUT_LAO_K = async (items, name, win_date) => {
    for await (let item of items) {
        let data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }, { original_amount: item.original_amount }] });
        if (data) {
            await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: data._id }, { $inc: { bet_amount: item.original_amount } });
        } else {
            await DB.LAO_CUT_NUMBER_DB({
                name: name,
                win_date: win_date,
                bet_num: item.num,
                original_amount: item.original_amount,
                bet_amount: item.original_amount,
            }).save();
        }
    }
}
let SET_CUT_NUMBER_BY_TYPE = async (amount, cut_items, from_items, to_items, to, date) => {
    from_items = _.indexBy(from_items, "bet_num");
    to_items = _.indexBy(to_items, "bet_num");
    for await (let item of cut_items) {
        if (item in from_items) {
            let f_item = from_items[item];
            if (item in to_items) {
                let t_item = to_items[item];
                await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: t_item._id }, { $inc: { bet_amount: Math.abs(amount) } });
            } else {
                let save_item = new DB.LAO_CUT_NUMBER_DB(
                    {
                        bet_num: item,
                        bet_amount: amount,
                        original_amount: amount,
                        name: to,
                        win_date: date,
                    }
                );
                await save_item.save();
                to_items[save_item.bet_num] = save_item;
            }
            await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: f_item._id }, { $inc: { bet_amount: -Math.abs(amount) } });
        } else {
            console.log('No Item', item);
        }
    }
}
let getSetting = async (req, res, next) => {
    try {
        let data = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        res.send({
            status: 1,
            data
        })
    } catch (error) {
        console.log("Error From getSetting => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let updateSetting = async (req, res, next) => {
    try {
        let body = req.body;
        body.win_date = MOMENT(Date.parse(body.win_date)).tz('Asia/Rangoon').startOf('days');
        await DB.LAO_SETTING_DB.updateOne({ show_id: 0 }, { $set: body });
        res.send({
            status: 1,
            msg: `လာအို Setting ကို update လုပ်ပြီးပါပြီ။`
        })
    } catch (error) {
        console.log("Error From updateSetting => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let createLaoPriceItem = async (req, res, next) => {
    try {
        let body = req.body;
        await DB.LAO_SETTING_DB.updateOne({ show_id: 0 }, {
            $push: {
                lao: body
            }
        }, { safe: true, multi: false });
        res.send({ status: 1, msg: `ဆု​ကြေး ${body.type_name} ကို တည်ဆောက်ပြီးပါပြီ။` })
    } catch (error) {
        console.log("Error From createLaoPriceItem => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let updateLaoPriceItem = async (req, res, next) => {
    try {
        let body = req.body;
        let search_id = req.body.search_id;
        await DB.LAO_SETTING_DB.updateOne({ $and: [{ show_id: 0 }, { "lao._id": search_id }] }, {
            $set: {
                "lao.$.type_name": body.type_name,
                "lao.$.amount": body.amount,
                "lao.$.four_d": body.four_d,
                "lao.$.three_d": body.three_d,
                "lao.$.front_three_d": body.front_three_d,
                "lao.$.four_permute": body.four_permute,
                "lao.$.three_permute": body.three_permute,
                "lao.$.front_two_d": body.front_two_d,
                "lao.$.back_two_d": body.back_two_d,
                "lao.$.amount_k": body.amount_k,
                "lao.$.four_d_k": body.four_d_k,
                "lao.$.three_d_k": body.three_d_k,
                "lao.$.front_three_d_k": body.front_three_d_k,
                "lao.$.four_permute_k": body.four_permute_k,
                "lao.$.three_permute_k": body.three_permute_k,
                "lao.$.front_two_d_k": body.front_two_d_k,
                "lao.$.back_two_d_k": body.back_two_d_k,
                "lao.$.block_count": body.block_count,
            }
        }, { safe: true, multi: false });
        res.send({ status: 1, msg: `ဆု​ကြေး ${body.type_name} ကို ချိန်းပြီပါပြီ။` })
    } catch (error) {
        console.log("Error From updateLaoPriceItem => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let deleteLaoPriceItem = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        await DB.LAO_SETTING_DB.updateOne({ show_id: 0 }, { $pull: { "lao": { _id: search_id } } }, {
            safe: true,
            multi: true
        });
        res.send({
            status: 1,
            msg: "လာအို ဆုကြေး ဖျတ်ပြီးပါပြီ။"
        })
    } catch (error) {
        console.log("Error From deleteLaoPriceItem => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let checkLaoNumber = async (req, res, next) => {
    try {
        let items = req.body.items;
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        const is_close = UTILS.checkLaoData(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        for (let item of items) {
            if (item.num.includes(' ')) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
            if (item.num.length == 4 && !(`${item.bet_amount}` in price_items)) {
                next(new Error(`${item.bet_amount} ဖြင့် ရောင်းကြေး မရှိပါ။`));
                return;
            }
        }
        let count = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: win_date }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }
        let data = await LAO_GEN.checkLaoNumber(items, win_date, name, setting, price_items);
        res.send({ status: 1, data: data });
    } catch (error) {
        console.log("Error From checkLaoNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let checkLaoKNumber = async (req, res, next) => {
    try {
        let items = req.body.items;
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        const is_close = UTILS.checkLaoData(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount_k');
        for (let item of items) {
            if (item.num.length == 3) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
            if (item.num.includes(' ')) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
            if (item.num.length == 4 && !(`${item.bet_amount}` in price_items)) {
                next(new Error(`${item.bet_amount} ဖြင့် ရောင်းကြေး မရှိပါ။`));
                return;
            }
        }
        items = LAO_GEN.GEN_KYAT_TO_BAHT(items, price_items);
        price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        let count = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: win_date }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }
        let data = await LAO_GEN.checkLaoKNumber(items, win_date, name, setting, price_items);
        res.send({ status: 1, data: data });
    } catch (error) {
        console.log("Error From checkLaoNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let saveLaoNumber = async (req, res, next) => {
    try {
        let items = req.body.items;
        let sold_out_name = req.body.name;
        let auth_user = res.locals.auth_user;
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        const is_close = UTILS.checkLaoData(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        for (let item of items) {
            if (item.num.includes(' ')) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
            if (item.num.length == 4 && !(`${item.bet_amount}` in price_items)) {
                next(new Error(`${item.bet_amount} ဖြင့် ရောင်းကြေး မရှိပါ။`));
                return;
            }
        }
        let count = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: win_date }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }
        let data = await LAO_GEN.checkLaoNumber(items, win_date, name, setting, price_items);
        if (data.confirm) {
            res.send({ status: 1, data: data });
            return;
        }
        let total = 0;
        let save_items = [];
        for (let item of data.numbers) {
            total += item.bet_amount;
            save_items.push({
                num: item.num,
                bet_amount: item.bet_amount,
            });
        }
        let save_data = new DB.LAO_TICKET_DB();
        save_data.agent.id = auth_user._id;
        save_data.agent.name = auth_user.full_name;
        save_data.agent.sold_out_name = sold_out_name;
        save_data.items = save_items;
        save_data.amount.bet = total;
        save_data.date.win = win_date;
        let save_data_result = await save_data.save();
        await SAVE_CUT_LAO(data.numbers, name, setting.win_date);
        res.send({
            status: 1,
            data: data,
            msg: `${data.numbers.length} ကွက် စုစုပေါင်း ${total} ကို စရင်းသွင်းပြီးပါပြီ။`,
            voucher_no: save_data_result.voucher_id.toString().padStart(6, '0'),
            id: save_data_result.id,
            win_date: `${MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').format('yyyy-MM-DD')}`,
            bet_time: MOMENT(save_data_result.date.created).tz("Asia/Rangoon").format('DD /hh:mm:ss A'),
        });
    } catch (error) {
        console.log("Error From saveLaoNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let saveLaoKNumber = async (req, res, next) => {
    try {
        let items = req.body.items;
        let sold_out_name = req.body.name;
        let auth_user = res.locals.auth_user;
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        const is_close = UTILS.checkLaoData(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount_k');
        for (let item of items) {
            if (item.num.length == 3) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
            if (item.num.includes(' ')) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
            if (item.num.length == 4 && !(`${item.bet_amount}` in price_items)) {
                next(new Error(`${item.bet_amount} ဖြင့် ရောင်းကြေး မရှိပါ။`));
                return;
            }
        }
        items = LAO_GEN.GEN_KYAT_TO_BAHT(items, price_items);
        price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        let count = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: win_date }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }
        let data = await LAO_GEN.checkLaoNumber(items, win_date, name, setting, price_items);
        if (data.confirm) {
            res.send({ status: 1, data: data });
            return;
        }
        let total = 0;
        let save_items = [];
        for (let item of data.numbers) {
            total += item.bet_amount;
            save_items.push({
                num: item.num,
                bet_amount: item.bet_amount,
            });
        }
        let save_data = new DB.LAO_KYAT_TICKET_DB();
        save_data.agent.id = auth_user._id;
        save_data.agent.name = auth_user.full_name;
        save_data.agent.sold_out_name = sold_out_name;
        save_data.items = save_items;
        save_data.amount.bet = total;
        save_data.date.win = win_date;
        let save_data_result = await save_data.save();
        await SAVE_CUT_LAO_K(data.numbers, name, setting.win_date);
        res.send({
            status: 1,
            data: data,
            msg: `${data.numbers.length} ကွက် စုစုပေါင်း ${total} ကို စရင်းသွင်းပြီးပါပြီ။`,
            voucher_no: save_data_result.voucher_id.toString().padStart(6, '0'),
            id: save_data_result.id,
            win_date: `${MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').format('yyyy-MM-DD')}`,
            bet_time: MOMENT(save_data_result.date.created).tz("Asia/Rangoon").format('DD /hh:mm:ss A'),
        });
    } catch (error) {
        console.log("Error From saveLaoNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getLaoTicketLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let data = [];
        // if (auth_user.is_agent == true) {
        data = await DB.LAO_TICKET_DB.find({
            $and: [{
                "date.created": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "delete.is_delete": false }]
        });
        // } else {
        //     data = await DB.LAO_TICKET_DB.find({
        //         $and: [{
        //             "date.created": {
        //                 $gte: start_date,
        //                 $lte: end_date
        //             }
        //         }, { "agent.id": auth_user._id }, { "delete.is_delete": false }]
        //     });
        // }


        res.send({
            status: 1,
            data: data,
        });

    } catch (error) {
        console.log("Error From getLaoTicketLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getLaoKTicketLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let data = [];
        // if (auth_user.is_agent == true) {
        data = await DB.LAO_KYAT_TICKET_DB.find({
            $and: [{
                "date.created": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "delete.is_delete": false }]
        });
        // } else {
        //     data = await DB.LAO_TICKET_DB.find({
        //         $and: [{
        //             "date.created": {
        //                 $gte: start_date,
        //                 $lte: end_date
        //             }
        //         }, { "agent.id": auth_user._id }, { "delete.is_delete": false }]
        //     });
        // }


        res.send({
            status: 1,
            data: data,
        });

    } catch (error) {
        console.log("Error From getLaoTicketLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getLaoDeleteTicketLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let data = await DB.LAO_TICKET_DB.find({
            $and: [{
                "date.created": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "agent.id": auth_user._id }, { "delete.is_delete": true }]
        });

        res.send({
            status: 1,
            data: data,
        });

    } catch (error) {
        console.log("Error From getLaoDeleteTicketLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getLaoKDeleteTicketLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let data = await DB.LAO_KYAT_TICKET_DB.find({
            $and: [{
                "date.created": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "agent.id": auth_user._id }, { "delete.is_delete": true }]
        });

        res.send({
            status: 1,
            data: data,
        });

    } catch (error) {
        console.log("Error From getLaoDeleteTicketLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let deleteLaoTicket = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;

        let delete_ticket = await DB.LAO_TICKET_DB.findById(search_id);
        if (!delete_ticket) {
            next(new Error(`ဘောင်ချာ မှားယွင်းနေပါသည်။`));
            return;
        }
        if (delete_ticket.delete.is_delete) {
            next(new Error(`ဖျတ်ပြီးသား ဘောင်ချာနံပါတ်ဖြစ်နေပါသည်။`));
            return;
        }
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        if (auth_user.is_agent == false && MOMENT(delete_ticket.date.created).tz("Asia/Rangoon").add(setting.delete_minute, 'minutes').isBefore(now)) {
            res.send({ status: 0, msg: "စာရင်း တင်ပြီးသွားသော နံပါတ်များကို ဖျတ်ခွင့်မရှိတော့ပါ။" });
            return;
        }

        await DB.LAO_TICKET_DB.updateOne({ _id: delete_ticket._id }, {
            $set: {
                "delete.is_delete": true,
                "delete.name": auth_user.full_name,
                "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
            }
        });
        let count = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: delete_ticket.date.win }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }

        for await (let item of delete_ticket.items) {
            if (item.num.length == 3) {
                await DB.LAO_CUT_NUMBER_DB.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { name: name },
                        { win_date: delete_ticket.date.win }
                    ]
                }, {
                    $inc: { bet_amount: -Math.abs(item.bet_amount) }
                });
            } else if (item.num.length == 4) {
                await DB.LAO_CUT_NUMBER_DB.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { original_amount: item.bet_amount },
                        { name: name },
                        { win_date: delete_ticket.date.win }
                    ]
                }, {
                    $inc: { bet_amount: -Math.abs(item.bet_amount) }
                });
            }
        }
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${delete_ticket.voucher_id.toString().padStart(6, '0')} ကို ဖျတ်ပြီပါပြီ။`
        })

    } catch (error) {
        console.log("Error From deleteLaoTicket => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let deleteLaoKTicket = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let delete_ticket = await DB.LAO_KYAT_TICKET_DB.findById(search_id);
        if (!delete_ticket) {
            next(new Error(`ဘောင်ချာ မှားယွင်းနေပါသည်။`));
            return;
        }
        if (delete_ticket.delete.is_delete) {
            next(new Error(`ဖျတ်ပြီးသား ဘောင်ချာနံပါတ်ဖြစ်နေပါသည်။`));
            return;
        }
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount_k');
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        if (auth_user.is_agent == false && MOMENT(delete_ticket.date.created).tz("Asia/Rangoon").add(setting.delete_minute, 'minutes').isBefore(now)) {
            res.send({ status: 0, msg: "စာရင်း တင်ပြီးသွားသော နံပါတ်များကို ဖျတ်ခွင့်မရှိတော့ပါ။" });
            return;
        }

        await DB.LAO_KYAT_TICKET_DB.updateOne({ _id: delete_ticket._id }, {
            $set: {
                "delete.is_delete": true,
                "delete.name": auth_user.full_name,
                "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
            }
        });
        let count = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: delete_ticket.date.win }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }

        for await (let item of delete_ticket.items) {
            if (item.num.length == 3) {
                await DB.LAO_CUT_NUMBER_DB.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { name: name },
                        { win_date: delete_ticket.date.win }
                    ]
                }, {
                    $inc: { bet_amount: -Math.abs(item.bet_amount) }
                });
            } else if (item.num.length == 4) {
                await DB.LAO_CUT_NUMBER_DB.updateOne({
                    $and: [
                        { bet_num: item.num },
                        { original_amount: price_items[`${item.bet_amount}`].amount },
                        { name: name },
                        { win_date: delete_ticket.date.win }
                    ]
                }, {
                    $inc: { bet_amount: -Math.abs(price_items[`${item.bet_amount}`].amount) }
                });
            }
        }
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${delete_ticket.voucher_id.toString().padStart(6, '0')} ကို ဖျတ်ပြီပါပြီ။`
        })

    } catch (error) {
        console.log("Error From deleteLaoTicket => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let laoTableNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        let data = [];
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        if (auth_user.is_agent == true) {
            data = await DB.LAO_TICKET_DB.find({
                $and: [
                    { "delete.is_delete": false },
                    { "date.win": search_date }
                ]
            }).select('agent items');
        } else {
            data = await DB.LAO_TICKET_DB.find({
                $and: [
                    { "delete.is_delete": false },
                    { "date.win": search_date },
                    { "agent.id": auth_user._id }
                ]
            }).select('agent items');
        }
        res.send({
            status: 1,
            data
        })
    } catch (error) {
        console.log("Error From laoTableNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let laoKTableNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        let data = [];
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        if (auth_user.is_agent == true) {
            data = await DB.LAO_KYAT_TICKET_DB.find({
                $and: [
                    { "delete.is_delete": false },
                    { "date.win": search_date }
                ]
            }).select('agent items');
        } else {
            data = await DB.LAO_KYAT_TICKET_DB.find({
                $and: [
                    { "delete.is_delete": false },
                    { "date.win": search_date },
                    { "agent.id": auth_user._id }
                ]
            }).select('agent items');
        }
        res.send({
            status: 1,
            data
        })
    } catch (error) {
        console.log("Error From laoTableNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}

let saveLaoKyatWinNumer = async (win_number, setting) => {
    let tickets = await DB.LAO_KYAT_TICKET_DB.find({
        $and: [
            { "delete.is_delete": false },
            { "date.win": setting.win_date }
        ]
    });
    let price_items = setting.lao;
    price_items = _.indexBy(price_items, 'amount_k');
    for await (let ticket of tickets) {
        let items = ticket.items;
        let win_amount = 0;
        items.forEach((item) => {
            const { win_item, is_win } = RULE.calculateWinKNumber(win_number, item, price_items);
            if (is_win) {
                item.win.amount = win_item.win.amount;
                item.win.str = win_item.win.str;
                win_amount += win_item.win.amount;
            } else {
                item.win.amount = 0;
                item.win.str = "";
            }
        });
        await DB.LAO_KYAT_TICKET_DB.findByIdAndUpdate(ticket._id, {
            items: items,
            "amount.win": win_amount,
            "status.cash": win_amount == 0,
            "status.finish": true,
        });
    }
}
let saveLaoWinNumber = async (req, res, next) => {
    try {
        let win_number = req.body.win_number;
        let auth_user = res.locals.auth_user;
        let agents = await DB.UserDB.find();
        agents = _.indexBy(agents, '_id');
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let tickets = await DB.LAO_TICKET_DB.find({
            $and: [
                { "delete.is_delete": false },
                { "date.win": setting.win_date }
            ]
        });

        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        for await (let ticket of tickets) {
            let items = ticket.items;
            let win_amount = 0;
            items.forEach((item) => {
                if (item.num.length == 3) {
                    if (item.num == win_number.toString().substr(1, 4)) {
                        let agent = agents[ticket.agent.id];
                        item.win.str = "လာအို (ချဲ)";
                        if (agent.is_permission == true) {
                            item.win.amount = Math.ceil(((item.bet_amount * setting.three_d.win_percent) / 14) * 13);
                            win_amount += Math.ceil(((item.bet_amount * setting.three_d.win_percent) / 14) * 13);
                        } else {
                            item.win.amount = item.bet_amount * setting.three_d.win_percent;
                            win_amount += item.bet_amount * setting.three_d.win_percent;
                        }
                        // item.win.amount = item.bet_amount * setting.three_d.win_percent;
                        // win_amount += item.bet_amount * setting.three_d.win_percent;
                    }
                } else {
                    const { win_item, is_win } = RULE.calculateWinNumber(win_number, item, price_items);
                    if (is_win) {
                        item.win.amount = win_item.win.amount;
                        item.win.str = win_item.win.str;
                        win_amount += win_item.win.amount;
                    } else {
                        item.win.amount = 0;
                        item.win.str = "";
                    }
                }
            });
            await DB.LAO_TICKET_DB.findByIdAndUpdate(ticket._id, {
                items: items,
                "amount.win": win_amount,
                "status.cash": win_amount == 0,
                "status.finish": true,
            });
        }
        await saveLaoKyatWinNumer(win_number, setting);
        let win_data = await DB.LAO_WIN_NUMBER_DB.findOne({ win_date: setting.win_date });
        if (win_data) {
            await DB.LAO_WIN_NUMBER_DB.updateOne({ _id: win_data._id }, { $set: { win_number: win_number } });
        } else {
            await new DB.LAO_WIN_NUMBER_DB({
                win_date: setting.win_date, win_number: win_number, agent: {
                    id: auth_user._id,
                    name: auth_user.full_name,
                }
            }).save();
        }

        res.send({
            status: 1,
            msg: `ပေါက်ဂဏန်း ${win_number} ကို စရင်းသွင်းပြီးပါပြီ။`
        });

    } catch (error) {
        console.log("Error From saveLaoWinNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let winNumberLedger = async (req, res, next) => {
    try {
        let data = await DB.LAO_WIN_NUMBER_DB.find().sort({ created: -1 }).limit(306);
        data =_.sortBy(data,'win_date');
        data = _.pluck(data, 'win_number');
        res.send({
            status: 1,
            data
        })
    } catch (error) {
        console.log("Error From winNumberLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let laoCutNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let type = req.body.type;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let data = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{ win_date: search_date }, { bet_amount: { $gt: 0 } }] });
        data = _.filter(data, (e) => e.bet_amount != 0);
        if (type == "3D") {
            data = _.filter(data, (e) => e.bet_num.length == 3);
            data = _.groupBy(data, 'name');
            let return_data = {};
            for (const [key, value] of Object.entries(data)) {
                let inner_list = [];
                for (let item of value) {
                    inner_list.push({ bet_num: item.bet_num, bet_amount: item.bet_amount });
                }
                return_data[key] = inner_list;
            }
        } else {
            data = _.filter(data, (e) => e.bet_num.length == 4);
            data = _.groupBy(data, 'name');
            for (const [key, value] of Object.entries(data)) {
                let group_value = _.groupBy(value, "original_amount");
                for (const [key2, value2] of Object.entries(group_value)) {
                    let innerList = [];
                    for (let item of value2) {
                        let count = item.bet_amount / item.original_amount;
                        for (let i = 0; i < count; i++) {
                            innerList.push({
                                bet_num: item.bet_num,
                                bet_amount: item.original_amount
                            });
                        }
                    }
                    innerList = _.sortBy(innerList, "bet_num");
                    group_value[key2] = innerList;
                }
                data[key] = group_value;
            }
        }
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From laoCutNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let cutByName = async (req, res, next) => {
    try {
        let from = req.body.from;
        let to = req.body.to;
        let search_date = req.body.search_date;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let prize_one = req.body.prize_one;
        let prize_two = req.body.prize_two;
        let prize_three = req.body.prize_three;
        let prize_four = req.body.prize_four;
        let from_cut_number = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{ win_date: search_date }, { name: from }] });
        let to_cut_number = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{ win_date: search_date }, { name: to }] });
        from_cut_number = _.filter(from_cut_number, (e) => e.bet_num.length == 4);
        to_cut_number = _.filter(to_cut_number, (e) => e.bet_num.length == 4);
        from_cut_number = _.groupBy(from_cut_number, 'original_amount');
        to_cut_number = _.groupBy(to_cut_number, 'original_amount');
        if (prize_one.length > 0) {
            let fc = [];
            let tc = [];
            if ("40" in from_cut_number) {
                fc = from_cut_number["40"];
            }
            if ("40" in to_cut_number) {
                tc = to_cut_number["40"];
            }
            await SET_CUT_NUMBER_BY_TYPE(40, prize_one, fc, tc, to, search_date)
        }
        if (prize_two.length > 0) {
            let fc = [];
            let tc = [];
            if ("60" in from_cut_number) {
                fc = from_cut_number["60"];
            }
            if ("60" in to_cut_number) {
                tc = to_cut_number["60"];
            }
            await SET_CUT_NUMBER_BY_TYPE(60, prize_two, fc, tc, to, search_date)
        }
        if (prize_three.length > 0) {
            let fc = [];
            let tc = [];
            if ("100" in from_cut_number) {
                fc = from_cut_number["100"];
            }
            if ("100" in to_cut_number) {
                tc = to_cut_number["100"];
            }
            await SET_CUT_NUMBER_BY_TYPE(100, prize_three, fc, tc, to, search_date)
        }
        if (prize_four.length > 0) {
            let fc = [];
            let tc = [];
            if ("150" in from_cut_number) {
                fc = from_cut_number["150"];
            }
            if ("150" in to_cut_number) {
                tc = to_cut_number["150"];
            }
            await SET_CUT_NUMBER_BY_TYPE(150, prize_four, fc, tc, to, search_date)
        }
        res.send({
            status: 1,
            msg: `${to} ဖျတ်ယူထားသော အကွက်များ ကို စရင်းသွင်းပြီးပါပြီ။`
        });
    } catch (error) {
        console.log("Error From cutByName => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let cutByNameThreeD = async (req, res, next) => {
    try {
        let from = req.body.from;
        let to = req.body.to;
        let search_date = req.body.search_date;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let items = req.body.items;
        let from_cut_number = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{ win_date: search_date }, { name: from }] });
        let to_cut_number = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{ win_date: search_date }, { name: to }] });
        from_cut_number = _.filter(from_cut_number, (e) => e.bet_num.length == 3);
        to_cut_number = _.filter(to_cut_number, (e) => e.bet_num.length == 3);
        from_cut_number = _.indexBy(from_cut_number, 'bet_num');
        to_cut_number = _.indexBy(to_cut_number, 'bet_num');
        for await (let item of items) {
            if (item.num in from_cut_number) {
                let f_item = from_cut_number[item.num];
                if (item.num in to_cut_number) {
                    let t_item = to_cut_number[item.num];
                    let bet_amount = t_item.bet_amount + item.amount;
                    await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: t_item._id }, { $set: { bet_amount: bet_amount } });
                } else {
                    await new DB.LAO_CUT_NUMBER_DB(
                        {
                            bet_num: item.num,
                            bet_amount: item.amount,
                            original_amount: item.amount,
                            name: to,
                            win_date: search_date,
                        }
                    ).save();
                }
                let bm = f_item.bet_amount - item.amount;
                await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: f_item._id }, { $set: { bet_amount: bm } });
            }
        }
        res.send({
            status: 1,
            msg: `${to} ဖျတ်ယူထားသော အကွက်များ ကို စရင်းသွင်းပြီးပါပြီ။`
        });
    } catch (error) {
        console.log("Error From cutByNameThreeD => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let laoAllCutNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let win_number ="";
        let win_data =await DB.LAO_WIN_NUMBER_DB.findOne({win_date:search_date});
        if(win_data){
            win_number =win_data.win_number;
        }
        let data = await DB.LAO_CUT_NUMBER_DB.find({ win_date: search_date });
        data = _.filter(data, (e) => e.bet_amount > 0);
        data = _.groupBy(data, 'name');
        res.send({ status: 1, data:{items:data,win_number} });
    } catch (error) {
        console.log("Error From laoCutNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let laoAllCutWinNumbers = async (req, res, next) => {
    try {
        let data = [];
        let search_date = req.body.search_date;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let win_number = await DB.LAO_WIN_NUMBER_DB.findOne({ win_date: search_date });
        if (!win_number) {
            res.send({ status: 1, data });
            return;
        }
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        win_number = win_number.win_number;
        let cut_data = await DB.LAO_CUT_NUMBER_DB.find({ win_date: search_date });
        cut_data = _.filter(cut_data, (e) => e.bet_amount != 0);

        cut_data.forEach((item) => {
            if (item.bet_num.length == 3) {
                if (item.bet_num == win_number.toString().substr(1, 4)) {
                    data.push({
                        name: item.name,
                        bet_num: item.bet_num,
                        type: "3D",
                        win_amount: item.bet_amount * setting.three_d.win_percent,
                        win_str: "လာအို (ခ်ဲ)"
                    });
                }
            } else {
                const { is_win, win_amount, win_str } = RULE.calculateCutWinNumber(win_number, item, price_items);
                if (is_win) {
                    let count = 1;
                    if (item.bet_amount > item.original_amount) {
                        count = Math.ceil(item.bet_amount / item.original_amount);
                    }
                    for (let i = 0; i < count; i++) {
                        data.push({
                            name: item.name,
                            type: `${item.original_amount}`,
                            bet_num: item.bet_num,
                            win_amount: win_amount,
                            win_str: win_str
                        });
                    }
                }
            }
        });
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From laoCutNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}

let laoAllCutWinKNumbers = async (req, res, next) => {
    try {
        let data = [];
        let search_date = req.body.search_date;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let win_number = await DB.LAO_WIN_NUMBER_DB.findOne({ win_date: search_date });
        if (!win_number) {
            res.send({ status: 1, data });
            return;
        }
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        win_number = win_number.win_number;
        let cut_data = await DB.LAO_KYAT_TICKET_DB.find({ "date.win": search_date });
        let total = 0;
        cut_data.forEach((value) => {
            for (let item of value.items) {
                if (item.num.length > 3 && item.win.amount > 0) {
                    data.push({
                        type: `${item.bet_amount}`,
                        name: "Company",
                        bet_num: item.num,
                        win_amount: item.win.amount,
                        win_str: UTILS.UTZ[item.win.str]
                    });
                    total += item.win.amount;
                }
            }
        });
        res.send({ status: 1, data });

    } catch (error) {
        console.log("Error From LaoAllCutWinKNumber =>", error);
        next(new Error(process.env.connect_dev));
    }
}
let cashVoucher = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let data = await DB.LAO_TICKET_DB.findOne({ $and: [{ _id: search_id }, { "agent.id": auth_user._id }, { "delete.is_delete": false }, { "status.finish": true }] });
        if (!data) {
            next(new Error(`ဘောင်ချာ နံပါတ်မှားယွင်နေပါသည်။`));
            return;
        }
        await DB.LAO_TICKET_DB.updateOne({ _id: data._id }, {
            $set: {
                "status.cash": true
            }
        });
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${data.voucher_id.toString().padStart(6, '0')} ကို ငွေရှင်းပြီးပါပြီ။`
        })
    } catch (error) {
        console.log("Error From cashVoucher => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let cashKVoucher = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let data = await DB.LAO_KYAT_TICKET_DB.findOne({ $and: [{ _id: search_id }, { "agent.id": auth_user._id }, { "delete.is_delete": false }, { "status.finish": true }] });
        if (!data) {
            next(new Error(`ဘောင်ချာ နံပါတ်မှားယွင်နေပါသည်။`));
            return;
        }
        await DB.LAO_KYAT_TICKET_DB.updateOne({ _id: data._id }, {
            $set: {
                "status.cash": true
            }
        });
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${data.voucher_id.toString().padStart(6, '0')} ကို ငွေရှင်းပြီးပါပြီ။`
        })
    } catch (error) {
        console.log("Error From cashVoucher => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getProfitLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || UTILS.is_date(start_date) || !end_date || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        let users = await DB.UserDB.find();
        users = _.indexBy(users, "_id");
        let tickets = await DB.LAO_TICKET_DB.find({
            $and: [{
                "date.win": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "delete.is_delete": false }]
        });
        tickets = _.groupBy(tickets, (e) => e.agent.id);
        let data = [];
        for (let [key, values] of Object.entries(tickets)) {
            if (key in users) {
                let user = users[key];
                let apo = user.lao_apo / 10;
                let user_data = {
                    name: user.name,
                    bet: 0,
                    real_bet: 0,
                    com: 0,
                    bet_com: 0,
                    four_win_amount: 0,
                    three_win_amount: 0,
                    total_plus: 0,
                    total_minus: 0,
                }
                for (let bet of values) {
                    for (let item of bet.items) {
                        if (item.num.length == 4) {
                            if (item.bet_amount == 150) {
                                // user_data.bet += 130;
                                // user_data.real_bet += 130;
                                user_data.com += 20;
                            } else if (item.bet_amount == 100) {
                                // user_data.bet += 90;
                                user_data.com += 15;
                            } else if (item.bet_amount == 60) {
                                // user_data.bet += 50;
                                user_data.com += 10;
                            } else if (item.bet_amount == 40) {
                                // if (user.name == "UH" || user.name == "UHWK") {
                                //     // user_data.bet += 35;
                                // } else {
                                //     // user_data.bet += 30;
                                //     user_data.com += 5;
                                // }
                                user_data.com += 5;
                            }
                            user_data.bet += item.bet_amount;
                            user_data.real_bet += item.bet_amount;
                            if (item.win.amount > 0) {
                                user_data.four_win_amount += item.win.amount;
                            }
                        } else if (item.num.length == 3) {
                            user_data.bet += item.bet_amount;
                            user_data.real_bet += item.bet_amount / apo;
                            user_data.com += (item.bet_amount / apo) - (item.bet_amount * 0.6);
                            if (item.win.amount > 0) {
                                user_data.three_win_amount += item.win.amount;
                            }
                        }
                    }
                }
                data.push(user_data);
            }
        }

        let total = {
            name: "Total",
            bet: 0,
            real_bet: 0,
            com: 0,
            bet_com: 0,
            four_win_amount: 0,
            three_win_amount: 0,
            total_plus: 0,
            total_minus: 0,
        }

        for (let d of data) {
            d.bet_com = d.real_bet - d.com;
            let total_wl = d.bet_com - (d.four_win_amount + d.three_win_amount);
            if (total_wl >= 0) {
                d.total_plus = total_wl;
            } else {
                d.total_minus = Math.abs(total_wl);
            }
            total.bet += d.bet;
            total.real_bet += d.real_bet;
            total.com += d.com;
            total.bet_com += d.bet_com;
            total.four_win_amount += d.four_win_amount;
            total.three_win_amount += d.three_win_amount;
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
        let cut_tickets = await DB.LAO_CUT_NUMBER_DB.find({
            $and: [{
                "win_date": {
                    $gte: start_date,
                    $lte: end_date
                }
            }]
        });
        let cut_data = [];
        let win_numbers = await DB.LAO_WIN_NUMBER_DB.findOne({ win_date: { $gte: start_date, $lte: end_date } });
        win_numbers = _.indexBy(win_numbers, "win_date");
        cut_tickets = _.groupBy(cut_tickets, "name");
        for (let [key, values] of Object.entries(cut_tickets)) {
            if (key.trim().toLowerCase() != "company" && key.trim().toLowerCase() != "hnh") {
                let d = {
                    name: key,
                    bet: 0,
                    real_bet: 0,
                    com: 0,
                    bet_com: 0,
                    four_win_amount: 0,
                    three_win_amount: 0,
                    total_plus: 0,
                    total_minus: 0,
                }
                for (let item of values) {
                    d.bet += item.bet_amount;
                    if (`${item.win_date}` in win_numbers) {
                        let win_number = win_numbers[item.win_date].win_number;
                        if (item.bet_num.length == 3) {
                            d.real_bet += item.bet_amount / 1.4;
                            d.com += (item.bet_amount / 1.4) - (item.bet_amount * 0.65);
                            if (item.bet_num == win_number.toString().substr(1, 4)) {
                                d.three_win_amount += item.bet_amount * setting.three_d.win_percent;
                            }
                        } else {
                            if (item.bet_amount > 0) {
                                d.real_bet += item.bet_amount;
                                const { is_win, win_amount, win_str } = RULE.calculateCutWinNumber(win_number, item, price_items);
                                let count = 1;
                                if (item.bet_amount > item.original_amount) {
                                    count = Math.ceil(item.bet_amount / item.original_amount);
                                }
                                if (item.original_amount == 150) {
                                    d.com += 25 * count;
                                } else if (item.original_amount == 100) {
                                    d.com += 15 * count;
                                } else if (item.original_amount == 60) {
                                    d.com += 10 * count;
                                } else if (item.original_amount == 40) {
                                    d.com += 5 * count;
                                }
                                if (is_win) {
                                    d.four_win_amount += win_amount * count;
                                }
                            }
                        }
                    }
                }
                cut_data.push(d);
            }
        }
        for (let d of cut_data) {
            d.bet_com = d.real_bet - d.com;
            let total_wl = d.bet_com - (d.four_win_amount + d.three_win_amount);
            if (total_wl >= 0) {
                d.total_minus = total_wl;
            } else {
                d.total_plus = Math.abs(total_wl);
            }
        }
        res.send({
            status: 1,
            data,
            total,
            cut_data
        });
    } catch (error) {
        console.log("Error From getProfitLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getProfitKLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        if (!start_date || UTILS.is_date(start_date) || !end_date || UTILS.is_date(end_date)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        let amount_items = _.indexBy(setting.lao, 'amount_k');
        let users = await DB.UserDB.find();
        users = _.indexBy(users, "_id");
        let tickets = await DB.LAO_KYAT_TICKET_DB.find({
            $and: [{
                "date.win": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "delete.is_delete": false }]
        });
        tickets = _.groupBy(tickets, (e) => e.agent.id);
        let data = [];
        for (let [key, values] of Object.entries(tickets)) {
            if (key in users) {
                let user = users[key];
                let apo = user.lao_apo / 10;
                let user_data = {
                    name: user.name,
                    bet: 0,
                    real_bet: 0,
                    com: 0,
                    bet_com: 0,
                    four_win_amount: 0,
                    three_win_amount: 0,
                    total_plus: 0,
                    total_minus: 0,
                }
                for (let bet of values) {
                    for (let item of bet.items) {
                        if (item.num.length == 4) {
                            if (amount_items[`${item.bet_amount}`].amount == 150) {
                                // user_data.bet += 130;
                                // user_data.real_bet += 130;
                                user_data.com += 20;
                            } else if (amount_items[`${item.bet_amount}`].amount == 100) {
                                // user_data.bet += 90;
                                user_data.com += 15;
                            } else if (amount_items[`${item.bet_amount}`].amount == 60) {
                                // user_data.bet += 50;
                                user_data.com += 10;
                            } else if (amount_items[`${item.bet_amount}`].amount == 40) {
                                // if (user.name == "UH" || user.name == "UHWK") {
                                //     // user_data.bet += 35;
                                // } else {
                                //     // user_data.bet += 30;
                                //     user_data.com += 5;
                                // }
                                user_data.com += 5;
                            }
                            user_data.bet += item.bet_amount;
                            user_data.real_bet += item.bet_amount;
                            if (item.win.amount > 0) {
                                user_data.four_win_amount += item.win.amount;
                            }
                        } else if (item.num.length == 3) {
                            user_data.bet += item.bet_amount;
                            user_data.real_bet += item.bet_amount / apo;
                            user_data.com += (item.bet_amount / apo) - (item.bet_amount * 0.6);
                            if (item.win.amount > 0) {
                                user_data.three_win_amount += item.win.amount;
                            }
                        }
                    }
                }
                data.push(user_data);
            }
        }

        let total = {
            name: "Total",
            bet: 0,
            real_bet: 0,
            com: 0,
            bet_com: 0,
            four_win_amount: 0,
            three_win_amount: 0,
            total_plus: 0,
            total_minus: 0,
        }

        for (let d of data) {
            d.bet_com = d.real_bet - d.com;
            let total_wl = d.bet_com - (d.four_win_amount + d.three_win_amount);
            if (total_wl >= 0) {
                d.total_plus = total_wl;
            } else {
                d.total_minus = Math.abs(total_wl);
            }
            total.bet += d.bet;
            total.real_bet += d.real_bet;
            total.com += d.com;
            total.bet_com += d.bet_com;
            total.four_win_amount += d.four_win_amount;
            total.three_win_amount += d.three_win_amount;
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
        console.log("Error From getProfitLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getLaoFinalLedger = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let tickets = await DB.LAO_TICKET_DB.find({
            $and: [{
                "date.win": search_date
            }, { "delete.is_delete": false }, { "agent.id": auth_user._id }]
        });
        let data = {
            p_one: {
                count: 0,
                amount: 0,
            },
            p_two: {
                count: 0,
                amount: 0,
            },
            p_three: {
                count: 0,
                amount: 0,
            },
            p_four: {
                count: 0,
                amount: 0,
            },
            p_five: {
                count: 0,
                amount: 0,
            },
            total_bet: 0,
            total_win: 0,
            total_cash: 0
        }

        for (let bet of tickets) {
            for (let item of bet.items) {
                if (item.num.length == 4) {
                    if (item.bet_amount == 150) {
                        data.p_one.count++;
                        data.p_one.amount += 130;
                    } else if (item.bet_amount == 100) {
                        data.p_two.count++;
                        data.p_two.amount += 85;
                    } else if (item.bet_amount == 60) {
                        data.p_three.count++;
                        data.p_three.amount += 50;
                    } else if (item.bet_amount == 40) {
                        data.p_four.count++;
                        data.p_four.amount += 35;
                    }
                } else if (item.num.length == 3) {
                    data.p_five.count++;
                    data.p_five.amount += item.bet_amount;
                }
                if (item.win.amount > 0) {
                    data.total_win += item.win.amount;
                }
            }
        }
        data.p_five.amount = parseInt(data.p_five.amount * 0.6);
        data.total_bet = data.p_one.amount + data.p_two.amount + data.p_three.amount + data.p_four.amount + data.p_five.amount;
        data.total_cash = data.total_bet - data.total_win;
        res.send({
            status: 1,
            data,
        });
    } catch (error) {
        console.log("Error From getLaoFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let getLaoKFinalLedger = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let tickets = await DB.LAO_KYAT_TICKET_DB.find({
            $and: [{
                "date.win": search_date
            }, { "delete.is_delete": false }, { "agent.id": auth_user._id }]
        });
        let data = {
            p_one: {
                count: 0,
                amount: 0,
            },
            p_two: {
                count: 0,
                amount: 0,
            },
            p_three: {
                count: 0,
                amount: 0,
            },
            p_four: {
                count: 0,
                amount: 0,
            },
            p_five: {
                count: 0,
                amount: 0,
            },
            total_bet: 0,
            total_win: 0,
            total_cash: 0
        }

        for (let bet of tickets) {
            for (let item of bet.items) {
                if (item.num.length == 4) {
                    if (item.bet_amount == 15000) {
                        data.p_one.count++;
                        data.p_one.amount += 13000;
                    } else if (item.bet_amount == 10000) {
                        data.p_two.count++;
                        data.p_two.amount += 8500;
                    } else if (item.bet_amount == 6000) {
                        data.p_three.count++;
                        data.p_three.amount += 5000;
                    } else if (item.bet_amount == 4000) {
                        data.p_four.count++;
                        data.p_four.amount += 3500;
                    }
                } else if (item.num.length == 3) {
                    data.p_five.count++;
                    data.p_five.amount += item.bet_amount;
                }
                if (item.win.amount > 0) {
                    data.total_win += item.win.amount;
                }
            }
        }
        data.p_five.amount = parseInt(data.p_five.amount * 0.6);
        data.total_bet = data.p_one.amount + data.p_two.amount + data.p_three.amount + data.p_four.amount + data.p_five.amount;
        data.total_cash = data.total_bet - data.total_win;
        res.send({
            status: 1,
            data,
        });
    } catch (error) {
        console.log("Error From getLaoFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let remarkLao = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        await DB.LAO_TICKET_DB.updateOne({ _id: search_id }, { $set: { remark: remark } });
        res.send({ status: 1 });
    } catch (error) {
        console.log("Error From LaoTicket Remark => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let remarkKLao = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        await DB.LAO_KYAT_TICKET_DB.updateOne({ _id: search_id }, { $set: { remark: remark } });
        res.send({ status: 1 });
    } catch (error) {
        console.log("Error From LaoTicket Remark => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}

let balanceLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        let data = [];
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let ledgers = await DB.LAO_TICKET_DB.find({ $and: [{ "amount.win": { $gt: 0 } }, { "date.win": { $gte: start_date, $lte: end_date } }] });
        if (ledgers) {
            let group_ledgers = _.groupBy(ledgers, (e) => e.agent.id);
            for (const [key, value] of Object.entries(group_ledgers)) {
                let first_item = value[0];
                let user = {
                    id: first_item.agent.id,
                    name: first_item.agent.name,
                    win_amount: 0,
                    cash_amount: 0,
                    balance_amount: 0
                };
                for (let item of value) {
                    user.win_amount += item.amount.win;
                    if (item.status.cash) {
                        user.cash_amount += item.amount.win;
                    } else {
                        user.balance_amount += item.amount.win;
                    }
                }
                data.push(user);
            }
        }
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From LaoTicket Remark => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
module.exports = {
    getSetting,
    updateSetting,
    createLaoPriceItem,
    updateLaoPriceItem,
    deleteLaoPriceItem,
    checkLaoNumber,
    checkLaoKNumber,
    saveLaoNumber,
    saveLaoKNumber,
    getLaoTicketLedger,
    getLaoKTicketLedger,
    getLaoKDeleteTicketLedger,
    deleteLaoTicket,
    deleteLaoKTicket,
    laoTableNumber,
    laoKTableNumber,
    saveLaoWinNumber,
    winNumberLedger,
    laoCutNumber,
    cutByName,
    laoAllCutNumber,
    laoAllCutWinNumbers,
    laoAllCutWinKNumbers,
    cashVoucher,
    cashKVoucher,
    getProfitLedger,
    getProfitKLedger,
    cutByNameThreeD,
    getLaoFinalLedger,
    getLaoKFinalLedger,
    getLaoDeleteTicketLedger,
    remarkLao,
    remarkKLao,
    balanceLedger
}