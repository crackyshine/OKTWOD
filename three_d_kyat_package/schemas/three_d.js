const JOI = require('joi');
let check_three_d = JOI.object({
    items: JOI.array().items(JOI.object({
        num: JOI.string().required().error(new Error("နံပါတ် မှားယွင်းနေပါသည်။")),
        bet_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်။")),
        original_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်")),
    })).min(1).required(),
});
let save_three_d = JOI.object({
    name: JOI.string().allow(''),
    items: JOI.array().items(JOI.object({
        num: JOI.string().required().error(new Error("နံပါတ် မှားယွင်းနေပါသည်။")),
        bet_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်။")),
        original_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်")),
    })).min(1).required(),
});
let check_date =JOI.object({
    search_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
});
let check_between_date =JOI.object({
    start_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    end_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
});
let check_id = JOI.object({
    search_id: JOI.string().regex(/^[0-9a-fA-F]{24}$/).required().error(new Error("တန်းဖိုးမှားယွင်းနေပါသည်။")),
});
let check_remark = JOI.object({
    search_id: JOI.string().regex(/^[0-9a-fA-F]{24}$/).required().error(new Error("တန်းဖိုးမှားယွင်းနေပါသည်။")),
    remark: JOI.string().allow(''),
});
let win_number = JOI.object({
    win_number: JOI.string().min(3).max(3).required().error(new Error("တန်းဖိုးမှားယွင်းနေပါသည်။")),
});
let three_d_setting = JOI.object({
    title_one: JOI.string().allow(''),
    title_two: JOI.string().allow(''),
    title_three: JOI.string().allow(''),
    title_four: JOI.string().allow(''),
    close_time: JOI.string().required().error(new Error("အချိန်မှားယွင်းနေပါသည်။")),
    win_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    win_percent: JOI.number().required().error(new Error("အနိုင် ရာခိုင်နှုန်းမှားယွင်းနေပါသည်။")),
    block_amount: JOI.number().required().error(new Error("အကန့်အသတ်မှားယွင်းနေပါသည်။")),
    delete_minute: JOI.number().required().error(new Error("ဖျတ်ချိန်မှားယွင်းနေပါသည်။")),
});
let cut_number = JOI.object({
    from: JOI.string().required().error(new Error("နာမည် မှာယွင်းနေပါသည်။")),
    to: JOI.string().required().error(new Error("နာမည် မှားယွင်းနေပါသည်။")),
    search_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    items: JOI.array().items(JOI.object({
        num: JOI.string().required().error(new Error("နံပါတ် မှားယွင်းနေပါသည်။")),
        amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်။")),
    })).min(1).required(),
});
module.exports = {
    check_three_d,
    save_three_d,
    check_date,
    check_between_date,
    check_id,
    check_remark,
    win_number,
    three_d_setting,
    cut_number,
}