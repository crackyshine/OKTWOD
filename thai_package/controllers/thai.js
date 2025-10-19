const DB = require('../../models/DB');
const UTILS = require('../../helpers/Utils');
const VALIDATOR = require('../../helpers/validator');
const USER_GEN = require('../../CKLibby/UserGen');
const MOMENT = require("moment-timezone");
const _ = require('underscore');
const THAI_GEN = require('../libby/thai_gan');
const { date } = require('joi');
const { win_number } = require('../../three_d_package/schemas/three_d');
let checkPermute = (win_num, num) => {
    let permute_list = UTILS.permute(win_num);
    if (permute_list.includes(num)) {
        return true;
    }
    return false;
}
let getSellTicketLedgers = async (req, res, next) => {
    try {
        let settings = await DB.SettingDB.findOne();
        let search_date = MOMENT(Date.parse(settings.date)).tz('Asia/Rangoon').unix();
        let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { status: "ACTIVE" }] }).select('ticket income amount remark created');
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getShopSellTicketLedgers = async (req, res, next) => {
    try {
        let settings = await DB.SettingDB.findOne();
        let auth_user = res.locals.auth_user;
        let search_date = MOMENT(Date.parse(settings.date)).tz('Asia/Rangoon').unix();
        let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { "income.user_id": auth_user._id }, { status: "ACTIVE" }] }).select('ticket income amount remark created');
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getShopSellTicketLedgers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getTicketLedgers = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { status: { $ne: "DELETE" } }] });
        // let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getAgentSoldOutTicketLedgers = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        if (auth_user.name == "MKHNH" || auth_user.name == "HLHNH") {
            console.log("Auth User => ", search_date);
        }
        let items = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { status: { $ne: "DELETE" } }, { $or: [{ "income.user_id": auth_user._id }, { "sold_out.user_id": auth_user._id }] }] });
        let shop = await DB.THAI_SHOP_LEDGER.findOne({ $and: [{ win_date: search_date }, { user_id: auth_user._id }] });
        res.send({ status: 1, data: { items, shop } });
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getAgentCashTicketLedgers = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let auth_user = res.locals.auth_user;
        let items = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { "win_amount.total": { $gt: 0 } }, { cash: { $ne: null } }, { "cash.user_id": auth_user._id }] });
        let cash = await DB.THAI_CASH_LEDGER.findOne({ $and: [{ win_date: search_date }, { user_id: auth_user._id }] });
        res.send({ status: 1, data: { items, cash } });
    } catch (err) {
        console.log("Error From getAgentCashTicketLedgers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getCheckAgentCashTicketLedgers = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let search_id = req.body.search_id;
        let user = await DB.UserDB.findById(search_id);
        if (!user) {
            res.send({ status: 0, msg: "Invalid User" })
            return;
        }
        let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { "cash.user_id": user._id }, { status: "CASHED" }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From getCheckAgentCashTicketLedgers => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getDeleteTicketLedger = async (req, res, next) => {
    try {
        let settings = await DB.SettingDB.findOne();
        let search_date = MOMENT(Date.parse(settings.date)).tz('Asia/Rangoon').unix();
        let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { status: "DELETE" }, { "income.user_id": auth_user._id }] });
        res.send({ status: 1, data });
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let soldOutSingleTicket = async (req, res, next) => {
    try {
        let id = req.body.id;
        let promotion = req.body.promotion;
        let contact = req.body.contact;
        let remark = req.body.remark;
        let device_id = req.headers.device_id;
        let auth_user = res.locals.auth_user;
        if (!id) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        if (isNaN(promotion)) {
            res.send({ status: 0, msg: "Promotion တန်ဖိုးမှားယွင်းနေပါသည်။" });
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (setting.open == false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        // if (MOMENT(setting.date).tz("Asia/Rangoon").startOf('day').isBefore(MOMENT(Date.now()).tz("Asia/Rangoon"))) {
        //     res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
        //     return;
        // }
        let search_date = MOMENT(Date.parse(setting.date)).tz('Asia/Rangoon').unix();
        let ticket_ledger = await DB.THAI_LEDGER.findOne({
            $and: [
                { _id: id },
                { status: "ACTIVE" },
                { "win_date": search_date },
            ]
        });
        if (!ticket_ledger) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let sold_out_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        if (THAI_GEN.IS_CLOSE(setting.win_date, sold_out_date)) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        let ticket = ticket_ledger.ticket;
        let update_remark = remark;
        if (remark != "") {
            update_remark = `${auth_user.full_name} : ${remark}`;
        }
        await DB.THAI_LEDGER.updateOne({ _id: ticket_ledger._id }, {
            $set: {
                sold_out: {
                    user_id: auth_user._id,
                    name: auth_user.full_name,
                },
                status: "SOLD_OUT",
                "amount.com": ticket_ledger.amount.ticket - ticket_ledger.amount.sold_out,
                "amount.promotin": promotion,
                contact: contact,
                remark: update_remark,
                sold_out_date: sold_out_date,
                created: sold_out_date
            }
        });
        await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
            $set: {
                "device.sold_out": device_id,
                "date.sold_out": sold_out_date,
            }
        });
        if (remark != "") {
            await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
                $push: {
                    remark_history: {
                        name: auth_user.full_name,
                        message: remark
                    }
                }
            });
        }
        res.send({
            status: 1,
            msg: `လက်မှတ်နံပါတ် ${ticket.number} ကို ရောင်းပြီးပါပြီ။`
        })
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let soldOutMultiTicket = async (req, res, next) => {
    try {
        let ids = req.body.ids;
        let promotion = req.body.promotion;
        let contact = req.body.contact;
        let remark = req.body.remark;
        let device_id = req.headers.device_id;
        let auth_user = res.locals.auth_user;
        if (!ids) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        ids.forEach((item) => {
            if (!item || !UTILS.is_mongo(item)) {
                res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
                return;
            }
        });
        let items = _.uniq(ids);

        if (isNaN(promotion)) {
            res.send({ status: 0, msg: "Promotion တန်ဖိုးမှားယွင်းနေပါသည်။" });
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (setting.open == false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        // if (MOMENT(setting.date).tz("Asia/Rangoon").startOf('day').isBefore(MOMENT(Date.now()).tz("Asia/Rangoon"))) {
        //     res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
        //     return;
        // }
        let search_date = MOMENT(Date.parse(setting.date)).tz('Asia/Rangoon').unix();
        let sold_out_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        if (THAI_GEN.IS_CLOSE(setting.win_date, sold_out_date)) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        let ticket_ledgers = await DB.THAI_LEDGER.find({
            $and: [
                { _id: { $in: Array.from(new Set(items)) } },
                { status: "ACTIVE" },
                { "win_date": search_date },
            ]
        });
        if (!ticket_ledgers || ticket_ledgers.length != items.length) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        for await (let ticket_ledger of ticket_ledgers) {
            let ticket = ticket_ledger.ticket;
            let com = ticket_ledger.amount.ticket - ticket_ledger.amount.sold_out;
            let update_remark = remark;
            if (remark != "") {
                update_remark = `${user.full_name} : ${remark}`;
            }
            await DB.THAI_LEDGER.updateOne({ _id: ticket_ledger._id }, {
                $set: {
                    sold_out: {
                        user_id: auth_user._id,
                        name: auth_user.full_name,
                    },
                    status: "SOLD_OUT",
                    "amount.com": ticket_ledger.amount.ticket - ticket_ledger.amount.sold_out,
                    "amount.promotin": promotion,
                    contact: contact,
                    remark: update_remark,
                    sold_out_date: sold_out_date,
                    created: sold_out_date
                }
            });
            await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
                $set: {
                    "device.sold_out": device_id,
                    "date.sold_out": sold_out_date,
                }
            });
            if (remark != "") {
                await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
                    $push: {
                        remark_history: {
                            name: auth_user.full_name,
                            message: remark
                        }
                    }
                });
            }
        }
        res.send({
            status: 1,
            msg: `လက်မှတ်များရောင်းပြီးပါပြီ။`
        })
    } catch (err) {
        console.log("Error From ticketLedgerByAgent => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let updateRemark = async (req, res, next) => {
    try {
        let id = req.body.id;
        let remark = req.body.remark;
        let user = res.locals.auth_user;
        let ticket = await DB.THAI_LEDGER.findById(id);
        if (ticket) {
            let update_remark = remark;
            if (remark != "") {
                update_remark = `${user.full_name} : ${remark}`;
                await DB.THAI_EXTRA.updateOne({ ticket_id: ticket._id }, {
                    $push: {
                        remark_history: {
                            name: user.full_name,
                            message: remark
                        }
                    }
                });
            }
            await DB.THAI_LEDGER.updateOne({ _id: ticket._id }, { $set: { "remark": update_remark } });
            res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
        } else {
            res.send({ status: 0 });
        }
    } catch (error) {
        console.log("Error From updateRemark => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}

let deleteTicketLedger = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let device_id = req.headers.device_id;
        let auth_user = res.locals.auth_user;
        let ticket_ledger = await DB.THAI_LEDGER.findOne({ $and: [{ _id: search_id }, { "income.user_id": auth_user._id }, { status: "ACTIVE" }] });
        if (!ticket_ledger) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (setting.open == false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        let delete_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        await DB.THAI_LEDGER.updateOne({ _id: ticket_ledger._id }, {
            $set: {
                status: "DELETE",
                created: delete_date
            }
        });
        await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
            $set: {
                "device.delete": device_id,
                "date.delete": delete_date,
            }
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (erro) {
        console.log("Error From deleteTicketLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}

let unSellTicketLedger = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let ticket_ledger = await DB.THAI_LEDGER.findOne({ $and: [{ _id: search_id }, { status: "SOLD_OUT" }, { "sold_out.user_id": auth_user._id }] });
        if (!ticket_ledger) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        let setting = await DB.SettingDB.findOne({ show_id: 0 });
        if (setting.open == false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        let extra_ledger = await DB.THAI_EXTRA.findOne({ ticket_id: ticket_ledger._id });
        await DB.THAI_LEDGER.updateOne({ _id: ticket_ledger._id }, {
            $set: {
                sold_out: null,
                status: "ACTIVE",
                "amount.com": 0,
                "amount.promotion": 0,
                contact: "",
                sold_out_date: 0,
                created: extra_ledger.date.income
            }
        });
        await DB.THAI_EXTRA.updateOne({ _id: extra_ledger._id }, {
            $set: {
                "date.sold_out": 0
            }
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From unSellTicketLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}

let cashTicketLedger = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let device_id = req.headers.device_id;
        let ticket_ledger = await DB.THAI_LEDGER.findOne({ $and: [{ _id: search_id }, { cash: null }, { "win_amount.total": { $gt: 0 } }, { delete: null }] });
        if (!ticket_ledger) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        let cash_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        await DB.THAI_LEDGER.updateOne({ _id: ticket_ledger._id }, {
            $set: {
                cash: {
                    user_id: auth_user._id,
                    name: auth_user.full_name,
                },
                status: "CASHED",
                "amount.cash": ticket_ledger.win_amount.total,
                created: cash_date
            }
        });
        await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
            $set: {
                "device.cash": device_id,
                "date.cash": cash_date
            }
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From cashTicketLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let cashAirOnlyTicketLedger = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        let device_id = req.headers.device_id;
        let ticket_ledger = await DB.THAI_LEDGER.findOne({ $and: [{ _id: search_id }, { cash: null }, { "win_amount.simple": { $gt: 0 } }, { "win_amount.air": { $gt: 0 } }, { delete: null }] });
        if (!ticket_ledger) {
            res.send({ status: 0, msg: "လက်မှတ်မှားယွင်းနေပါသည်။" })
            return;
        }
        let cash_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        await DB.THAI_LEDGER.updateOne({ _id: ticket_ledger._id }, {
            $set: {
                cash: {
                    user_id: auth_user._id,
                    name: auth_user.full_name,
                },
                status: "CASHED",
                "amount.cash": ticket_ledger.win_amount.air,
                created: cash_date
            }
        });
        await DB.THAI_EXTRA.updateOne({ ticket_id: ticket_ledger._id }, {
            $set: {
                "device.cash": device_id,
                "date.cash": cash_date
            }
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From cashTicketLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let getSimplePrice = async (req, res, next) => {
    try {
        let data = await DB.SIMPLE_PRICE_SETTING.findOne();
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From cashTicketLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let updateSimplePrice = async (req, res, next) => {
    try {
        let data = req.body;
        await DB.SIMPLE_PRICE_SETTING.updateOne({}, { $set: data });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From cashTicketLedger => ", error);
        next(new Error(process.env.CONNECT_DEV));
    }
}
let getSoldOutProfit = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let ticket_items = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { status: { $ne: "DELETE" } }] });
        let shop_items = await DB.THAI_SHOP_LEDGER.find({ "win_date": search_date });
        res.send({ status: 1, data: { shop_items, ticket_items } });
    } catch (err) {
        console.log("Error From getSoldOutLedger => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getCashProfit = async (req, res, next) => {
    try {
        let search_date = req.body.search_date;
        let ticket_items = await DB.THAI_LEDGER.find({ $and: [{ "win_date": search_date }, { "win_amount.total": { $gt: 0 } }, { cash: { $ne: null } }] });
        let cash_items = await DB.THAI_CASH_LEDGER.find({ "win_date": search_date });
        res.send({ status: 1, data: { cash_items, ticket_items } });
    } catch (err) {
        console.log("Error From getCashProfit => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let soldOutPrePay = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let amount = req.body.amount;
        let remark = req.body.remark;
        let date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        let data = await DB.THAI_SHOP_LEDGER.findById(search_id);
        if (!data) {
            res.send({ status: 0, msg: "Invalid User" });
            return;
        }
        let balance_history = data.balance_history;
        balance_history.push({
            amount: amount,
            remark: remark,
            date: date
        })
        await DB.THAI_SHOP_LEDGER.updateOne({ _id: data._id }, { $inc: { balance: amount }, $set: { balance_history: balance_history } })
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (err) {
        console.log("Error From soldOutPrePay => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let cashPrePay = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let amount = req.body.amount;
        let remark = req.body.remark;
        let date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        let data = await DB.THAI_CASH_LEDGER.findById(search_id);
        if (!data) {
            res.send({ status: 0, msg: "Invalid User" });
            return;
        }
        let balance_history = data.balance_history;
        balance_history.push({
            amount: amount,
            remark: remark,
            date: date
        })
        await DB.THAI_CASH_LEDGER.updateOne({ _id: data._id }, { $inc: { balance: amount }, $set: { balance_history: balance_history } })
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (err) {
        console.log("Error From soldOutPrePay => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let cashBalance = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        let data = await DB.THAI_CASH_LEDGER.findById(search_id);
        if (!data) {
            res.send({ status: 0, msg: "Invalid User" });
            return;
        }
        cash_history = data.cash_history;
        cash_history.push(date);
        let ticket_ledgers = await DB.THAI_LEDGER.find({ $and: [{ win_date: data.win_date }, { "cash.user_id": data.user_id }, { status: "CASHED" }] });
        let amount = 0;
        for (let ticket_ledger of ticket_ledgers) {
            amount += ticket_ledger.amount.cash;
        }
        await DB.THAI_CASH_LEDGER.updateOne({ _id: data._id }, { $inc: { balance: -amount }, $set: { cash_history: cash_history } });
        await DB.THAI_LEDGER.updateMany({ $and: [{ "win_date": data.win_date }, { "cash.user_id": data.user_id }, { status: "CASHED" }] }, { $set: { status: "COMPANY", "created": date } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (err) {
        console.log("Error From cashBalance => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let closeTickets = async (req, res, next) => {
    try {
        let items = req.body.ids;
        let auth_user = res.locals.auth_user;
        let settings = await DB.SettingDB.findOne();
        if (settings.open == false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        let search_date = MOMENT(Date.parse(settings.date)).tz('Asia/Rangoon').unix();
        let tickets = await DB.THAI_LEDGER.find({ $and: [{ win_date: search_date }, { "income.user_id": auth_user._id }, { _id: { $in: Array.from(new Set(items)) } }, { status: "ACTIVE" }] });
        if (tickets.length != items.length) {
            res.send({ status: 0, msg: "လက်မှတ်မှားနေပါသည်။" });
            return;
        }
        let ids = _.pluck(tickets, '_id');
        await DB.THAI_LEDGER.updateMany({ _id: { $in: Array.from(new Set(ids)) } }, { $set: { status: "CLOSE" } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From cashBalance => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let sellActiveTickets = async (req, res, next) => {
    try {
        let auth_user = res.locals.auth_user;
        let settings = await DB.SettingDB.findOne();
        if (settings.open == false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        let device_id = req.headers.device_id;
        let search_date = MOMENT(Date.parse(settings.date)).tz('Asia/Rangoon').unix();
        let sold_out_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        let tickets = await DB.THAI_LEDGER.find({ $and: [{ win_date: search_date }, { "income.user_id": auth_user._id }, { status: "ACTIVE" }] });
        if (tickets.length > 0) {
            let ids = _.pluck(tickets, '_id');
            for await (let ticket of tickets) {
                await DB.THAI_LEDGER.updateOne({ _id: ticket._id }, {
                    $set: {
                        sold_out: {
                            user_id: auth_user._id,
                            name: auth_user.full_name,
                        },
                        status: "SOLD_OUT",
                        "amount.com": ticket.amount.ticket - ticket.amount.sold_out,
                        remark: "CLOSE",
                        sold_out_date: sold_out_date,
                        created: sold_out_date
                    }
                });
            }
            await DB.THAI_EXTRA.updateOne({ ticket_id: { $in: Array.from(new Set(ids)) } }, {
                $set: {
                    "device.sold_out": device_id,
                    "date.sold_out": sold_out_date,
                }
            });
        }
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From cashBalance => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
// let getOtherHtee = async (req, res, next) => {
//     try {
//         let auth_user = res.locals.auth_user;
//         let data = await DB.THAI_OTHER_TICKET_LEDGER.find({ $and: [{ status: "ACTIVE" }, { "income.user_id": auth_user._id }] }).sort({ created: -1 });
//         res.send({ status: 1, data });
//     } catch (error) {
//         console.log("Error From getOtherHtee => ", error);
//         res.send({ status: 0, msg: process.env.connect_dev });
//     }
// }
let getOtherHteeLedger = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        start_date = MOMENT.unix(start_date).startOf('days').unix();
        end_date = MOMENT.unix(end_date).endOf('days').unix();
        let data = await DB.THAI_OTHER_TICKET_LEDGER.find({ $and: [{ created: { $gte: start_date, $lte: end_date } }, { status: { $ne: 'DELETE' } }] });
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From getOtherHteeLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getOtherHteeByAgent = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        start_date = MOMENT.unix(start_date).startOf('days').unix();
        end_date = MOMENT.unix(end_date).endOf('days').unix();
        let data = await DB.THAI_OTHER_TICKET_LEDGER.find({ $and: [{ created: { $gte: start_date, $lte: end_date } }, { "income.user_id": search_id }, { status: { $ne: "DELETE" } }] });
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From getOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let getOtherHtee = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let auth_user = res.locals.auth_user;
        start_date = MOMENT.unix(start_date).startOf('days').unix();
        end_date = MOMENT.unix(end_date).endOf('days').unix();
        let data = await DB.THAI_OTHER_TICKET_LEDGER.find({ $and: [{ status: { $ne: "DELETE" } }, { "income.user_id": auth_user._id }, { cash_date: { $gte: start_date, $lte: end_date } }] }).sort({ cash_date: -1 });
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From getOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let createOtherHtee = async (req, res, next) => {
    try {
        let number = req.body.number;
        let amount = req.body.amount;
        let contact = req.body.contact;
        let remark = req.body.remark;
        let auth_user = res.locals.auth_user;
        if (number == "") {
            res.send({ status: 0, msg: "ထီနံပါတ်မှားယွင်းနေပါသည်။" });
            return;
        }
        let created = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        let save_data = new DB.THAI_OTHER_TICKET_LEDGER();
        save_data.number = number;
        save_data.amount = amount;
        save_data.contact = contact;
        save_data.remark = remark;
        save_data.income = {
            user_id: auth_user._id,
            name: auth_user.full_name
        };
        save_data.cash_date = created;
        save_data.created = created;
        await save_data.save();
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From createOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteOtherHtee = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        let auth_user = res.locals.auth_user;
        let check_ticket = await DB.THAI_OTHER_TICKET_LEDGER.findOne({ $and: [{ _id: search_id }, { "income.user_id": auth_user._id }, { status: 'ACTIVE' }] });
        if (!check_ticket) {
            res.send({ status: 0, msg: "လက်မှတ်မှားနေပါသည်။" });
            return;
        }
        await DB.THAI_OTHER_TICKET_LEDGER.updateOne({ _id: check_ticket._id }, { $set: { status: 'DELETE', remark: remark } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From deleteOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let deleteOtherHteeByAgent = async (req, res, next) => {
    try {
        let remark = req.body.remark;
        let auth_user = res.locals.auth_user;
        let check_ticket = await DB.THAI_OTHER_TICKET_LEDGER.find({ $and: [{ "income.user_id": auth_user._id }, { status: 'ACTIVE' }] });
        if (check_ticket.length == 0) {
            res.send({ status: 0, msg: "လက်မှတ်မှားနေပါသည်။" });
            return;
        }
        await DB.THAI_OTHER_TICKET_LEDGER.updateMany({ $and: [{ "income.user_id": auth_user._id }, { status: 'ACTIVE' }] }, { $set: { status: 'DELETE', remark: remark } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From deleteOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let remarkOtherHtee = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let remark = req.body.remark;
        let check_ticket = await DB.THAI_OTHER_TICKET_LEDGER.findById(search_id);
        if (!check_ticket) {
            res.send({ status: 0, msg: "လက်မှတ်မှားနေပါသည်။" });
            return;
        }
        await DB.THAI_OTHER_TICKET_LEDGER.updateOne({ _id: check_ticket._id }, { $set: { remark: remark } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From remarkOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let companyOtherHtee = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let check_tickets = await DB.THAI_OTHER_TICKET_LEDGER.find({ $and: [{ status: "ACTIVE" }, { "income.user_id": search_id }] });
        if (check_tickets.length == 0) {
            res.send({ status: 0, msg: "လက်မှတ်မှားနေပါသည်။" });
            return;
        }
        let sold_out_date = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        await DB.THAI_OTHER_TICKET_LEDGER.updateMany({ $and: [{ status: "ACTIVE" }, { "income.user_id": search_id }] }, { $set: { status: 'COMPANY', created: sold_out_date } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From companyOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let getKPI = async (req, res, next) => {
    try {
        let start_date = MOMENT.unix(req.body.start_date).startOf('days').unix();
        let end_date = MOMENT.unix(req.body.end_date).endOf('days').unix();
        let data = await DB.KpiDB.find({ $and: [{ start: { $gte: start_date, $lte: end_date } }, { end: { $gte: start_date, $lte: end_date } }] });
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From getKPI => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let newKPI = async (req, res, next) => {
    try {
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        // let start_date = MOMENT('2025-07-01').startOf('month');
        // let end_date = MOMENT('2025-07-01').endOf('month');
        start_date = MOMENT.unix(parseInt(start_date)).tz("Asia/Rangoon").startOf("day");
        end_date = MOMENT.unix(parseInt(end_date)).tz("Asia/Rangoon").endOf("day");
        let search_date = `${start_date.unix()}_${end_date.unix()}`;
        let data = await DB.KpiDB.findOne({ name: search_date });
        if (!data || data.length == 0) {
            // start_date = MOMENT(start_date).tz('Asia/Rangoon').startOf('days');
            // end_date = MOMENT(start_date).tz('Asia/Rangoon').startOf('days');
            let two_ledgers = await DB.TwoDNumberDB.find({ $and: [{ "date.win": { $gte: start_date, $lte: end_date } }, { "delete.is_delete": false }] });
            let three_ledgers = await DB.THREE_D_TICKET_DB.find({ $and: [{ "date.win": { $gte: start_date, $lte: end_date } }, { "delete.is_delete": false }] });
            let four_ledgers = await DB.LAO_TICKET_DB.find({ $and: [{ "date.win": { $gte: start_date, $lte: end_date } }, { "delete.is_delete": false }] });
            let six_ledgers = await DB.THAI_LEDGER.find({ $and: [{ "win_date": { $gte: start_date.unix(), $lte: end_date.unix() } }, { sold_out: { $ne: null } }, { status: { $ne: "DELETE" } }] });
            two_ledgers = THAI_GEN.GEN_NAME_AND_SUM_AMOUNT(two_ledgers);
            three_ledgers = THAI_GEN.GEN_NAME_AND_SUM_AMOUNT(three_ledgers);
            four_ledgers = THAI_GEN.GEN_LAO_NAME_AND_SUM_AMOUNT(four_ledgers);
            six_ledgers = THAI_GEN.GEN_THAI_NAME_AND_SUM_AMOUNT(six_ledgers);
            let name_exist = {};
            for (let item of two_ledgers) {
                if (!name_exist[item.name]) {
                    name_exist[item.name] = { name: item.name, two: 0, three: 0, four: 0, six: 0, total: 0, percent: 0 };
                }
                name_exist[item.name].two += item.amount;
                name_exist[item.name].total += item.amount;
            }
            for (let item of three_ledgers) {
                if (!name_exist[item.name]) {
                    name_exist[item.name] = { name: item.name, two: 0, three: 0, four: 0, six: 0, total: 0, percent: 0 };
                }
                name_exist[item.name].three += item.amount;
                name_exist[item.name].total += item.amount;
            }
            for (let item of four_ledgers) {
                if (!name_exist[item.name]) {
                    name_exist[item.name] = { name: item.name, two: 0, three: 0, four: 0, six: 0, total: 0, percent: 0 };
                }
                name_exist[item.name].four += item.amount;
                name_exist[item.name].total += item.amount;
            }
            for (let item of six_ledgers) {
                if (!name_exist[item.name]) {
                    name_exist[item.name] = { name: item.name, two: 0, three: 0, four: 0, six: 0, total: 0, percent: 0 };
                }
                name_exist[item.name].six += item.amount;
                name_exist[item.name].total += item.amount;
            }
            let items = Object.values(name_exist);
            data = {
                name: search_date,
                items: items,
                start: start_date.unix(),
                end: end_date.unix(),
                createdAt: MOMENT(Date.now()).tz('Asia/Rangoon').unix()
            }
        } else {
            res.send({ status: 0, msg: "ယခု Date ဖြင့် save ပြီးသားရှိပြီးပါပြီ။" });
            return;
        }
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From getKPI => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let setNewKPI = async (req, res, next) => {
    try {
        let item = req.body;
        let check_item = await DB.KpiDB.findOne({ name: item.name });
        if (check_item) {
            res.send({ status: 0, msg: "ယခု Date ဖြင့် save ပြီးသားရှိပြီးပါပြီ။" });
            return;
        }
        let createdAt = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        item.createdAt = createdAt;
        await new DB.KpiDB(item).save();
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From companyOtherHtee => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let deleteKpi = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        await DB.KpiDB.deleteOne({ _id: search_id });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From getKPI => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let getAgentReport = async (req, res, next) => {
    try {
        let start_date = MOMENT.unix(req.body.search_date).startOf('month');
        let end_date = MOMENT.unix(req.body.search_date).endOf('month');
        let two_win_numbers = await DB.TwoDWinNumberDB.find({ win_date: { $gte: start_date, $lte: end_date } }).sort({ date: -1 });
        let three_win_numbers = await DB.THREE_D_WIN_NUMBER_DB.find({ win_date: { $gte: start_date, $lte: end_date } }).sort({ date: -1 });
        let four_win_numbers = await DB.LAO_WIN_NUMBER_DB.find({ win_date: { $gte: start_date, $lte: end_date } }).sort({ date: -1 });
        let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
        two_win_numbers = _.indexBy(two_win_numbers, (e) => `${e.win_date}_${e.type}`);
        three_win_numbers = _.indexBy(three_win_numbers, (e) => `${e.win_date}`);
        four_win_numbers = _.indexBy(four_win_numbers, (e) => `${e.win_date}`);
        let price_items = setting.lao;
        price_items = _.indexBy(price_items, 'amount');
        let two_ledgers = await DB.TwoDCutNumber.find({ $and: [{ win_date: { $gte: start_date, $lte: end_date } }, { name: { $ne: "Company" } }] }).sort({ date: -1 });
        let three_ledgers = await DB.THREE_D_CUT_NUMBER_DB.find({ $and: [{ win_date: { $gte: start_date, $lte: end_date } }, { name: { $ne: "Company" } }] }).sort({ date: -1 });
        let four_ledgers = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{ win_date: { $gte: start_date, $lte: end_date } }, { name: { $ne: "Company" } }] }).sort({ date: -1 });
        two_ledgers = _.groupBy(two_ledgers, (e) => `${e.win_date}`);
        three_ledgers = _.groupBy(three_ledgers, (e) => `${e.win_date}`);
        four_ledgers = _.groupBy(four_ledgers, (e) => `${e.win_date}`);

        let data = [];
        //Two Ledger Start
        for (let key in two_ledgers) {
            let agent_ledger = _.groupBy(two_ledgers[key], (e) => e.name);
            for (let agent in agent_ledger) {
                let total = 0;
                let win_amount = 0;
                for (let item of agent_ledger[agent]) {
                    let win_number = two_win_numbers[`${item.win_date}_${item.type}`];
                    if (!win_number) {
                        continue;
                    }
                    total += item.amount;
                    win_amount += win_number.win_number == item.bet_num ? item.amount * 80 : 0;
                }
                let bet_amount = Math.ceil(total * (agent == "HNH" ? 1 : 0.88));
                data.push({
                    name: agent,
                    type: "two",
                    total: parseInt(bet_amount - win_amount),
                    win_date: MOMENT(Date.parse(key)).unix()
                });
            }

        }
        //Two Ledger End
        //Three Ledger Start
        for (let key in three_ledgers) {
            let agent_ledger = _.groupBy(three_ledgers[key], (e) => e.name);
            for (let agent in agent_ledger) {
                let total = 0;
                let win_amount = 0;
                for (let item of agent_ledger[agent]) {
                    let win_number = three_win_numbers[key];
                    if (!win_number) {
                        continue;
                    }
                    total += item.amount;
                    win_amount += win_number.win_number == item.bet_num ? item.amount * 500 : 0;
                }
                // let bet_amount = parseInt((agent == "HNH" ? (total / 14) * 10 : total * (agent == "MTK" ? 0.57 : 0.55)));
                let bet_amount = Math.ceil(total * (agent == "HNH" ? 1 : agent == "MTK" ? 0.57 : 0.55));
                data.push({
                    name: agent,
                    type: "three",
                    total: parseInt(bet_amount - win_amount),
                    win_date: MOMENT(Date.parse(key)).unix()
                });
            }
        }
        //Three Ledger End
        let lao_com = { 40: 35, 60: 45, 100: 80, 150: 125 };
        //Four Ledger Start
        for (let key in four_ledgers) {
            let agent_ledger = _.groupBy(four_ledgers[key], (e) => e.name);
            for (let agent in agent_ledger) {
                let four_total = 0;
                let four_three_total = 0;
                let win_amount = 0;
                for (let item of agent_ledger[agent]) {
                    let win_number = four_win_numbers[key];
                    if (!win_number) {
                        continue;
                    }
                    let win_num = win_number.win_number;
                    if (item.bet_num.length == 3) {
                        four_three_total += item.bet_amount;
                        win_amount += win_num.substring(1, 4) == item.bet_num ? item.bet_amount * 500 : 0;
                    } else {
                        four_total += lao_com[item.original_amount] * (item.bet_amount / item.original_amount);
                        if (win_num == item.num) {
                            win_amount += (price_items[`${item.original_amount}`].four_d) * parseInt(item.bet_amount / item.original_amount);
                        } else if (win_num.substring(1, 4) == item.bet_num.toString().substr(1, 4)) {
                            win_amount += price_items[`${item.original_amount}`].three_d * parseInt(item.bet_amount / item.original_amount);
                        } else if (win_num.substring(0, 3) == item.bet_num.toString().substr(0, 3)) {
                            win_amount += price_items[`${item.original_amount}`].front_three_d * parseInt(item.bet_amount / item.original_amount);
                        } else if (checkPermute(win_num, item.bet_num)) {
                            win_amount += price_items[`${item.original_amount}`].four_permute * parseInt(item.bet_amount / item.original_amount);
                        } else if (checkPermute(win_num.substring(1, 4), item.bet_num.toString().substr(1, 4))) {
                            win_amount += price_items[`${item.original_amount}`].three_permute * parseInt(item.bet_amount / item.original_amount);
                        } else if (win_num.substring(0, 2) == item.bet_num.toString().substr(0, 2)) {
                            win_amount += price_items[`${item.original_amount}`].front_two_d * parseInt(item.bet_amount / item.original_amount);
                        } else if (win_num.substring(2, 4) == item.bet_num.toString().substr(2, 4)) {
                            win_amount += price_items[`${item.original_amount}`].back_two_d * parseInt(item.bet_amount / item.original_amount);
                        }
                    }
                }
                let total = four_total + (agent == "HNH" ? four_three_total : four_three_total * 0.55);
                data.push({
                    name: agent,
                    type: "four",
                    total: parseInt(total - win_amount),
                    win_date: MOMENT(Date.parse(key)).unix()
                });
            }
        }
        let agents = _.uniq(_.pluck(data, 'name'));
        res.send({ status: 1, data: data, agents });
    } catch (error) {
        console.log("Error From getAgentReport => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let getShareCashLedger = async (req, res, next) => {
    try {
        let start_date = MOMENT.unix(req.body.start_date).startOf('days').unix();
        let end_date = MOMENT.unix(req.body.end_date).endOf('days').unix();
        let data = await DB.SCHAR_CASH_LEDGER_DB.find({ createdAt: { $gte: start_date, $lte: end_date } });
        let dates = _.uniq(_.pluck(data, 'win_date'));
        res.send({ status: 1, data, dates, names: UTILS.SHARE_HOLDERS });
    } catch (error) {
        console.log("Error From getShareCashLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let shareCashLedgerAgents = async (req, res, next) => {
    try {
        res.send({ status: 1, data: UTILS.SHARE_HOLDERS });
    } catch (error) {
        console.log("Error From shareCashLedgerAgents => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let addShareCashLedger = async (req, res, next) => {
    try {
        let win_date = req.body.win_date;
        let balance = req.body.balance;
        let items = req.body.items;
        let save_data = new DB.SCHAR_CASH_LEDGER_DB();
        save_data.win_date = win_date;
        save_data.balance = balance;
        save_data.items = items;
        await save_data.save();
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From addShareCashLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let getDailyLedgers = async (req, res, next) => {
    try {
        let start_date = MOMENT.unix(req.body.search_date).startOf('month').unix();
        let end_date = MOMENT.unix(req.body.search_date).endOf('month').unix();
        let auth_user = res.locals.auth_user;
        let daily_ledger = await DB.DAILY_LEDGER.findOne({ user_id: auth_user._id });
        if (!daily_ledger) {
            res.send({ status: 0, msg: 'No Data Found' });
            return;
        }
        let daily_admin_ledgers = await DB.DAILY_ADMIN_LEDGER.find({ $and: [{ user_id: auth_user._id }, { createdAt: { $gte: start_date, $lte: end_date } }] }).sort({ createdAt: -1 });
        res.send({ status: 1, daily_ledger, daily_admin_ledgers });

    } catch (error) {
        console.log("Error From getDailyLedgers => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let addDailyUse = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let amount = req.body.amount;
        let remark = req.body.remark;
        let createdAt = MOMENT(Date.now()).tz("Asia/Rangoon").unix();
        await DB.DAILY_LEDGER.updateOne({ _id: search_id }, { $push: { items: { name: remark, amount: amount, createdAt: createdAt } } }, {
            safe: true,
            multi: true
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From addDailyUse => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let addDailyPrePay = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let pre_pay = req.body.pre_pay;
        let cash_thai = req.body.cash_thai;
        let withdraw_thai = req.body.withdraw_thai;
        await DB.DAILY_LEDGER.updateOne({ _id: search_id }, { $set: { pre_pay: pre_pay, cash_thai: cash_thai, withdraw_thai: withdraw_thai } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From addDailyPrePay => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let createDailyLedger = async (req, res, next) => {
    try {
        let auth_user = res.locals.auth_user;
        let ledger = await DB.DAILY_LEDGER.findOne({ user_id: auth_user._id });
        if (!ledger) {
            res.send({ status: 0, msg: 'No Data Found' });
            return;
        }
        let is_two_d = req.body.is_two_d;
        let is_three_d = req.body.is_three_d;
        let is_lao = req.body.is_lao;
        let is_pre_pay = req.body.is_pre_pay;
        let is_six_d = req.body.is_six_d;
        let is_cash = req.body.is_cash;
        let is_daily_use = req.body.is_daily_use;
        let save_data = new DB.DAILY_ADMIN_LEDGER();
        save_data.user_id = ledger.user_id;
        save_data.name = ledger.name;
        save_data.two_d = is_two_d ? ledger.two_d : 0;
        save_data.three_d_baht = is_three_d ? ledger.three_d_baht : 0;
        save_data.three_d_kyat = is_three_d ? ledger.three_d_kyat : 0;
        save_data.apar = is_three_d ? ledger.apar : 0;
        save_data.lao = is_lao ? ledger.lao : 0;
        save_data.pre_pay = is_pre_pay ? ledger.pre_pay : 0;
        save_data.six_d = is_six_d ? ledger.six_d : 0;
        save_data.cash_thai = is_cash ? ledger.cash_thai : 0;
        save_data.withdraw_thai = is_cash ? ledger.withdraw_thai : 0;
        save_data.items = is_daily_use ? ledger.items : [];
        await save_data.save();

        await DB.DAILY_LEDGER.updateOne({ _id: ledger._id }, {
            $set: {
                two_d: is_two_d ? 0 : ledger.two_d,
                three_d_baht: is_three_d ? 0 : ledger.three_d_baht,
                three_d_kyat: is_three_d ? 0 : ledger.three_d_kyat,
                apar: is_three_d ? 0 : ledger.apar,
                lao: is_lao ? 0 : ledger.lao,
                pre_pay: is_pre_pay ? 0 : ledger.pre_pay,
                six_d: is_six_d ? 0 : ledger.six_d,
                cash_thai: is_cash ? 0 : ledger.cash_thai,
                withdraw_thai: is_cash ? 0 : ledger.withdraw_thai,
                items: is_daily_use ? [] : ledger.items
            }
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From createDailyLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}


let deleteDailyLedger = async (req, res, next) => {
    try {
        let auth_user = res.locals.auth_user;
        let search_id = req.body.search_id;
        let ledger = await DB.DAILY_ADMIN_LEDGER.findOne({ $and: [{ _id: search_id }, { user_id: auth_user._id }] });
        let auth_ledger = await DB.DAILY_LEDGER.findOne({ user_id: auth_user.id });
        if (!auth_ledger) {
            res.send({ status: 0, msg: 'No Data Found' });
            return;
        }
        if (!ledger) {
            res.send({ status: 0, msg: 'No Data Found' });
            return;
        }
        let items = auth_ledger.items.concat(ledger.items);
        await DB.DAILY_LEDGER.updateOne({ _id: auth_ledger._id }, {
            $inc: {
                two_d: ledger.two_d,
                three_d_baht: ledger.three_d_baht,
                three_d_kyat: ledger.three_d_kyat,
                lao: ledger.lao,
                pre_pay: ledger.pre_pay,
                six_d: ledger.six_d,
                cash_thai: ledger.cash_thai,
                withdraw_thai: ledger.withdraw_thai,
            }
        });
        await DB.DAILY_LEDGER.updateOne({ _id: auth_ledger._id }, { $set: { items: items } });
        await DB.DAILY_ADMIN_LEDGER.deleteOne({ _id: search_id });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From deleteDailyLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}


let dailyAdminLedger = async (req, res, nexxt) => {
    try {
        let search_date = req.body.search_date;
        let start_date = MOMENT.unix(search_date).startOf('days').unix();
        let end_date = MOMENT.unix(search_date).endOf('days').unix();
        let data = await DB.DAILY_ADMIN_LEDGER.find({ createdAt: { $gte: start_date, $lte: end_date } });
        res.send({ status: 1, data });
    } catch (error) {
        console.log("Error From dailyAdminLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let confirmDailyLedger = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let ledger = await DB.DAILY_ADMIN_LEDGER.findOne({ _id: search_id });
        if (!ledger) {
            res.send({ status: 0, msg: 'No Data Found' });
            return;
        }
        await DB.DAILY_ADMIN_LEDGER.updateOne({ _id: search_id }, { $set: { confirm: true } });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From confirmDailyLedger => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}

let deleteDailyUse = async (req, res, next) => {
    try {
        let search_id = req.body.search_id;
        let auth_user = res.locals.auth_user;
        await DB.DAILY_LEDGER.updateOne({ user_id: auth_user._id }, { $pull: { items: { _id: search_id } } }, {
            safe: true,
            multi: true
        });
        res.send({ status: 1, msg: 'အောင်မြင်ပါသည်။' });
    } catch (error) {
        console.log("Error From deleteDailyUse => ", error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
module.exports = {
    getSellTicketLedgers,
    getShopSellTicketLedgers,
    getTicketLedgers,
    getAgentSoldOutTicketLedgers,
    getAgentCashTicketLedgers,
    getCheckAgentCashTicketLedgers,
    getDeleteTicketLedger,
    soldOutSingleTicket,
    soldOutMultiTicket,
    updateRemark,
    deleteTicketLedger,
    unSellTicketLedger,
    cashTicketLedger,
    cashAirOnlyTicketLedger,
    getSimplePrice,
    updateSimplePrice,
    getSoldOutProfit,
    getCashProfit,
    soldOutPrePay,
    cashPrePay,
    cashBalance,
    closeTickets,
    sellActiveTickets,
    getOtherHtee,
    getOtherHteeByAgent,
    getOtherHteeLedger,
    createOtherHtee,
    deleteOtherHtee,
    deleteOtherHteeByAgent,
    remarkOtherHtee,
    companyOtherHtee,
    getKPI,
    newKPI,
    setNewKPI,
    deleteKpi,
    getAgentReport,
    getShareCashLedger,
    shareCashLedgerAgents,
    addShareCashLedger,
    getDailyLedgers,
    addDailyUse,
    addDailyPrePay,
    createDailyLedger,
    deleteDailyLedger,
    dailyAdminLedger,
    confirmDailyLedger,
    deleteDailyUse
}