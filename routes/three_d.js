const DB = require('../../models/DB');
const UTILS = require('../../helpers/Utils');
const MOMENT = require('moment-timezone');
const _ = require('underscore');
let SAVE_CUT_THREE_D = async (items, name, win_date) => {
    for await (let item of items) {
        let data = await DB.THREE_D_CUT_NUMBER_DB.findOne({$and: [{name: name}, {win_date: win_date}, {num: item.num}]});
        if (data) {
            await DB.THREE_D_CUT_NUMBER_DB.updateOne({_id: data._id}, {$inc: {amount: item.bet_amount}});
        } else {
            await new DB.THREE_D_CUT_NUMBER_DB({
                name: name,
                win_date: win_date,
                bet_num: item.num,
                amount: item.bet_amount,
            }).save();
        }
    }
}
let threeDSetting = async (req, res, next) => {
    try {
        let data = await DB.THREE_D_SETTING_DB.findOne({show_id: 0});
        res.send({status: 1, data});
    } catch (error) {
        console.log("Error From threeDSetting => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let checkThreeD = async (req, res, next) => {
    try {
        let setting = await DB.THREE_D_SETTING_DB.findOne({show_id: 0});
        const is_close = UTILS.checkCloseThreeD(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let items = req.body.items;
        let confirm = false;
        let data = [];
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        for await (let item of items) {
            let response = await DB.THREE_D_TICKET_DB.find({
                $and: [
                    {"date.win": win_date},
                    {"items.num": item.num},
                    {"delete.is_delete": false},
                ]
            });
            let server_amount = 0;
            for (let res of response) {
                server_amount += res.items.find(e => e.num == item.num).bet_amount;
            }
            if (data.some(e => e.num === item.num)) {
                for (let d of data) {
                    if (d.num == item.num) {
                        d.bet_amount += item.bet_amount;
                        d.original_amount += item.bet_amount;
                        d.server_amount = server_amount;
                    }
                }
            } else {
                item.server_amount = server_amount;
                data.push(item);
            }
        }
        for await(let d of data) {
            let block_number = await DB.THREE_D_BLOCK_NUMBER_DB.findOne({block_number: d.num});
            if (block_number || d.server_amount >= setting.block_amount) {
                d.bet_amount = 0;
                confirm = true;
            } else if (d.bet_amount + d.server_amount > setting.block_amount) {
                d.bet_amount = setting.block_amount - d.server_amount;
                confirm = true;
            }
        }
        res.send({status: 1, data: {confirm, numbers: data}});
    } catch (error) {
        console.log("Error From checkThreeD => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let saveThreeD = async (req, res, next) => {
    try {
        let setting = await DB.THREE_D_SETTING_DB.findOne({show_id: 0});
        const is_close = UTILS.checkCloseThreeD(setting);
        if (is_close) {
            next(new Error(`လောင်းကြေးပိတ်သွားပါပြီ။`));
            return;
        }
        let items = req.body.items;
        let name = req.body.name;
        let auth_user = res.locals.auth_user;
        let confirm = false;
        let data = [];
        let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
        for await (let item of items) {
            let response = await DB.THREE_D_TICKET_DB.find({
                $and: [
                    {"date.win": win_date},
                    {"items.num": item.num},
                    {"delete.is_delete": false},
                ]
            });
            let server_amount = 0;
            for (let res of response) {
                server_amount += res.items.find(e => e.num == item.num).bet_amount;
            }
            if (data.some(e => e.num === item.num)) {
                for (let d of data) {
                    if (d.num == item.num) {
                        d.bet_amount += item.bet_amount;
                        d.original_amount += item.bet_amount;
                        d.server_amount = server_amount;
                    }
                }
            } else {
                item.server_amount = server_amount;
                data.push(item);
            }
        }
        for await(let d of data) {
            let block_number = await DB.THREE_D_BLOCK_NUMBER_DB.findOne({block_number: d.num});
            if (block_number || d.server_amount >= setting.block_amount) {
                d.bet_amount = 0;
                confirm = true;
            } else if (d.bet_amount + d.server_amount > setting.block_amount) {
                d.bet_amount = setting.block_amount - d.server_amount;
                confirm = true;
            }
        }

        if (confirm) {
            res.send({status: 1, data: {confirm, numbers: items}});
            return;
        }
        let total = 0;
        for (let item of items) {
            if ('original_amount' in item) {
                delete item.original_amount;
            }
            if ('server_amount' in item) {
                delete item.original_amount;
            }
            item.win_amount = 0;
            total += item.bet_amount;
        }
        let save_data = new DB.THREE_D_TICKET_DB();
        save_data.agent.id = auth_user._id;
        save_data.agent.name = auth_user.full_name;
        save_data.agent.sold_out_name = name;
        save_data.items = items;
        save_data.amount.total = total;
        save_data.date.win = win_date;
        let save_data_result = await save_data.save();
        await SAVE_CUT_THREE_D(items, 'Company', win_date);
        res.send({
            status: 1,
            data: {confirm, numbers: items},
            msg: `${items.length} ကွက် စုစုပေါင်း ${total} ကို စရင်းသွင်းပြီးပါပြီ။`,
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
        if (auth_user.is_agent == true) {
            data = await DB.THREE_D_TICKET_DB.find({
                $and: [{
                    "date.created": {
                        $gte: start_date,
                        $lte: end_date
                    }
                }, {"delete.is_delete": false}]
            });
        } else {
            data = await DB.THREE_D_TICKET_DB.find({
                $and: [{
                    "date.created": {
                        $gte: start_date,
                        $lte: end_date
                    }
                }, {"agent.id": auth_user._id}, {"delete.is_delete": false}]
            });
        }
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
        let ticket = await DB.THREE_D_TICKET_DB.findById(search_id);
        if (!ticket) {
            res.send({status: 0, msg: "ဘောင်ချာနံပါတ်မှားယွင်းနေပါသည်။"});
            return;
        }

        let setting = await DB.THREE_D_SETTING_DB.findOne({show_id: 0});
        let now = MOMENT(Date.now()).tz("Asia/Rangoon");
        if (auth_user.is_agent == false && MOMENT(ticket.date.created).tz("Asia/Rangoon").add(setting.delete_minute, 'minutes').isBefore(now)) {
            res.send({status: 0, msg: "စာရင်း တင်ပြီးသွားသော နံပါတ်များကို ဖျတ်ခွင့်မရှိတော့ပါ။"});
            return;
        }

        await DB.THREE_D_TICKET_DB.updateOne({_id: ticket._id}, {
            $set: {
                "delete.is_delete": true,
                "delete.name": auth_user.full_name,
                "delete.date": MOMENT(Date.now()).tz("Asia/Rangoon")
            }
        });
        for await(let item of ticket.items) {
            await DB.THREE_D_CUT_NUMBER_DB.updateOne({
                $and: [
                    {bet_num: item.num},
                    {name: "Company"},
                    {win_date: ticket.date.win}
                ]
            }, {$inc: {amount: -Math.abs(item.bet_amount)}})
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
            data = await DB.THREE_D_TICKET_DB.find({
                $and: [{
                    "date.win": search_date
                }, {"delete.is_delete": false}]
            }).select('agent items');
        } else {
            data = await DB.THREE_D_TICKET_DB.find({
                $and: [{
                    "date.win": search_date
                }, {"agent.id": auth_user._id}, {"delete.is_delete": false}]
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
let saveThreeDWinNumber = async (req, res, next) => {
    try {
        let win_number = req.body.win_number;
        let setting = await DB.THREE_D_SETTING_DB.findOne({show_id: 0});
        let auth_user = res.locals.auth_user;
        let win_date = MOMENT(Date.parse(setting.win_date)).tz("Asia/Rangoon").startOf('days');
        let tickets = await DB.THREE_D_TICKET_DB.find({$and: [{"date.win": win_date}, {"delete.is_delete": false}]});
        for await(let ticket of tickets) {
            let items = ticket.items;
            let win_amount = 0;
            items.forEach((item) => {
                if (item.num == win_number) {
                    item.win_amount = item.bet_amount * setting.win_percent;
                    win_amount += item.bet_amount * setting.win_percent;
                } else {
                    item.win_amount = 0;
                }
            });
            await DB.THREE_D_TICKET_DB.findByIdAndUpdate(ticket._id, {
                items: items,
                "amount.win": win_amount,
                "status.cash": win_amount == 0,
                "status.finish": true,
            });
        }
        let win_data = await DB.THREE_D_WIN_NUMBER_DB.findOne({win_date: win_date});
        if (win_data) {
            await DB.THREE_D_WIN_NUMBER_DB.updateOne({_id: win_data._id}, {win_number: win_number});
        } else {
            await new DB.THREE_D_WIN_NUMBER_DB({
                win_date: win_date, win_number: win_number, agent: {
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
        console.log("Error From saveThreeDWinNumber => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let threeDWinNumbers = async (req, res, next) => {
    try {
        let data = await DB.THREE_D_WIN_NUMBER_DB.find().limit(100);
        res.send({
            status: 1,
            data
        });
    } catch (error) {
        console.log("Error From threeDWinNumbers => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let updateThreeDSetting = async (req, res, next) => {
    try {
        let update_data = req.body;
        await DB.THREE_D_SETTING_DB.updateOne({show_id: 0}, {$set: update_data})
        res.send({
            status: 1,
            msg: "သုံးလုံး (ထိုင်း) setting ကို update လုပ်ပြီးပါပြီ။"
        })
    } catch (error) {
        console.log("Error From updateThreeDSetting => ", error);
        next(new Error(process.env.connect_dev));
    }
}
let threeDCutNumber = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let win_date = MOMENT(Date.parse(search_date)).tz("Asia/Rangoon").startOf('days');
        let data = await DB.THREE_D_CUT_NUMBER_DB.find({win_date: win_date});
        data =_.filter(data,(e)=>e.amount !=0);
        data = _.groupBy(data, 'name');
        res.send({status: 1, data});
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
        let count = await DB.THREE_D_CUT_NUMBER_DB.find({$and: [{bet_num: {$in: Array.from(new Set(numAry))}}, {win_date: search_date}, {name: from}]}).countDocuments();
        if (items.length != count) {
            next(new Error(`စာရင်း မှားယွင်းနေပါသည်။`));
            return;
        }

        let c = 0;
        let amount = 0;
        for await (let item of items) {
            c++;
            amount += item.amount;
            await DB.THREE_D_CUT_NUMBER_DB.updateOne({$and: [{name: from}, {win_date: search_date}, {bet_num: item.num}]}, {$inc: {amount: -Math.abs(item.amount)}});
            let check_data = await DB.THREE_D_CUT_NUMBER_DB.findOne({$and: [{name: to}, {win_date: search_date}, {bet_num: item.num}]});
            if (check_data) {
                await DB.THREE_D_CUT_NUMBER_DB.updateOne({_id: check_data._id}, {$inc: {amount: item.amount}});
            } else {
                await new DB.THREE_D_CUT_NUMBER_DB({
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
        let auth_user =res.locals.auth_user;
        let data = await DB.THREE_D_TICKET_DB.findOne({$and:[{_id:search_id},{"agent.id":auth_user._id},{"delete.is_delete": false}, {"status.finish": true}]});
        if (!data) {
            next(new Error(`ဘောင်ချာ နံပါတ်မှားယွင်နေပါသည်။`));
            return;
        }
        await DB.THREE_D_TICKET_DB.updateOne({_id: data._id}, {
            $set: {
                "status.cash": true
            }
        });
        res.send({status:1, msg: `ဘောင်ချာနံပါတ် ${data.voucher_id.toString().padStart(6, '0')} ကို ငွေရှင်းပြီးပါပြီ။`})
    } catch (error) {
        console.log("Error From cashVoucher => ", error);
        next(new Error(process.env.connect_dev));
    }
}
module.exports = {
    threeDSetting,
    checkThreeD,
    saveThreeD,
    threeDTicketNumber,
    deleteThreeDTicket,
    threeDTableNumber,
    saveThreeDWinNumber,
    threeDWinNumbers,
    updateThreeDSetting,
    threeDCutNumber,
    cutByName,
    cashVoucher
}