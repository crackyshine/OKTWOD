const DB = require('../../models/DB');
const UTILS = require('../../helpers/Utils');
const MOMENT = require('moment-timezone');
const _ = require('underscore');
let SAVE_CUT_THREE_D = async (items, name, win_date) => {
    for await (let item of items) {
        let data = await DB.THREE_D_CUT_KYAT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }] });
        if (data) {
            await DB.THREE_D_CUT_KYAT_NUMBER_DB.updateOne({ _id: data._id }, { $inc: { amount: item.bet_amount } });
        } else {
            await new DB.THREE_D_CUT_KYAT_NUMBER_DB({
                name: name,
                win_date: win_date,
                bet_num: item.num,
                amount: item.bet_amount,
            }).save();
        }
    }
}
let checkThreeD = async (req, res, next) => {
    try {
        let setting = await DB.THREE_D_SETTING_DB.findOne({ show_id: 0 });
        const is_close = UTILS.checkCloseThreeD(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let items = req.body.items;
        let confirm = false;
        let data = [];
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        for (let item of items) {
            if (item.num.includes(' ')) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
        }
        let count = await DB.THREE_D_CUT_KYAT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: win_date }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }
        let tickets = await DB.THREE_D_CUT_KYAT_NUMBER_DB.find({
            $and: [
                { win_date: win_date },
                { name: name },
            ]
        });
        tickets = _.indexBy(tickets, 'bet_num');
        for (let item of items) {
            let server_amount = 0;
            if (item.num in tickets) {
                server_amount = tickets[item.num].amount;
            }
            if (data.some(e => e.num == item.num)) {
                for (let d of data) {
                    if (d.num == item.num) {
                        if (item.za_amount == 2) {
                            d.za_amount == 2;
                        }
                        d.bet_amount += item.bet_amount;
                        d.original_amount += item.bet_amount;
                    }
                }
            } else {
                item.server_amount = server_amount;
                data.push(item);
            }
        }
        let nums = _.uniq(_.pluck(items, "num"));
        let block_tickets = await DB.THREE_D_BLOCK_KYAT_NUMBER_DB.find({ block_num: { $in: Array.from(new Set(nums)) } });
        block_tickets = _.indexBy(block_tickets, 'bet_num');
        let b_amount = name == "Company" ? setting.kyat_za_amount : setting.three_d_kyat_cut_amount;
        for (let item of data) {
            if ((item.num in block_tickets) || item.server_amount >= b_amount) {
                item.bet_amount = 0;
                confirm = true;
            } else if ((item.bet_amount + item.server_amount) > b_amount) {
                if ((item.bet_amount + item.server_amount) > setting.kyat_block_amount) {
                    item.za_amount = 2;
                }
                item.bet_amount = b_amount - item.server_amount;
                confirm = true;
            } else if (((item.bet_amount + item.server_amount) > setting.kyat_block_amount && item.za_amount == 1)) {
                item.za_amount = 2;
                confirm = true;
            }
        }
        res.send({
            status: 1,
            data: {
                confirm,
                numbers: data
            }
        });
    } catch (error) {
        console.log("Error From checkThreeD => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let saveThreeD = async (req, res, next) => {
    try {
        let setting = await DB.THREE_D_SETTING_DB.findOne({ show_id: 0 });
        let auth_user = res.locals.auth_user;
        const is_close = UTILS.checkCloseThreeD(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let items = req.body.items;
        let sold_out_name = req.body.name;
        let confirm = false;
        let data = [];
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        for (let item of items) {
            if (item.num.includes(' ')) {
                next(new Error(`${item.num} မှားယွင်းနေပါသည်။`));
                return;
            }
        }
        let count = await DB.THREE_D_CUT_KYAT_NUMBER_DB.findOne({ $and: [{ name: "HNH" }, { win_date: win_date }] });
        let name = "Company";
        if (count) {
            name = "HNH";
        }
        let tickets = await DB.THREE_D_CUT_KYAT_NUMBER_DB.find({
            $and: [
                { win_date: win_date },
                { name: name },
            ]
        });
        tickets = _.indexBy(tickets, 'bet_num');
        for (let item of items) {
            let server_amount = 0;
            if (item.num in tickets) {
                server_amount = tickets[item.num].amount;
            }
            if (data.some(e => e.num == item.num)) {
                for (let d of data) {
                    if (d.num == item.num) {
                        if (item.za_amount == 2) {
                            d.za_amount == 2;
                        }
                        d.bet_amount += item.bet_amount;
                        d.original_amount += item.bet_amount;
                    }
                }
            } else {
                item.server_amount = server_amount;
                data.push(item);
            }
        }
        let nums = _.uniq(_.pluck(items, "num"));
        let block_tickets = await DB.THREE_D_BLOCK_NUMBER_DB.find({ block_num: { $in: Array.from(new Set(nums)) } });
        block_tickets = _.indexBy(block_tickets, 'bet_num');
        let b_amount = name == "Company" ? setting.kyat_za_amount : setting.three_d_kyat_cut_amount;
        for (let item of data) {
            if ((item.num in block_tickets) || item.server_amount >= b_amount) {
                item.bet_amount = 0;
                confirm = true;
            } else if ((item.bet_amount + item.server_amount) > b_amount) {
                if ((item.bet_amount + item.server_amount) > setting.kyat_block_amount) {
                    item.za_amount = 2;
                }
                item.bet_amount = b_amount - item.server_amount;
                confirm = true;
            } else if (((item.bet_amount + item.server_amount) > setting.kyat_block_amount && item.za_amount == 1)) {
                item.za_amount = 2;
                confirm = true;
            }
        }
        if (confirm) {
            res.send({ status: 1, data: { confirm, numbers: items } });
            return;
        }
        let total = 0;
        for (let item of data) {
            if ('original_amount' in item) {
                delete item.original_amount;
            }
            if ('server_amount' in item) {
                delete item.server_amount;
            }
            item.win_amount = 0;
            total += item.bet_amount;
        }
        let save_data = new DB.THREE_D_KYAT_TICKET_DB();
        save_data.agent.id = auth_user._id;
        save_data.agent.name = auth_user.full_name;
        save_data.agent.sold_out_name = sold_out_name;
        save_data.items = data;
        save_data.amount.total = total;
        save_data.date.win = win_date;
        let save_data_result = await save_data.save();
        await SAVE_CUT_THREE_D(data, name, win_date);
        res.send({
            status: 1,
            data: { confirm, numbers: data },
            msg: `${data.length} ကွက် စုစုပေါင်း ${total} ကို စရင်းသွင်းပြီးပါပြီ။`,
            voucher_no: save_data_result.voucher_id.toString().padStart(6, '0'),
            id: save_data_result.id,
            win_date: `${win_date.format('yyyy-MM-DD')}`,
            bet_time: MOMENT(save_data_result.date.created).tz("Asia/Rangoon").format('DD /hh:mm:ss A'),
        });
    } catch (error) {
        console.log("Error From saveThreeD => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let threeDTicketNumber = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let data = [];
        // if (auth_user.is_agent == true) {
            data = await DB.THREE_D_KYAT_TICKET_DB.find({
                $and: [{
                    "date.created": {
                        $gte: start_date,
                        $lte: end_date
                    }
                }, { "delete.is_delete": false }]
            });
        // } else {
        //     data = await DB.THREE_D_KYAT_TICKET_DB.find({
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
        console.log("Error From threeDTicketNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let threeDDeleteTicketNumber = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let data = await DB.THREE_D_KYAT_TICKET_DB.find({
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
        console.log("Error From threeDTicketNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let deleteThreeDTicket = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let ticket = await DB.THREE_D_KYAT_TICKET_DB.findById(search_id);
        if (!ticket) {
            res.send({ status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }

        let setting = await DB.THREE_D_SETTING_DB.findOne({ show_id: 0 });
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        if (auth_user.is_agent == false && MOMENT(ticket.date.created).tz("Asia/Rangoon").add(setting.delete_minute, 'minutes').isBefore(now)) {
            res.send({ status: 0, msg: "စာရင်း တင်ပြီးသွားသော နံပါတ်များကို ဖျတ်ခွင့်မရှိတော့ပါ။" });
            return;
        }

        await DB.THREE_D_KYAT_TICKET_DB.updateOne({ _id: ticket._id }, {
            $set: {
                "delete.is_delete": true,
                "delete.name": auth_user.full_name,
                "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
            }
        });
        for await (let item of ticket.items) {
            await DB.THREE_D_CUT_KYAT_NUMBER_DB.updateOne({
                $and: [
                    { bet_num: item.num },
                    { name: "Company" },
                    { win_date: ticket.date.win }
                ]
            }, { $inc: { amount: -Math.abs(item.bet_amount) } })
        }
        res.send({
            status: 1,
            msg: `ဘောင်ချာနံပါတ် ${ticket.voucher_id.toString().padStart(6, '0')} ကို ဖျတ်ပြီပါပြီ။`
        })
    } catch (error) {
        console.log("Error From deleteThreeDTicket => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let threeDTableNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let data = [];
        if (auth_user.is_agent == true) {
            data = await DB.THREE_D_KYAT_TICKET_DB.find({
                $and: [{
                    "date.win": search_date
                }, { "delete.is_delete": false }]
            }).select('agent items');
        } else {
            data = await DB.THREE_D_KYAT_TICKET_DB.find({
                $and: [{
                    "date.win": search_date
                }, { "agent.id": auth_user._id }, { "delete.is_delete": false }]
            }).select('agent items');
        }
        res.send({
            status: 1,
            data: data,
        });
    } catch (error) {
        console.log("Error From threeDTableNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let threeDCutNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let win_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let data = await DB.THREE_D_CUT_KYAT_NUMBER_DB.find({ win_date: win_date });
        data = _.filter(data, (e) => e.amount != 0);
        data = _.groupBy(data, 'name');
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From threeDCutNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let cutByName = async (req, res, next) => {
    try {
        let from = req.body.from;
        let to = req.body.to;
        let search_date = req.body.search_date;
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let items = req.body.items;
        let numAry = _.pluck(items, 'num');
        let count = await DB.THREE_D_CUT_KYAT_NUMBER_DB.find({ $and: [{ bet_num: { $in: Array.from(new Set(numAry)) } }, { win_date: search_date }, { name: from }] }).countDocuments();
        if (items.length != count) {
            next(new Error(`စာရင်း မှားယွင်းနေပါသည်။`));
            return;
        }

        let c = 0;
        let amount = 0;
        for await (let item of items) {
            c++;
            amount += item.amount;
            await DB.THREE_D_CUT_KYAT_NUMBER_DB.updateOne({ $and: [{ name: from }, { win_date: search_date }, { bet_num: item.num }] }, { $inc: { amount: -Math.abs(item.amount) } });
            let check_data = await DB.THREE_D_CUT_KYAT_NUMBER_DB.findOne({ $and: [{ name: to }, { win_date: search_date }, { bet_num: item.num }] });
            if (check_data) {
                await DB.THREE_D_CUT_KYAT_NUMBER_DB.updateOne({ _id: check_data._id }, { $inc: { amount: item.amount } });
            } else {
                await new DB.THREE_D_CUT_KYAT_NUMBER_DB({
                    name: to,
                    win_date: search_date,
                    bet_num: item.num,
                    amount: item.amount,
                }).save();
            }
        }

        res.send({
            status: 1,
            msg: `${to} ဖျတ်ယူထားသော အကွက်ရေ ${c} စုစုပေါင်း ${amount} ကို စရင်းသွင်းပြီးပါပြီ။`
        });
    } catch (error) {
        console.log("Error From cutByName => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let cashVoucher = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let data = await DB.THREE_D_KYAT_TICKET_DB.findOne({ $and: [{ _id: search_id }, { "agent.id": auth_user._id }, { "delete.is_delete": false }, { "status.finish": true }] });
        if (!data) {
            next(new Error(`ဘောင်ချာ နံပါတ်မှားယွင်နေပါသည်။`));
            return;
        }
        await DB.THREE_D_TICKET_DB.updateOne({ _id: data._id }, {
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
        let setting = await DB.THREE_D_SETTING_DB.findOne({ show_id: 0 });
        start_date = MOMENT(Date.parse(start_date)).tz("Asia/Rangoon").startOf("days");
        end_date = MOMENT(Date.parse(end_date)).tz("Asia/Rangoon").endOf("days");
        let users = await DB.UserDB.find();
        users = _.indexBy(users, "_id");
        let tickets = await DB.THREE_D_KYAT_TICKET_DB.find({
            $and: [{
                "date.win": {
                    $gte: start_date,
                    $lte: end_date
                }
            }, { "delete.is_delete": false }]
        });
        tickets = _.groupBy(tickets, (e) => e.agent.id);
        let data = [];
        for (let [key, value] of Object.entries(tickets)) {
            if (key in users) {
                let user = users[key];
                let user_data = {
                    name: user.name,
                    bet: 0,
                    apo: user.thai_apo / 10,
                    bet_apo: 0,
                    com: 0,
                    bet_com: 0,
                    win_amount: 0,
                    bet_win: 0,
                    total_plus: 0,
                    total_minus: 0
                }
                for (let bet of value) {
                    for (let item of bet.items) {
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
            bet: 0,
            bet_apo: 0,
            com: 0,
            bet_com: 0,
            win_amount: 0,
            bet_win: 0,
            total_plus: 0,
            total_minus: 0,
        }
        for (let d of data) {
            d.bet_apo = d.bet / d.apo;
            d.bet_com = d.bet * 0.6;
            d.com = d.bet_apo - d.bet_com;
            let total_win_lose = d.bet_com - d.win_amount;
            if (total_win_lose >= 0) {
                d.total_plus = total_win_lose;
            } else {
                d.total_minus = Math.abs(total_win_lose);
            }
            delete d.apo;
            total.bet += d.bet;
            total.bet_apo += d.bet_apo;
            total.bet_com += d.bet_com;
            total.com += d.com;
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

        let cut_tickets = await DB.THREE_D_CUT_KYAT_NUMBER_DB.find({ win_date: { $gte: start_date, $lte: end_date } });
        let cut_data = [];
        let win_numbers = await DB.THREE_D_WIN_NUMBER_DB.find({ win_date: { $gte: start_date, $lte: end_date } });
        win_numbers = _.indexBy(win_numbers, "win_date");
        cut_tickets = _.groupBy(cut_tickets, "name");


        for (let [key, values] of Object.entries(cut_tickets)) {
            if (key.trim().toLowerCase() != "company" && key.trim().toLowerCase() != "hnh") {
                let d = {
                    name: key,
                    bet: 0,
                    bet_apo: 0,
                    com: 0,
                    bet_com: 0,
                    win_amount: 0,
                    bet_win: 0,
                    total_plus: 0,
                    total_minus: 0,
                }
                for (let item of values) {
                    d.bet += item.amount;
                    if (item.win_date in win_numbers) {
                        let win_number = win_numbers[item.win_date].win_number;
                        d.bet_apo += item.amount / 1.4;
                        d.bet_com += item.amount * 0.6;
                        d.com += (item.amount / 1.4) - (item.amount * 0.6);
                        if (item.bet_num == win_number) {
                            d.win_amount += item.amount * setting.win_percent;
                            d.bet_win += item.amount;
                        }
                    }
                }
                if (d.bet_com > d.win_amount) {
                    d.total_minus += Math.abs(d.bet_com - d.win_amount);
                } else {
                    d.total_plus += Math.abs(d.win_amount - d.bet_com);
                }
                cut_data.push(d);
            }
        }
        res.send({
            status: 1,
            data,
            total,
            cut_data,
        })
    } catch (error) {
        console.log("Error From getProfitLedger => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let getThreeDFinalLedger = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (!search_date || UTILS.is_date(search_date)) {
            res.send({ status: 0, msg: "မအောင်မြင်ပါ။" });
            return;
        }
        search_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf("days");
        let tickets = await DB.THREE_D_KYAT_TICKET_DB.find({
            $and: [{
                "date.win": search_date
            }, { "delete.is_delete": false }, { 'agent.id': auth_user._id }]
        });
        let data = {
            bet: 0,
            bet_com: 0,
            win_amount: 0,
            bet_win: 0,
            total: 0,
        }

        for (let bet of tickets) {
            for (let item of bet.items) {
                data.bet += item.bet_amount;
                data.win_amount += item.win_amount;
                if (item.win_amount > 0) {
                    data.bet_win += item.bet_amount;
                }
            }
        }
        data.bet_com = parseInt(data.bet * 0.6);
        data.total = parseInt(data.bet_com - data.win_amount);
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From getThreeDFinalLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let remarkThreeD = async (req, res, next) => {
    try {
        let search_id =req.body.search_id;
        let remark =req.body.remark;
        await DB.THREE_D_KYAT_TICKET_DB.updateOne({_id:search_id},{$set:{remark:remark}});
        res.send({ status: 1 });
    } catch (error) {
        console.log("Error From Three D Remark => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
module.exports = {
    checkThreeD,
    saveThreeD,
    threeDTicketNumber,
    deleteThreeDTicket,
    threeDTableNumber,
    threeDCutNumber,
    cutByName,
    cashVoucher,
    getProfitLedger,
    getThreeDFinalLedger,
    threeDDeleteTicketNumber,
    remarkThreeD
}