const DB = require('../../models/DB');
const UTILS = require('../../helpers/Utils');
const VALIDATOR = require('../../helpers/validator');
const USER_GEN = require('../../CKLibby/UserGen');
const MOMENT = require("moment-timezone");
const _ = require('underscore');
const THAI_GEN = require('../libby/thai_gan');
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
        if (setting.open ==false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        if (MOMENT(setting.date).tz("Asia/Rangoon").startOf('day').isBefore(MOMENT(Date.now()).tz("Asia/Rangoon"))) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
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
        if (setting.open ==false) {
            res.send({ status: 0, msg: "ပိတ်သွားပါပြီ။" });
            return;
        }
        if (MOMENT(setting.date).tz("Asia/Rangoon").startOf('day').isBefore(MOMENT(Date.now()).tz("Asia/Rangoon"))) {
            res.send({ status: 0, msg: "ရက်စွဲမှားယွင်းနေပါသည်။" });
            return;
        }
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
        if (setting.open ==false) {
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
        if (setting.open ==false) {
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
        if (settings.open ==false) {
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
        console.log("Error From cashBalance => ", err);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let sellActiveTickets = async (req, res, next) => {
    try {
        let auth_user = res.locals.auth_user;
        let settings = await DB.SettingDB.findOne();
        if (settings.open ==false) {
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
        console.log("Error From cashBalance => ", err);
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
    sellActiveTickets
}