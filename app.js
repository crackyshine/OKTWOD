require('dotenv').config();
const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    path = require('path'),
    MONGO = require('mongoose'),
    bodyParser = require('body-parser'),
    os = require('os'),
    cluster = require('cluster'),
    rateLimit = require("express-rate-limit"),
    schedule = require('node-cron'),
    got = require('got'),
    MOMENT = require('moment-timezone'),
    _ = require('underscore'),
    cors = require('cors'),
    PageRoute = require('./routes/page'),
    appRoute = require('./routes/app'),
    THREE_D_ROUTE = require('./three_d_package/routes/three_d'),
    THREE_D_KYAT_ROUTE = require('./three_d_kyat_package/routes/three_d'),
    LAO_ROUTE = require('./lao_package/routes/lao'),
    THAI_ROUTE = require('./thai_package/routes/thai');
const DB = require('./models/DB');
const HTMLParser = require('node-html-parser');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { validateAuthToken } = require('./helpers/validator');
MONGO.connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
});

app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const createAccountLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 hour window
    max: 100, // start blocking after 5 requests
    message:
        "Too many request from this IP, please try again after an minute"
});

app.use('/', createAccountLimiter, PageRoute);
app.use('/app', [validateAuthToken], appRoute);
app.use('/three_d', [validateAuthToken], THREE_D_ROUTE);
app.use('/three_d_kyat', [validateAuthToken], THREE_D_KYAT_ROUTE);
app.use('/lao', [validateAuthToken], LAO_ROUTE);
app.use('/thai', [validateAuthToken], THAI_ROUTE);
app.use((err, req, res, next) => {
    err.status = err.status || 200;
    res.send({
        status: 0,
        msg: err.message,
    });
});


let getTesting = async () => {
    let settingData = await DB.SettingDB.findOne({ show_id: 0 }).select("date");
    let date = MOMENT(settingData.date).tz("Asia/Rangoon").subtract(1, 'days');
    const { body } = await got.post("https://www.glo.or.th/api/lottery/getLotteryAward", {
        json: {
            "date": date.format("DD"),
            "month": date.format("MM"),
            "year": date.format("yyyy")
        }
    });
    const bj = JSON.parse(body);
    const response = bj.response;
    if (response) {
        const data = response.data;
        let updateData = {
            first_prize: {
                num: data.first.number[0].value,
                amount: Math.floor(data.first.price)
            },
            first_close_prize: {
                num: _.pluck(data.near1.number, "value"),
                amount: Math.floor(data.near1.price)
            },
            first_front_three_prize: {
                num: _.pluck(data.last3f.number, "value"),
                amount: Math.floor(data.last3f.price)
            },
            first_back_three_prize: {
                num: _.pluck(data.last3b.number, "value"),
                amount: Math.floor(data.last3b.price)
            },
            first_back_two_prize: {
                num: data.last2.number[0].value,
                amount: Math.floor(data.last2.price)
            },
            second_prize: {
                num: _.pluck(data.second.number, "value"),
                amount: Math.floor(data.second.price)
            },
            third_prize: {
                num: _.pluck(data.third.number, "value"),
                amount: Math.floor(data.third.price)
            },
            fourth_prize: {
                num: _.pluck(data.fourth.number, "value"),
                amount: Math.floor(data.fourth.price)
            },
            fifth_prize: {
                num: _.pluck(data.fifth.number, "value"),
                amount: Math.floor(data.fifth.price)
            },
        }
        // console.log(updateData);
    } else {
        console.log("No Data");
    }
}

let insert_date = async () => {
    let settingData = await DB.SettingDB.findOne({ show_id: 0 }).select("date");
    let win_data = await DB.WinNumberDB.findOne({ date: settingData.date });
    let updateData = {
        "first_prize": {
            "num": "032761",
            "amount": 6000000
        },
        "first_close_prize": {
            "num": ["032760", "032762"],
            "amount": 100000
        },
        "first_front_three_prize": {
            "num": ["648", "471"],
            "amount": 4000
        },
        "first_back_three_prize": {
            "num": ["844", "245"],
            "amount": 4000
        },
        "first_back_two_prize": {
            "num": "57",
            "amount": 2000
        },
        "second_prize": {
            "num": ["795889", "186581", "088445", "947522", "463393"],
            "amount": 200000
        },
        "third_prize": {
            "num": ["970336", "402692", "064734", "255181", "157550", "141088", "287391", "646494", "776372", "190830"],
            "amount": 80000
        },
        "fourth_prize": {
            "num": ["920951", "097054", "680387", "253744", "516537", "013299", "485132", "172736", "010032", "971223", "941838", "503818", "888714", "071274", "392119", "146084", "725398", "699247", "712334", "406661", "313936", "170411", "093175", "896546", "019427", "968045", "273095", "238338", "499342", "793861", "863748", "071506", "682581", "629357", "994111", "161103", "641050", "172590", "610529", "430076", "042178", "878484", "426635", "234661", "565596", "355311", "626024", "367089", "543000", "890452"],
            "amount": 40000
        },
        "fifth_prize": {
            "num": ["388487", "347580", "133714", "885595", "214805", "351153", "451330", "484965", "868193", "390960", "227820", "105054", "223850", "900357", "055201", "373301", "952606", "087472", "735177", "988109", "200319", "621169", "322558", "424704", "247908", "400586", "165331", "882075", "588386", "189709", "872577", "369331", "070806", "082133", "181158", "100108", "896434", "336167", "529127", "040674", "392541", "465361", "173400", "770009", "151754", "539522", "052793", "511923", "208819", "916776", "615997", "154263", "860793", "121768", "759971", "681129", "778323", "896687", "562066", "809294", "127874", "765989", "381307", "744318", "211208", "285782", "656071", "477105", "679441", "527767", "945363", "031949", "550921", "243249", "527811", "355822", "044387", "343594", "460599", "823295", "498432", "184279", "762490", "352624", "109430", "379437", "228139", "074476", "469031", "051572", "293804", "165666", "127608", "136111", "245397", "876348", "869762", "649421", "143098", "502877"],
            "amount": 20000
        },
        "date": "2021-11-15T17:30:00.000Z",
        "youtube_url": "https://news.sanook.com/lotto/check/16102564/",
        "pdf_url": "",
    }
    if (win_data) {
        await DB.WinNumberDB.updateOne({ _id: win_data._id }, { $set: updateData });
        console.log("update date");
    } else {
        await new DB.WinNumberDB(updateData).save();
        console.log("insert data");
    }
}

let getLiveData = async () => {
    
    schedule.schedule('0 0 15 * * *', async () => {
        // schedule.schedule('* * * * * *', async () => {
        let search_date = MOMENT().tz("Asia/Rangoon").startOf("days");
        let users = await DB.UserDB.find();
        users = _.indexBy(users, "_id");
        await SAVE_DAILY_LEDGER(search_date, users);
        await SAVE_LAO_WIN_CASH_LEDGER(search_date, users);
    });


    // schedule.schedule('0-30 12 1,16 * *', async () => {
    // schedule.schedule('30-50 * 7 30,16 * *', async () => {
    
    
    
    
        schedule.schedule('0-20 * 7-8 1,16 * *', async () => {
        let settingData = await DB.SettingDB.findOne({ show_id: 0 }).select("date");
        let data = await DB.WinNumberDB.findOne({ date: settingData.date });
        if (!data) {
            console.log("NoData");
            const { body } = await got("https://news.sanook.com/lotto/");
            const root = HTMLParser.parse(body);
            let link = root.querySelector("h2").querySelector("a").getAttribute("href");
            if (link) {
                let save_win_data = new DB.WinNumberDB();
                save_win_data.date = settingData.date;
                save_win_data.api_link = link;
                await save_win_data.save();
            } else {
                console.log("No Link");
            }
        }
    });
    schedule.schedule('*/30 * 7-11 1,16 * *', async () => {
        let settingData = await DB.SettingDB.findOne({ show_id: 0 }).select("date");
        let win_data = await DB.WinNumberDB.findOne({ date: settingData.date });
        if (win_data) {
            if (win_data.pdf_url == "") {
                const virtualConsole = new jsdom.VirtualConsole();
                JSDOM.fromURL(win_data.api_link, {
                    runScripts: "dangerously",
                    virtualConsole
                }).then(async (dom) => {
                    let data = dom.window.lottoResult;
                    if (data) {
                        let updateData = {
                            first_prize: {
                                num: data.prize.prize_1,
                                amount: parseFloat(data.wording.prize_1.prize.replace(/,/g, ''))
                            },
                            first_close_prize: {
                                num: data.prize.prize1_close,
                                amount: parseFloat(data.wording.prize1_close.prize.replace(/,/g, ''))
                            },
                            first_front_three_prize: {
                                num: data.prize.prize_first3,
                                amount: parseFloat(data.wording.prize_first3.prize.replace(/,/g, ''))
                            },
                            first_back_three_prize: {
                                num: data.prize.prize_last3,
                                amount: parseFloat(data.wording.prize_last3.prize.replace(/,/g, ''))
                            },
                            first_back_two_prize: {
                                num: data.prize.prize_last2,
                                amount: parseFloat(data.wording.prize_last2.prize.replace(/,/g, ''))
                            },
                            second_prize: {
                                num: data.prize.prize_2,
                                amount: parseFloat(data.wording.prize_2.prize.replace(/,/g, ''))
                            },
                            third_prize: {
                                num: data.prize.prize_3,
                                amount: parseFloat(data.wording.prize_3.prize.replace(/,/g, ''))
                            },
                            fourth_prize: {
                                num: data.prize.prize_4,
                                amount: parseFloat(data.wording.prize_4.prize.replace(/,/g, ''))
                            },
                            fifth_prize: {
                                num: data.prize.prize_5,
                                amount: parseFloat(data.wording.prize_5.prize.replace(/,/g, ''))
                            },
                        }
                        await DB.WinNumberDB.updateOne({ _id: win_data._id }, { $set: updateData });
                        console.log("Api Update");
                    } else {
                        console.log("No Api Data");
                    }
                });
            }
        }
    });
    schedule.schedule('*/1 9-11 1,16 * *', async () => {
        let settingData = await DB.SettingDB.findOne({ show_id: 0 }).select("date");
        let win_data = await DB.WinNumberDB.findOne({ date: settingData.date });
        if (win_data) {
            if (win_data.pdf_url != "custom") {
                let date = MOMENT(settingData.date).tz("Asia/Rangoon");
                const { body } = await got.post("https://www.glo.or.th/api/lottery/getLotteryAward", {
                    json: {
                        "date": date.format("DD"),
                        "month": date.format("MM"),
                        "year": date.format("yyyy")
                    }
                });
                const bj = JSON.parse(body);
                const response = bj.response;
                if (response && response.date == date.format("yyyy-MM-DD")) {
                    const data = response.data;
                    let updateData = {
                        first_prize: {
                            num: data.first.number[0].value,
                            amount: Math.floor(data.first.price)
                        },
                        first_close_prize: {
                            num: _.pluck(data.near1.number, "value"),
                            amount: Math.floor(data.near1.price)
                        },
                        first_front_three_prize: {
                            num: _.pluck(data.last3f.number, "value"),
                            amount: Math.floor(data.last3f.price)
                        },
                        first_back_three_prize: {
                            num: _.pluck(data.last3b.number, "value"),
                            amount: Math.floor(data.last3b.price)
                        },
                        first_back_two_prize: {
                            num: data.last2.number[0].value,
                            amount: Math.floor(data.last2.price)
                        },
                        second_prize: {
                            num: _.pluck(data.second.number, "value"),
                            amount: Math.floor(data.second.price)
                        },
                        third_prize: {
                            num: _.pluck(data.third.number, "value"),
                            amount: Math.floor(data.third.price)
                        },
                        fourth_prize: {
                            num: _.pluck(data.fourth.number, "value"),
                            amount: Math.floor(data.fourth.price)
                        },
                        fifth_prize: {
                            num: _.pluck(data.fifth.number, "value"),
                            amount: Math.floor(data.fifth.price)
                        },
                        date: settingData.date,
                        youtube_url: response.youtube_url,
                        pdf_url: response.pdf_url,
                    }
                    if (win_data) {
                        await DB.WinNumberDB.updateOne({ _id: win_data._id }, { $set: updateData });
                        console.log("update date");
                    } else {
                        await DB.WinNumberDB.insert(updateData);
                        console.log("insert data");
                    }
                } else {
                    console.log("NO Data");
                }
            }
        }
    });


}
let genmap = () => {
    let result = [];
    for (let i = 0; i < 10; i++) {
        result[i + "a"] = {
            id: i,
            bet_amount: 0,
            is_finish: false,
            com: 0,
            win_lose: 0,
            win_lose_com: 0,
            agent_com: 0,
            agent_win_lose_com: 0,
            win_date: "",
        }
    }
    console.log(result);
}

let fixData = async () => {
    // let users = await DB.UserDB.find();
    // await getMoneyChange();
    // await deleteTickets();
    // await TransferData();
    // await DuplicateTicket();
    // await SoldOutDate();
    // await DeleteCheck();
    // await TransferMoney();

    // await getInputData();

    // let tickets =await DB.TransferDB.find();
    // let data =[];
    // for await(let ticket of tickets){
    //     let ids =ticket.air.ids.concat(ticket.simple.ids);
    //     for await(let id of ids){
    //         let tk =await DB.TicketLedgerDB.findOne({_id:id});
    //         if(tk) {
    //             if (data.includes(tk.ticket.number)) {
    //                 console.log(tk.ticket.number, id);
    //             } else {
    //                 console.log(tk.ticket.number);
    //                 data.push(tk.ticket.number);
    //             }
    //         }
    //     };
    // }
    console.log("Done");
}



let TransferMoney = async () => {
    let tickets = await DB.TwoDNumberDB.find({ $and: [{ voucher_id: { $gte: 15156 } }, { "delete.is_delete": false }] });
    for await (let ticket of tickets) {
        let items = ticket.items;
        for await (let item of items) {
            await DB.TwoDCutNumber.updateOne({ $and: [{ bet_num: item.num }, { type: "MORNING" }, { win_date: MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days') }] }, {
                $inc: {
                    amount: -Math.abs(item.bet_amount)
                }
            });
            await DB.TwoDCutNumber.updateOne({ $and: [{ bet_num: item.num }, { type: "EVENING" }, { win_date: MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days') }] }, {
                $inc: {
                    amount: Math.abs(item.bet_amount)
                }
            });
        }
    }
    let kyat_tickets = await DB.TwoDKyatNumberDB.find({ $and: [{ voucher_id: { $gte: 283 } }, { "delete.is_delete": false }] });
    for await (let ticket of kyat_tickets) {
        let items = ticket.items;
        for await (let item of items) {
            await DB.TwoDKyatCutNumber.updateOne({ $and: [{ bet_num: item.num }, { type: "MORNING" }, { win_date: MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days') }] }, {
                $inc: {
                    amount: -Math.abs(item.bet_amount)
                }
            });
            await DB.TwoDKyatCutNumber.updateOne({ $and: [{ bet_num: item.num }, { type: "EVENING" }, { win_date: MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days') }] }, {
                $inc: {
                    amount: Math.abs(item.bet_amount)
                }
            });
        }
    }
    console.log("Done Fixed Change Money");
}

let getInputData = async () => {
    let hnh = "617f720466ce3d1278b68f94";
    let dk = "617f720466ce3d1278b68fa6";
    let ksl = "617f720466ce3d1278b68fa4";
    let start_date = MOMENT("2021-11-18").tz("Asia/Rangoon").startOf("days");
    let tickets = await DB.TicketLedgerDB.find({
        $and: [
            { "agent.id": ksl },
            { "ticket.is_air": true },
            { "delete.is_delete": false },
            { "agent.date": start_date }
        ]
    });
    console.log(tickets.length);
}

let DeleteCheck = async () => {
    let tickets = await DB.TicketLedgerDB.find({ "delete.is_delete": true });
    // let tickets =await DB.TicketLedgerDB.find();
    let data = [];
    for await (let ticket of tickets) {
        let ts = await DB.TicketLedgerDB.find({
            $and: [
                { "delete.is_delete": false },
                { "ticket.scanner": ticket.ticket.scanner }
            ]
        });
        if (ts) {
            for (let t of ts) {
                let item = {
                    name: t.agent.name,
                    count: 0,
                }
                if (t.agent.name in data) {
                    item = data[t.agent.name];
                }
                item.count += t.ticket.count;
                data[t.agent.name] = item;
                // console.log(ticket.agent.name,ticket.ticket.scanner,ticket.sold_out.date,t.agent.name,t.ticket.scanner,t.sold_out.date);
            }
        }
    }
    console.log(data);
}

let SoldOutDate = async () => {
    let tickets = await DB.TicketLedgerDB.find();

    let data = [];
    tickets.find((ticket) => {
        let item = {
            id: ticket.sold_out.date,
            name: ticket.agent.name,
            count: 0,
        }

        if (ticket.sold_out.date in data) {
            item = data[ticket.sold_out.date]
        }
        item.count += ticket.ticket.count;
        data[ticket.sold_out.date] = item;
    });
    console.log(data);
}

let DuplicateTicket = async () => {
    let tickets = await DB.TicketLedgerDB.find({ "delete.is_delete": false });
    let data = [];
    let count = 0;
    for await (let ticket of tickets) {
        let item = {
            id: ticket._id,
            scanner: ticket.ticket.scanner,
            name: ticket.agent.name,
            count: 0,
            delete: ticket.delete,
            agent: ticket.agent,
        }

        if (ticket.ticket.scanner in data) {
            item = data[ticket.ticket.scanner];
            count++;
            await DB.TicketLedgerDB.deleteOne({ _id: item.id });
        }
        item.count += ticket.ticket.count;
        item.delete = ticket.delete;
        item.agent = ticket.agent,
            data[ticket.ticket.scanner] = item;
    }
    ;
    // console.log(_.sortBy(data,'count'));
    // console.log(data);
}

let TransferData = async () => {
    let tickets = await DB.TransferDB.find();
    let users = await DB.UserDB.find();
    users = _.indexBy(users, '_id');
    for await (let ticket of tickets) {
        let user = users[ticket.to.id.toString()];
        let ids = ticket.air.ids.concat(ticket.simple.ids);
        await DB.TicketLedgerDB.updateMany({ _id: { $in: Array.from(new Set(ids)) } }, {
            $set: {
                "delete.is_delete": false,
                "delete.name": "",
                "delete.date": null
            }
        });
        if (user) {
            let ts = await DB.TicketLedgerDB.find({ _id: { $in: Array.from(new Set(ids)) } });
            for await (let t of ts) {
                await DB.TicketLedgerDB.deleteOne({
                    $and: [
                        { "ticket.scanner": t.ticket.scanner },
                        { "agent.id": user._id }
                    ]
                }
                )
            }
        }
        if (user && user.is_permission) {
            await DB.TransferDB.deleteOne({ _id: ticket._id });
        }
    }
    ;
}
let deleteTickets = async () => {
    let tickets = await DB.TicketLedgerDB.find({ $and: [{ "delete.is_delete": true }, { "ticket.is_air": true }] });
    let data = [];
    tickets.find((ticket) => {
        let item = {
            id: ticket.agent.id,
            name: ticket.agent.name,
            count: 0,
        }

        if (ticket.agent.id in data) {
            item = data[ticket.agent.id]
        }
        item.count += ticket.ticket.count;
        data[ticket.agent.id] = item;
    });
    console.log(data);
}
let getMoneyChange = async () => {
    let money_changes = await DB.MoneyChangeDB.find();
    let data = [];
    money_changes.find((money_change) => {
        if (money_change.status.air_sold_out.count > 0 || money_change.status.simple_sold_out.count > 0) {
            let item = {
                id: money_change.agent.id,
                name: money_change.agent.name,
                count: 0,
            }

            if (money_change.agent.id in data) {
                item = data[money_change.agent.id]
            }
            item.count += money_change.status.air_sold_out.count;
            data[money_change.agent.id] = item;
        }
        if (money_change.status.air_transfer.count > 0 || money_change.status.simple_transfer.count > 0) {

        }
    });
    console.log(data);
}

let _BUILD_THREE_D_SETTING = async () => {
    let three_d_setting = new DB.THREE_D_SETTING_DB();
    three_d_setting.win_date = MOMENT(Date.now()).tz('Asia/Rangoon').startOf('days');
    await three_d_setting.save();
    console.log('THREE D SETTING DB CREATE SAVE');
}

let _BUILD_LAO_SETTING = async () => {
    let lao_setting = new DB.LAO_SETTING_DB();
    lao_setting.win_date = MOMENT(Date.now()).add(5, 'days').tz('Asia/Rangoon').startOf('days');
    let titleAry = [35, 60, 120, 150];
    for (let title of titleAry) {
        lao_setting.lao.push({
            type_name: `${title}`,
            amount: title,
            four_d: 10000,
            three_d: 10000,
            four_permute: 10000,
            three_permute: 10000,
            front_two_d: 10000,
            back_two_d: 10000,
            block_count: 5,
        });
    }
    await lao_setting.save();
    console.log("LAO SETTING CREATE SUCCESS!");
}

let _FIX_TWO_D_NUMBER = async () => {
    let today = MOMENT(Date.now()).tz("Asia/Rangoon").startOf("days");
    let tomorrow = MOMENT(Date.now()).tz("Asia/Rangoon").startOf("days").add(1, 'days');
    let data = await DB.TwoDNumberDB.find({
        "date.win": today,
        type: "MORNING",
        "status.finish": false,
        "delete.is_delete": false
    });
    let i = 0;
    while (i < 100) {
        let num = `${i}`.padStart(2, '0');
        await new DB.TwoDCutNumber({
            name: "Company",
            type: "MORNING",
            win_date: tomorrow,
            bet_num: num
        }).save();
        i++;
    }
    for await (let d of data) {
        for await (let item of d.items) {
            await DB.TwoDCutNumber.updateOne({ $and: [{ bet_num: item.num }, { win_date: today }] }, { $inc: { amount: -Math.abs(item.bet_amount) } });
            await DB.TwoDCutNumber.updateOne({ $and: [{ bet_num: item.num }, { win_date: tomorrow }] }, { $inc: { amount: Math.abs(item.bet_amount) } });
        }
        await DB.TwoDNumberDB.updateOne({ _id: d._id }, { $set: { "date.win": tomorrow } });
    }
    console.log("Done Fix TWO D NUMBER!");
}
let _FIX_LAO_DATA = async () => {
    let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
    let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
    let data = await DB.LAO_CUT_NUMBER_DB.find({ win_date: win_date });
    for await (let d of data) {
        if (d.bet_num.length == 4) {
            await DB.LAO_CUT_NUMBER_DB.deleteOne({ _id: d._id });
        }
    }
    let tickets = await DB.LAO_TICKET_DB.find({ $and: [{ "delete.is_delete": false }, { "date.win": win_date }] });
    for await (let ticket of tickets) {
        for await (let item of ticket.items) {
            if (item.num.length == 4) {
                let check_data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ bet_num: item.num }, { original_amount: item.bet_amount }, { win_date: win_date }] });
                if (check_data) {
                    await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: check_data._id }, {
                        $inc: {
                            bet_amount: item.bet_amount
                        }
                    })
                } else {
                    await new DB.LAO_CUT_NUMBER_DB({
                        bet_num: item.num,
                        bet_amount: item.bet_amount,
                        original_amount: item.bet_amount,
                        name: "Company",
                        win_date: ticket.date.win
                    }).save();
                }
            }
        }
    }
    console.log("Done.");
}
let _FIX_THAI_DATA = async () => {
    let setting = await DB.THREE_D_SETTING_DB.findOne({ show_id: 0 });
    let win_date = MOMENT(Date.parse(setting.win_date)).tz('Asia/Rangoon').startOf('days');
    await DB.THREE_D_CUT_NUMBER_DB.deleteMany({});
    let tickets = await DB.THREE_D_TICKET_DB.find({ 'date.win': win_date });
    let name = "Company";
    for await (let ticket of tickets) {
        for await (let item of ticket.items) {
            let data = await DB.THREE_D_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }] });
            if (data) {
                await DB.THREE_D_CUT_NUMBER_DB.updateOne({ _id: data._id }, { $inc: { amount: item.bet_amount } });
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
}

let getWinNumber = async () => {
    // let today = MOMENT(Date.now()).tz("Asia/Rangoon").startOf("days");
    let today = MOMENT("2022-06-16").tz("Asia/Rangoon").startOf("days");
    let tickets = await DB.TicketLedgerDB.find({ $and: [{ "ticket.date": today }, { "status.status": "WIN" }] });
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
    // data =_.groupBy(data,'agent');
    await writeFile(storage("win_numbers"), data);
    console.log(total);
    console.log("win", " Backup Done!");

}
let getBornNumber = async () => {
    let born_numbers = await DB.BornNumberDB.find();
    born_numbers = _.sortBy(born_numbers, 'born_num');
    let data = [];
    for (let bn of born_numbers) {
        data.push(
            {
                name: bn.name,
                num: bn.born_num
            }
        )
    }
    await writeFile(storage("born_numbers"), data);
    console.log("born_numbers", " Backup Done!");
}

const fs = require('fs');
const internal = require('stream');
const storage = file => "./migrations/backups/" + file + ".json";
const writeFile = async (file, data) => await fs.writeFileSync(file, JSON.stringify(data), "utf8");
const readFile = async (file) => JSON.parse(await fs.readFileSync(file, 'utf8'));


// http.listen(process.env.PORT, async () => {
//     let fix_day = MOMENT("2023-02-13").tz("Asia/Rangoon").startOf("days");
//     let data =await DB.LAO_TICKET_DB.find({"date.win":fix_day});
//     let count =0;
//     let change_data =[];
//     for(let d of data){
//         let items =d.items;
//         for(let item of items){
//             if(item.num.length ==4 && item.bet_amount ==35){
//                 change_data.push(item._id);
//             }
//         }
//     }
//     let dd =await DB.LAO_TICKET_DB.find({items:{$elemMatch:{_id:{$in:Array.from(new Set(change_data))}}}});
//     for await(let d of dd){
//         let items =d.items;
//         for(let item of items){
//             if(item.num.length ==4 && item.bet_amount ==35){
//                 item.bet_amount =40;
//             }
//         }
//         await DB.LAO_TICKET_DB.updateOne({_id:d._id},{$set:{items:items}});
//     }
//     let cut_data = await DB.LAO_CUT_NUMBER_DB.find({ $and: [{bet_num:{$exists:true},$expr: { $gte: [{ $strLenCP: "$bet_num" }, 4] } }, { original_amount: 35 }, { win_date: fix_day }, { name: "Company" }] });
//     for(let item of cut_data){
//         let data = await DB.LAO_CUT_NUMBER_DB.findOne({$and: [{name: item.name}, {win_date: fix_day}, {bet_num: item.num}, {original_amount: 40}]});
//         if(data){
//             await DB.LAO_CUT_NUMBER_DB.updateOne({_id: data._id}, {$inc: {bet_amount: 40}});
//         }else{
//             await DB.LAO_CUT_NUMBER_DB({
//                 name: item.name,
//                 win_date: fix_day,
//                 bet_num: item.num,
//                 original_amount: 40,
//                 bet_amount: item.bet_amount,
//             }).save();
//         }
//     }
//     await DB.LAO_CUT_NUMBER_DB.deleteMany({ $and: [{bet_num:{$exists:true},$expr: { $gte: [{ $strLenCP: "$bet_num" }, 4] } }, { original_amount: 35 }, { win_date: fix_day }, { name: "Company" }] });
//     console.log("done");
// });

// check_lao = async () => {
//     let fix_day = MOMENT("2023-06-30").tz("Asia/Rangoon").startOf("days");
//     let data = await DB.LAO_CUT_NUMBER_DB.find({$and:[{ "win_date": fix_day },{$or:[{"original_amount":60},{"original_amount":120},{"original_amount":150}]},{$or:[{"name":"HNH"}]}]});
//     let d =_.groupBy(data,"bet_num");
//     let count =0;
//     for(const[key,value] of Object.entries(d)){
//         if(value.length >1){
//             count++;
//             console.log(value);
//         }
//     }
//     console.log(count);
// }

let change_number = async () => {
    let fix_day = MOMENT("2023-10-16").tz("Asia/Rangoon").startOf("days");
    let data = await DB.WinNumberDB.findOne({ date: fix_day });
    // data.fourth_prize.num =[ "011638", "703113", "963212", "715480", "512296", "693515", "987332", "414423", "504541", "482292", "755271", "082186", "868378", "587428", "512341", "894570", "411687", "032672", "007973", "128080", "450795", "816405", "386159", "822360", "868449", "334885", "791713", "058360", "308637", "623706", "574416", "233411", "497647", "689714", "274265", "517668", "655436", "793219", "598509", "926020", "354757", "430139", "723028", "257308", "757306", "668740", "170713", "200754", "494036", "565159" ];
    data.fifth_prize.num = ["441242", "656902", "905013", "885420", "812848", "872959", "262754", "470261", "185813", "170539", "682789", "478551", "563076", "407555", "264437", "421170", "292266", "602851", "034126", "110160", "159965", "026759", "714879", "020518", "740246", "351203", "153392", "711500", "472910", "198343", "430637", "659934", "192730", "389370", "455190", "545508", "063006", "531940", "548493", "458002", "001438", "956981", "507098", "969200", "486459", "142430", "329310", "740568", "025426", "732630", "162371", "100975", "465370", "388570", "988630", "739475", "314202", "579121", "758304", "341238", "243369", "338537", "920238", "892681", "204586", "285107", "784182", "726264", "128054", "259608", "434164", "697498", "714395", "580049", "972813", "332266", "106822", "075315", "547155", "492183", "978816", "986059", "196440", "600676", "672030", "473915", "477804", "040939", "964361", "200184", "569267", "624669", "113947", "777327", "231971", "244062", "552669", "895323", "316996", "363893"];
    await DB.WinNumberDB.updateOne({ _id: data._id }, { $set: data });
    console.log("change numbers");
}
let UPDATE_LAO_SETTING = async () => {
    let ls = await DB.LAO_SETTING_DB.findOne();
    for (let item of ls.lao) {
        item["amount_k"] = item.amount;
        item["four_d_k"] = item.four_d;
        item["three_d_k"] = item.three_d;
        item["four_permute_k"] = item.four_permute;
        item["three_permute_k"] = item.three_permute;
        item["front_two_d_k"] = item.front_two_d;
        item["back_two_d_k"] = item.back_two_d;
    }
    await DB.LAO_SETTING_DB.updateOne({ show_id: 0 }, { $set: { lao: ls.lao, "three_d.block_amount_k": 50000, "three_d_cut_amount_k": 100000 } });
    console.log("done");
}
// let change_ticket_agent =async()=>{
//     let fix_day = MOMENT("2023-07-16").tz("Asia/Rangoon").startOf("days");
//     // let data = await DB.TicketLedgerDB.findOne({ $and: [{ "agent.id": "617f720466ce3d1278b68f94" }, { "ticket.date": fix_day }, { "ticket.number": "610620" }] });
//     // console.log(MOMENT(data.crated).format('YYYY-MM-DD hh:mm:ss'));
//     let data =await DB.TicketLedgerDB.find({$and:[{"agent.id":"617f720466ce3d1278b68f94"},{"ticket.date":fix_day}]});
//     // for(let d of data){
//     //     console.log(MOMENT(d.crated).format('YYYY-MM-DD hh:mm:ss'));
//     // }
//     data =_.groupBy(data,(e)=>MOMENT(e.crated).tz('Asia/Rangoon').format('YYYY-MM-DD hh:mm:ss'));
//     for(const[key,value] of Object.entries(data)){
//         // console.log(key,'=>',value.length);
//         if(key =="2023-07-03 08:26:39" || key =="2023-07-03 08:29:28" || key =="2023-07-03 08:31:51" || key =="2023-07-03 08:33:38" || key =="2023-07-03 08:36:44" || key =="2023-07-03 08:37:20"){
//             let dd =_.pluck(value,'_id');
//             let s=await DB.TicketLedgerDB.updateMany({_id:{$in:Array.from(new Set(dd))}},{$set:{"agent.id":"63cdfcf236e03526f343a630"}});
//             console.log(s,"Done");
//             // let d =_.pluck(dd,'number');
//             // console.log(key,'=>',d,'=>',value[0].crated);
//             // console.log(key,'=>',d,'=>',value.length);
//             // let fd =await DB.TicketLedgerDB.find({$and:[{"agent.id":"617f720466ce3d1278b68f94"},{"crated":value[0].crated}]});
//             // console.log(fd.length);

//         }
//     }
// }


let CHANGE_LAO_DATE = async () => {
    let old_date = MOMENT("2025-03-10").tz("Asia/Rangoon").startOf("days");
    let new_date = MOMENT("2025-03-12").tz("Asia/Rangoon").startOf("days");
    // let old_data =await DB.LAO_CUT_NUMBER_DB.find({win_date:old_date});
    // for(let item of old_data){
    //     if(item.bet_num.length ==3){
    //         let exist_data =await DB.LAO_CUT_NUMBER_DB.findOne({$and:[{win_date:new_date},{bet_num:item.bet_num}]});
    //         if(exist_data){
    //             await DB.LAO_CUT_NUMBER_DB.updateOne({_id:exist_data._id},{$set:{bet_amount:exist_data.bet_amount+item.bet_amount}});
    //             await DB.LAO_CUT_NUMBER_DB.deleteOne({_id:item._id});
    //             console.log("Update Three D");
    //         }else{
    //             await DB.LAO_CUT_NUMBER_DB.updateOne({_id:item._id},{$set:{win_date:new_date}});
    //             console.log("Save Three D");
    //         }
    //     }else{
    //         let exist_data =await DB.LAO_CUT_NUMBER_DB.findOne({$and:[{win_date:new_date},{bet_num:item.bet_num},{original_amount:item.original_amount}]});
    //         if(exist_data){
    //             await DB.LAO_CUT_NUMBER_DB.updateOne({_id:exist_data._id},{$set:{bet_amount:exist_data.bet_amount+item.bet_amount}});
    //             await DB.LAO_CUT_NUMBER_DB.deleteOne({_id:item._id});
    //             console.log("Update Four D");
    //         }else{
    //             await DB.LAO_CUT_NUMBER_DB.updateOne({_id:item._id},{$set:{win_date:new_date}});
    //             console.log("Save Four D");
    //         }
    //     }
    // }
    await DB.LAO_KYAT_TICKET_DB.updateMany({ "date.win": old_date }, { $set: { "date.win": new_date } });
    console.log("Change Date Success");
};

// let CHANGE_LAO_DATE_WIN_DATE = async () => {
//     let old_date = MOMENT("2024-05-02").tz("Asia/Rangoon").startOf("days");
//     let new_date = MOMENT("2024-05-03").tz("Asia/Rangoon").startOf("days");
//     // let old_data = await DB.LAO_CUT_NUMBER_DB.find({ win_date: old_date });
//     let count = 0;
//     // for (let item of old_data) {
//     //     item.win_amount =0;
//     // };
//     let d = await DB.LAO_TICKET_DB.find({ "date.win": old_date });
//     for await (let item of d) {
//         count += item.amount.win;
//         if (item.delete.is_delete == false) {
//             await SAVE_CUT_LAO(item.items, 'Company', new_date);
//             item.amount.win = 0;
//             item.status = {
//                 cash: false,
//                 finish: false
//             };
//             item.date.win = new_date;
//             for (let i of item.items) {
//                 i.win = {
//                     amount: 0,
//                     str: ""
//                 }
//             }
//             await DB.LAO_TICKET_DB.updateOne({ _id: item._id }, { $set: item });
//             console.log("Update ", item.voucher_id);
//         }
//     };
//     console.log("Bet Amount => ", count)
//     console.log("Change Date Success");
// };
// let SAVE_CUT_LAO = async (items, name, win_date) => {
//     for await (let item of items) {
//         let data = null;
//         if (item.num.length == 3) {
//             data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }] });
//         } else {
//             data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }, { original_amount: item.bet_amount }] });
//         }
//         if (data) {
//             await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: data._id }, { $inc: { bet_amount: item.bet_amount } });
//         } else {
//             await DB.LAO_CUT_NUMBER_DB({
//                 name: name,
//                 win_date: win_date,
//                 bet_num: item.num,
//                 original_amount: item.bet_amount,
//                 bet_amount: item.bet_amount,
//             }).save();
//         }
//     }
// }

let CHANGE_TWO_D_DATE = async () => {
    // let old_date = MOMENT("2025-03-28").tz("Asia/Rangoon").startOf("days");
    let new_date = MOMENT("2025-05-16").tz("Asia/Rangoon").startOf("days");
    let data = await DB.TwoDNumberDB.find({ $and: [{ "date.win": new_date }, { type: "EVENING" }, { "delete.is_delete": false }] });
    let dd = await DB.TwoDCutNumber.deleteMany({ $and: [{ "win_date": new_date }, { type: "EVENING" }] });
    console.log(dd);

    // console.log(data.length);
    // let count = 0;
    for await (let d of data) {
        if (d.delete.is_delete == false) {
            let items = d.items;
            for (let item of items) {
                let result = await DB.TwoDCutNumber.findOne({ $and: [{ "win_date": new_date }, { type: "EVENING" }, { name: "Company" }, { bet_num: item.num }] });
                if (!result) {
                    let new_data = DB.TwoDCutNumber();
                    new_data.name = "Company";
                    new_data.type = "EVENING";
                    new_data.bet_num = item.num;
                    new_data.win_date = new_date;
                    new_data.amount = item.bet_amount;
                    await new_data.save();
                } else {
                    await DB.TwoDCutNumber.updateOne({ _id: result._id }, { $inc: { amount: item.bet_amount } });
                }
                // console.log("Done ", item.num,item.bet_amount)
            }
        }
        console.log("Done count");
    }


    // let old_cut_date = await DB.TwoDCutNumber.find({ win_date: old_date });
    // for(let item of old_cut_date){
    // let c =await DB.TwoDCutNumber.updateOne({win_date:new_date,type:item.type,bet_num:item.bet_num},{$inc:{amount:item.amount}});
    // }
    // let delete_data = await DB.TwoDCutNumber.deleteMany({ win_date: old_date });
    // console.log(delete_data);
    // let old_data =await DB.TwoDNumberDB.updateMany({$and:[{"date.win":old_date},{type:"EVENING"}]},{$set:{"date.win":new_date,type:"MORNING"}});
    // let old_data =await DB.TwoDCutNumber.updateMany({$and:[{"win_date":old_date},{type:"EVENING"},{"name":"Company"}]},{$set:{"win_date":new_date,type:"MORNING",bet_amount:0}});
    // console.log(old_data);
    console.log("OKK");
}

// let CHANGE_LAO_KYAT_DATE_WIN_DATE = async () => {
//     let old_date = MOMENT("2024-05-02").tz("Asia/Rangoon").startOf("days");
//     let new_date = MOMENT("2024-05-03").tz("Asia/Rangoon").startOf("days");
//     // let old_data = await DB.LAO_CUT_NUMBER_DB.find({ win_date: old_date });
//     let count = 0;
//     let c = 0;
//     // for (let item of old_data) {
//     //     item.win_amount =0;
//     // };
//     let setting = await DB.LAO_SETTING_DB.findOne({ show_id: 0 });
//     let price_items = setting.lao;
//     price_items = _.indexBy(price_items, 'amount_k');
//     let d = await DB.LAO_KYAT_TICKET_DB.find({ "date.win": old_date });
//     for await (let item of d) {
//         count += item.amount.win;
//         if (item.delete.is_delete == false) {
//             item.items = GEN_KYAT_TO_BAHT(item.items, price_items);
//             await SAVE_CUT_KYAT_LAO(item.items, 'Company', new_date);
//             item.amount.win = 0;
//             item.status = {
//                 cash: false,
//                 finish: false
//             };
//             item.date.win = new_date;
//             for (let i of item.items) {
//                 i.win = {
//                     amount: 0,
//                     str: ""
//                 }
//             }
//             await DB.LAO_KYAT_TICKET_DB.updateOne({ _id: item._id }, { $set: item });
//             console.log("Update ", item.voucher_id);
//             c++;
//         }
//     };
//     console.log("Bet Amount => ", count, " Bet Count => ", c);
//     console.log("Change Date Success");
// };
// let SAVE_CUT_KYAT_LAO = async (items, name, win_date) => {
//     for await (let item of items) {
//         let data = await DB.LAO_CUT_NUMBER_DB.findOne({ $and: [{ name: name }, { win_date: win_date }, { bet_num: item.num }, { original_amount: item.original_amount }] });
//         if (data) {
//             await DB.LAO_CUT_NUMBER_DB.updateOne({ _id: data._id }, { $inc: { bet_amount: item.original_amount } });
//         } else {
//             await DB.LAO_CUT_NUMBER_DB({
//                 name: name,
//                 win_date: win_date,
//                 bet_num: item.num,
//                 original_amount: item.original_amount,
//                 bet_amount: item.original_amount,
//             }).save();
//         }
//     }
// }
// let GEN_KYAT_TO_BAHT = (items, price_items) => {
//     let data = [];
//     for (let item of items) {
//         item.original_amount = price_items[`${item.bet_amount}`].amount;
//         data.push(item);
//     }
//     return data;
// }

let TRANSFER_TICKET = async () => {
    await DB.UserDB.updateMany({}, {
        $set: {
            com: {
                air: 270,
                simple: 0,
            },
            pair: [
                { count: 1, amount: 110 },
                { count: 2, amount: 220 },
                { count: 3, amount: 350 },
                { count: 5, amount: 650 },
            ]
        }
    });
    await DB.SettingDB.updateMany({}, {
        $set: {
            sold_out: {
                air: 270,
                simple: 0,
            },
            pair: [
                { count: 1, amount: 110 },
                { count: 2, amount: 220 },
                { count: 3, amount: 350 },
                { count: 5, amount: 650 },
            ]
        }
    });
    let old_date = MOMENT("2025-02-01").tz("Asia/Rangoon").startOf("days");
    let setting = await DB.SettingDB.findOne();
    let setting_pair = _.indexBy(setting.pair, "count");
    let users = await DB.UserDB.find();
    users = _.indexBy(users, '_id');
    let ticket_ledgers = await DB.TicketLedgerDB.find({ $and: [{ "ticket.date": old_date }, { "delete.is_delete": false }] });
    let save_data = [];
    let save_extra_data = [];
    let count = 0;
    for await (let ticket_ledger of ticket_ledgers) {
        let ticket = ticket_ledger.ticket;
        let user = users[ticket_ledger.agent.id];
        let user_pair = _.indexBy(user.pair, "count");
        let income_date = MOMENT(Date.parse(ticket_ledger.agent.date)).tz('Asia/Rangoon').unix();
        let sold_out_date = MOMENT(Date.parse(ticket_ledger.sold_out.date)).tz('Asia/Rangoon').unix();
        let amount = setting.sold_out.air;
        let sold_out_amount = user.com.air;
        if (ticket.is_air == false) {
            amount = setting_pair[ticket.count].amount;
            sold_out_amount = user_pair[ticket.count].amount;
        }
        let save_item = new DB.THAI_LEDGER();
        let save_extra = new DB.THAI_EXTRA();
        save_extra.ticket_id = save_item._id;
        save_item.ticket = {
            number: ticket.number,
            scanner: ticket.scanner,
            air_simple: ticket.is_air,
            count: ticket.count,
        };
        save_item.income = {
            user_id: user._id,
            name: user.full_name,
        };
        save_item.amount.ticket = amount;
        save_item.amount.income = setting.income * ticket.count;
        save_item.amount.sold_out = sold_out_amount;
        save_item.amount.com = amount - sold_out_amount;
        save_item.win_date = old_date.unix();
        save_item.update = income_date;
        save_extra.date.win = old_date.unix();
        save_extra.date.income = income_date;
        save_extra.device.income = user.user_list[0].device_id;
        if (ticket_ledger.sold_out.is_sold_out == true) {
            save_item.sold_out = {
                user_id: user._id,
                name: user.full_name,
            };
            save_item.status = "SOLD_OUT";
            save_item.sold_out_date = sold_out_date;
            save_extra.device.sold_out = user.user_list[0].device_id;
            save_extra.date.sold_out = sold_out_date;
            save_item.update = sold_out_date;
        }
        save_item.contact = ticket_ledger.sold_out.name;
        save_item.remark = ticket_ledger.remark;
        save_data.push(save_item);
        save_extra_data.push(save_extra);
        if (save_data.length == 500) {
            await DB.THAI_LEDGER.insertMany(save_data);
            await DB.THAI_EXTRA.insertMany(save_extra_data);
            count++;
            console.log("save_data => ", count * save_data.length);
            save_data = [];
            save_extra_data = [];
        }
    }
    if (save_data.length > 0) {
        await DB.THAI_LEDGER.insertMany(save_data);
        await DB.THAI_EXTRA.insertMany(save_extra_data);
        console.log("save_data => ", (count * 500) + save_data.length);
    }
    console.log("all Ticket => ", ticket_ledgers.length);
    let thai_ticket_ledgers = await DB.THAI_LEDGER.find({ "win_date": old_date.unix() });
    let save_users = [];
    let ticket_count = [];
    for (let item of thai_ticket_ledgers) {
        save_users.push(item.income.user_id.toString());
        if (item.ticket.air_simple == false) {
            ticket_count.push(item.ticket.count);
        }
    }
    save_users = _.uniq(save_users);
    ticket_count = _.uniq(ticket_count);
    for await (let save_user of save_users) {
        let item = new DB.THAI_SHOP_LEDGER();
        let user = users[save_user];
        item.user_id = user._id;
        item.name = user.full_name;
        item.win_date = old_date.unix();

        let cash_item = new DB.THAI_CASH_LEDGER();
        cash_item.user_id = user._id;
        cash_item.name = user.full_name;
        cash_item.win_date = old_date.unix();
        await item.save();
        await cash_item.save();
    }
}

let CHANGE_COM = async () => {
    let users = await DB.UserDB.find();
    users = _.indexBy(users, '_id');
    let setting = await DB.SettingDB.findOne();
    let setting_pair = _.indexBy(setting.pair, "count");
    let tickets = await DB.THAI_LEDGER.find({ status: { $ne: "DELETE" } });
    for await (let ticket of tickets) {
        let user = users[ticket.income.user_id];
        let user_pair = _.indexBy(user.pair, "count");
        let amount = setting.sold_out.air;
        let sold_out_amount = user.com.air;
        if (ticket.ticket.air_simple == false) {
            amount = setting_pair[ticket.ticket.count].amount;
            sold_out_amount = user_pair[ticket.ticket.count].amount;
        }
        await DB.THAI_LEDGER.updateOne({ _id: ticket._id }, {
            $set: {
                "amount.ticket": amount,
                "amount.sold_out": sold_out_amount,
                "amount.com": amount - sold_out_amount,
            }
        });
    }
    console.log("Done");
}

let CHANGE_EXTRA = async () => {
    // let users = await DB.UserDB.find();
    // users = _.indexBy(users, '_id');
    // let tickets = await DB.THAI_LEDGER.find();
    // for await (let ticket of tickets) {
    //     let user = users[ticket.income.user_id];
    //     let device_id = user.user_list[0].device_id;
    //     let save_data = new DB.THAI_EXTRA();
    //     save_data.ticket_id = ticket._id;
    //     save_data.device.income = device_id;
    //     save_data.device.delete = ticket.status == "DELETE" ? device_id : "";
    //     save_data.date.win = ticket.win_date;
    //     save_data.date.income = 0;
    //     await save_data.save();

    // }
    // console.log("Done");
}

let DELETE_THAI_LEDGER_RESTORE = async () => {
    let exist_ledgers = await DB.THAI_EXTRA.find({ "device.delete": { $ne: "" } });
    let ids = _.pluck(exist_ledgers, 'ticket_id');
    let ledgers = await DB.THAI_LEDGER.find({ $and: [{ _id: { $in: Array.from(new Set(ids)) } }, { status: "WIN" }] });
    let count = 1;
    for (let ledger of ledgers) {
        await DB.THAI_CASH_LEDGER.updateOne({ user_id: ledger.income.user_id }, {
            $inc: {
                amount: -ledger.win_amount.total
            }
        });
        await DB.THAI_LEDGER.updateOne({ _id: ledger._id }, {
            $set: {
                status: "DELETE",
                win_amount: {
                    air: 0,
                    simple: 0,
                    simple_show: 0,
                    total: 0
                },
                prizes: []
            }
        });
        console.log("Update One", count++);
    }
    console.log("OK")
}

let deleteNumberByDate = async () => {
    let date_str = "2025-09-27";
    let thai_str = "2025-09-16";
    let delete_date = MOMENT(date_str).tz("Asia/Rangoon").startOf("days");
    let thai_date = MOMENT(thai_str).tz("Asia/Rangoon").startOf("days").unix();
    await DB.LAO_CUT_NUMBER_DB.deleteMany({ win_date: { $lte: delete_date } });
    await DB.LAO_TICKET_DB.deleteMany({ $and: [{ "date.win": { $lte: delete_date } }, { $or: [{ "status.cash": true }, { "amount.win": 0 }, { "delete.is_delete": true }] }] });
    await DB.LAO_KYAT_TICKET_DB.deleteMany({ $and: [{ "date.win": { $lte: delete_date } }, { $or: [{ "status.cash": true }, { "amount.win": 0 }, { "delete.is_delete": true }] }] });
    await DB.THREE_D_CUT_NUMBER_DB.deleteMany({ win_date: { $lte: delete_date } });
    await DB.THREE_D_CUT_KYAT_NUMBER_DB.deleteMany({ win_date: { $lte: delete_date } });
    await DB.THREE_D_TICKET_DB.deleteMany({ $and: [{ "date.win": { $lte: delete_date } }, { $or: [{ "status.cash": true }, { "amount.win": 0 }, { "delete.is_delete": true }] }] });
    await DB.THREE_D_KYAT_TICKET_DB.deleteMany({ $and: [{ "date.win": { $lte: delete_date } }, { $or: [{ "status.cash": true }, { "amount.win": 0 }, { "delete.is_delete": true }] }] });
    await DB.TwoDCutNumber.deleteMany({ win_date: { $lte: delete_date } });
    await DB.TwoDKyatCutNumber.deleteMany({ win_date: { $lte: delete_date } });
    await DB.TwoDNumberDB.deleteMany({ $and: [{ "date.win": { $lte: delete_date } }, { $or: [{ "status.cash": true }, { "amount.win": 0 }, { "delete.is_delete": true }] }] });
    await DB.TwoDKyatNumberDB.deleteMany({ $and: [{ "date.win": { $lte: delete_date } }, { $or: [{ "status.cash": true }, { "amount.win": 0 }, { "delete.is_delete": true }] }] });
    let data = await DB.THAI_LEDGER.find({ $and: [{ "win_date": { $lte: thai_date } }, { $or: [{ "status": "COMPANY" }, { "win_amount.total": 0 }] }] });
    let _ids = _.pluck(data, '_id');
    await DB.THAI_EXTRA.deleteMany({ ticket_id: { $in: Array.from(new Set(_ids)) } });
    await DB.THAI_LEDGER.deleteMany({ _id: { $in: Array.from(new Set(_ids)) } });
    console.log("Delete Done");
}

let CREATE_DAILY_USER = async () => {
    let users = await DB.UserDB.find();
    for (let user of users) {
        let save_data = new DB.DAILY_LEDGER();
        save_data.user_id = user._id;
        save_data.name = user.name;
        await save_data.save();
    }
    console.log("Save Daily User Successful!");
}

let SAVE_LAO_WIN_CASH_LEDGER = async (search_date, users) => {
    let setting = await DB.LAO_SETTING_DB.findOne();
    let win_date = setting.win_date;
    if (MOMENT(win_date).isSame(search_date, 'day')) {
        await DB.LAO_CASH_LEDGER.deleteMany({ win_date: win_date });
        let ledgers = await DB.LAO_TICKET_DB.find({ $and: [{ "date.win": win_date }, { "delete.is_delete": false }, { "amount.win": { $gt: 0 } }] });
        ledgers = _.groupBy(ledgers, (e) => e.agent.id);
        for (const [agentId, items] of Object.entries(ledgers)) {
            let user = users[agentId];
            let total = 0;
            for (let item of items) {
                total += item.amount.win;
            }
            let save_data = new DB.LAO_CASH_LEDGER();
            save_data.user_id = user._id;
            save_data.name = user.name;
            save_data.win_amount = total;
            save_data.win_date = win_date;
            await save_data.save();
        }
        console.log("Save Lao Win Cash Ledger Done");
    }
}

let SAVE_DAILY_LEDGER = async (search_date, users) => {
    await saveTwoD(search_date, users);
    await saveThreeDKyat(search_date, users);
    await saveThreeD(search_date, users);
    await saveFourD(search_date, users);
    await saveSixD(search_date, users);
    console.log("Update Daily Ledger Done");
}

let saveSixD = async (search_date) => {
    search_date = search_date.unix();
    let six_d_ledgers = await DB.THAI_LEDGER.find({ $and: [{ win_date: search_date }, { sold_out: { $ne: null } }, { status: { $ne: "DELETE" } }] });
    six_d_ledgers = _.groupBy(six_d_ledgers, (e) => e.sold_out.user_id);
    for (const [agentId, ledgers] of Object.entries(six_d_ledgers)) {
        let win = 0;
        let total = 0;
        for (const ledger of ledgers) {
            total += ledger.amount.sold_out;
            win += ledger.win_amount.total;
        }
        let amount = total - win;
        await DB.DAILY_LEDGER.updateOne({ user_id: agentId }, { $inc: { six_d: amount } });
    }
}



let saveFourD = async (search_date, users) => {
    let two_d_ledgers = await DB.LAO_TICKET_DB.find({ $and: [{ "date.win": search_date }, { "delete.is_delete": false }] });
    two_d_ledgers = _.groupBy(two_d_ledgers, (e) => e.agent.id);
    for (const [agentId, ledgers] of Object.entries(two_d_ledgers)) {
        let user = users[agentId];
        let name = user.name.toLowerCase();
        let apo = user.lao_apo / 10;
        let win = 0;
        let total = 0;
        let three_d_total = 0;
        for (const ledger of ledgers) {
            if (ledger.amount.win > 0) {
                win += ledger.amount.win;
            }
            for (let item of ledger.items) {
                let bet = item.bet_amount;
                if (item.num.length == 4) {
                    if (name == "uh" || name == "uhpl" || name == "4uh" || name == "uhwk" || name == "uh5") {
                        if (bet == 150) {
                            total += 130;
                        } else if (bet == 100) {
                            total += 85;
                        } else if (bet == 60) {
                            total += 50;
                        } else if (bet == 40) {
                            total += 35;
                        }
                    } else {
                        total += bet;
                    }
                } else {
                    three_d_total += bet;
                    // let real_cash = bet / apo;
                    // let com = real_cash - (bet * 0.6);
                    // total += real_cash - com;
                }
            }
        }
        if (name == "uh" || name == "uhpl" || name == "4uh" || name == "uhwk" || name == "uh5") {
            total += parseInt(three_d_total * 0.6);
        } else {
            total += parseInt(three_d_total / apo);
        }
        let amount = parseInt(total) - win;
        await DB.DAILY_LEDGER.updateOne({ user_id: agentId }, { $inc: { lao: amount } });
    }
}

let saveThreeDKyat = async (search_date, users) => {
    let two_d_ledgers = await DB.THREE_D_KYAT_TICKET_DB.find({ $and: [{ "date.win": search_date }, { "delete.is_delete": false }] });
    two_d_ledgers = _.groupBy(two_d_ledgers, (e) => e.agent.id);
    for (const [agentId, ledgers] of Object.entries(two_d_ledgers)) {
        let user = users[agentId];
        let apo = user.lao_apo / 10;
        let win = 0;
        let total = 0;
        for (const ledger of ledgers) {
            for (item of ledger.items) {
                if (item.num.length == 3) {
                    total += item.bet_amount;
                    win += item.win_amount;
                }
            }
        }
        // let real_cash = total / apo;
        // let com = real_cash - (total * 0.6);
        // let amount = parseInt(real_cash - com) - win;
        let name = user.name.toLowerCase();
        if (name == "uh" || name == "uhpl" || name == "4uh" || name == "uhwk" || name == "uh5") {
            total = parseInt(total * 0.6);
        } else {
            total = parseInt(total / apo);
        }
        let amount = parseInt(total) - win;
        await DB.DAILY_LEDGER.updateOne({ user_id: agentId }, { $inc: { three_d_kyat: amount } });
    }
}
let saveThreeD = async (search_date, users) => {
    let two_d_ledgers = await DB.THREE_D_TICKET_DB.find({ $and: [{ "date.win": search_date }, { "delete.is_delete": false }] });
    two_d_ledgers = _.groupBy(two_d_ledgers, (e) => e.agent.id);
    for (const [agentId, ledgers] of Object.entries(two_d_ledgers)) {
        let user = users[agentId];
        let apo = user.thai_apo / 10;
        let win = 0;
        let total = 0;
        let apar_win = 0;
        let apar_total = 0;
        for (const ledger of ledgers) {
            for (item of ledger.items) {
                if (item.num.length == 3) {
                    total += item.bet_amount;
                    win += item.win_amount;
                } else {
                    apar_total += item.bet_amount;
                    apar_win += item.win_amount;
                }
            }
        }

        // let real_cash = total / apo;
        // let com = real_cash - (total * 0.6);
        // let amount = parseInt(real_cash - com) - win;
        let name = user.name.toLowerCase();
        if (name == "uh" || name == "uhpl" || name == "4uh" || name == "uhwk" || name == "uh5") {
            total = parseInt(total * 0.6);
        } else {
            total = parseInt(total / apo);
        }
        let amount = parseInt(total) - win;
        await DB.DAILY_LEDGER.updateOne({ user_id: agentId }, { $inc: { three_d_baht: amount, apar: (apar_total - apar_win) } });
    }
}

let saveTwoD = async (search_date, users) => {
    let two_d_ledgers = await DB.TwoDNumberDB.find({ $and: [{ "date.win": search_date }, { "delete.is_delete": false }] });
    two_d_ledgers = _.groupBy(two_d_ledgers, (e) => e.agent.id);
    for (const [agentId, ledgers] of Object.entries(two_d_ledgers)) {
        let user = users[agentId];
        let win = 0;
        let total = 0;
        for (const ledger of ledgers) {
            total += ledger.amount.total;
            win += ledger.amount.win;
        }
        let name = user.name.toLowerCase();
        if (name == "uh" || name == "uhpl" || name == "4uh" || name == "uhwk" || name == "uh5") {
            total = parseInt(total * 0.9);
        }
        let amount = parseInt(total) - win;
        await DB.DAILY_LEDGER.updateOne({ user_id: agentId }, { $inc: { two_d: amount } });
    }
}

let manualDailyLedger =async()=>{
    let search_date = MOMENT("2025-09-16").tz("Asia/Rangoon").startOf("days");
    // let search_date = MOMENT().tz("Asia/Rangoon").startOf("days");
    let users = await DB.UserDB.find();
    users = _.indexBy(users, "_id");
    await SAVE_DAILY_LEDGER(search_date, users);
    await SAVE_LAO_WIN_CASH_LEDGER(search_date, users);
    console.log("DONE.");
}

http.listen(process.env.PORT, async () => {
    // await UPDATE_LAO_SETTING();
    // await CHANGE_LAO_DATE();
    // CHANGE_LAO_DATE_WIN_DATE();
    // await CHANGE_LAO_KYAT_DATE_WIN_DATE();
    // await CHANGE_TWO_D_DATE();
    // await TRANSFER_TICKET();
    // await CHANGE_USER_DATA();
    // await CHANGE_COM();
    // await CHANGE_EXTRA();
    // await new DB.SIMPLE_PRICE_SETTING().save();
    // await DELETE_THAI_LEDGER_RESTORE();
    // getLiveData();
    // await deleteNumberByDate();
    // await CREATE_DAILY_USER();
    // await SAVE_DAILY_LEDGER();
    // await SAVE_LAO_WIN_CASH_LEDGER();
    // await manualDailyLedger();
    console.log("Server start ", process.env.PORT);
});




// const numOfCpuCores = os.cpus().length;
// if (numOfCpuCores > 1) {
//     if (cluster.isMaster) {
//         console.log(`Cluster master ${process.pid} is running.`);
//         // migrateText();
//         getLiveData();
//         // example();
//         for (let i = 0; i < numOfCpuCores; i++) {
//             cluster.fork()
//         }
//         cluster.on("exit", function (worker) {
//             console.log("Worker", worker.id, " has exitted.")
//         })

//     } else {
//         http.listen(process.env.PORT, async () => {
//             console.log(`Server is listening on port ${process.env.PORT} and process ${process.pid}.`);
//         });
//     }
// } else {
//     http.listen(process.env.PORT, async () => {
//         // migrateText();
//         console.log("Server start ", process.env.PORT);
//     });
// }