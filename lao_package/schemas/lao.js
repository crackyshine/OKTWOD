const JOI = require('joi');
let lao_setting = JOI.object({
    title_one: JOI.string().allow(''),
    title_two: JOI.string().allow(''),
    title_three: JOI.string().allow(''),
    title_four: JOI.string().allow(''),
    close_time: JOI.string().required().error(new Error("အချိန်မှားယွင်းနေပါသည်။")),
    win_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    delete_minute: JOI.number().required().error(new Error("ဖျတ်ချိန်မှားယွင်းနေပါသည်။")),
    three_d: JOI.object({
        win_percent: JOI.number().required().error(new Error("သုံးလုံး အနိုင် ရာခိုင်နှုန်းမှားယွင်းနေပါသည်။")),
        block_amount: JOI.number().required().error(new Error("သုံးလုံး အကန့်အသတ်မှားယွင်းနေပါသည်။")),
        block_amount_k: JOI.number().required().error(new Error("သုံးလုံး(ကျပ်) အကန့်အသတ်မှားယွင်းနေပါသည်။")),
    }),
    lao_cut_count: JOI.object({
        prize_one: JOI.number().required().error(new Error("35  ဘတ် ဖျတ်ပမာဏ မှားနေပါသည်။")),
        prize_two: JOI.number().required().error(new Error("60  ဘတ် ဖျတ်ပမာဏ မှားနေပါသည်။")),
        prize_three: JOI.number().required().error(new Error("120  ဘတ် ဖျတ်ပမာဏ မှားနေပါသည်။")),
        prize_four: JOI.number().required().error(new Error("150  ဘတ် ဖျတ်ပမာဏ မှားနေပါသည်။")),
    }),
    three_d_cut_amount: JOI.number().required().error(new Error("သုံးလုံး ဖျတ်ပမာဏ မှားယွင်းနေပါသည်။")),
    three_d_cut_amount_k: JOI.number().required().error(new Error("သုံးလုံး(ကျပ်) ဖျတ်ပမာဏ မှားယွင်းနေပါသည်။")),
});
let lao_price_item = JOI.object({
    type_name: JOI.string().required().error(new Error("နာမည် မှားယွင်းနေပါသည်။")),
    amount: JOI.number().required().error(new Error("ပမာဏမှားယွင်းနေပါသည်။")),
    four_d: JOI.number().required().error(new Error("(၄) လုံးဒဲ့ တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_d: JOI.number().required().error(new Error("နောက် (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_three_d: JOI.number().required().error(new Error("ရှေ့ (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    four_permute: JOI.number().required().error(new Error("(၄) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_permute: JOI.number().required().error(new Error("နောက် (၂) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_two_d: JOI.number().required().error(new Error("ရှေ့ နှစ်လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    back_two_d: JOI.number().required().error(new Error("နောက် (၂) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    amount_k: JOI.number().required().error(new Error("ပမာဏမှားယွင်းနေပါသည်။")),
    four_d_k: JOI.number().required().error(new Error("(၄) လုံးဒဲ့ တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_d_k: JOI.number().required().error(new Error("နောက် (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_three_d_k: JOI.number().required().error(new Error("ရှေ့ (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    four_permute_k: JOI.number().required().error(new Error("(၄) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_permute_k: JOI.number().required().error(new Error("နောက် (၂) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_two_d_k: JOI.number().required().error(new Error("ရှေ့ နှစ်လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    back_two_d_k: JOI.number().required().error(new Error("နောက် (၂) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    block_count: JOI.number().required().error(new Error("အကွက်ရေတန်ဖိုးမှားယွင်းနေပါသည်။")),
});
let lao_update_price_item = JOI.object({
    search_id: JOI.string().regex(/^[0-9a-fA-F]{24}$/).required().error(new Error("တန်းဖိုးမှားယွင်းနေပါသည်။")),
    type_name: JOI.string().required().error(new Error("နာမည် မှားယွင်းနေပါသည်။")),
    amount: JOI.number().required().error(new Error("ပမာဏမှားယွင်းနေပါသည်။")),
    four_d: JOI.number().required().error(new Error("(၄) လုံးဒဲ့ တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_d: JOI.number().required().error(new Error("နောက် (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_three_d: JOI.number().required().error(new Error("ရှေ့ (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    four_permute: JOI.number().required().error(new Error("(၄) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_permute: JOI.number().required().error(new Error("နောက် (၂) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_two_d: JOI.number().required().error(new Error("ရှေ့ နှစ်လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    back_two_d: JOI.number().required().error(new Error("နောက် (၂) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    amount_k: JOI.number().required().error(new Error("ပမာဏမှားယွင်းနေပါသည်။")),
    four_d_k: JOI.number().required().error(new Error("(၄) လုံးဒဲ့ တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_d_k: JOI.number().required().error(new Error("နောက် (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_three_d_k: JOI.number().required().error(new Error("ရှေ့ (၃) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    four_permute_k: JOI.number().required().error(new Error("(၄) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    three_permute_k: JOI.number().required().error(new Error("နောက် (၂) လုံးပြန် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    front_two_d_k: JOI.number().required().error(new Error("ရှေ့ နှစ်လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    back_two_d_k: JOI.number().required().error(new Error("နောက် (၂) လုံးတိုက် တန်ဖိုးမှားယွင်းနေပါသည်။")),
    block_count: JOI.number().required().error(new Error("အကွက်ရေတန်ဖိုးမှားယွင်းနေပါသည်။")),
});

let check_lao_ticket = JOI.object({
    items: JOI.array().items(JOI.object({
        num: JOI.string().required().error(new Error("နံပါတ် မှားယွင်းနေပါသည်။")),
        bet_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်။")),
        original_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်")),
        count: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်")),
    })).min(1).required(),
});
let save_lao_ticket = JOI.object({
    name: JOI.string().allow(''),
    items: JOI.array().items(JOI.object({
        num: JOI.string().required().error(new Error("နံပါတ် မှားယွင်းနေပါသည်။")),
        bet_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်။")),
        original_amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်")),
        count: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်")),
    })).min(1).required(),
});
let check_date = JOI.object({
    search_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
});
let check_cut_date = JOI.object({
    search_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    type: JOI.string().required().error(new Error("တန်ဖ်ိုးမှားယွင်းနေပါသည်။")),
});
let check_win_number = JOI.object({
    win_number: JOI.string().min(4).max(4).required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
});
let check_between_date = JOI.object({
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
let cut_number = JOI.object({
    from: JOI.string().required().error(new Error("နာမည် မှာယွင်းနေပါသည်။")),
    to: JOI.string().required().error(new Error("နာမည် မှားယွင်းနေပါသည်။")),
    search_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    prize_one: JOI.array().items().optional(),
    prize_two: JOI.array().items().optional(),
    prize_three: JOI.array().items().optional(),
    prize_four: JOI.array().items().optional(),
});
let cut_number_three_d = JOI.object({
    from: JOI.string().required().error(new Error("နာမည် မှာယွင်းနေပါသည်။")),
    to: JOI.string().required().error(new Error("နာမည် မှားယွင်းနေပါသည်။")),
    search_date: JOI.date().required().error(new Error("ရက်စွဲမှားယွင်းနေပါသည်။")),
    items: JOI.array().items(JOI.object({
        num: JOI.string().required().error(new Error("နံပါတ် မှားယွင်းနေပါသည်။")),
        amount: JOI.number().required().error(new Error("လောင်းကြေးမှားယွင်းနေပါသည်။")),
    })).min(1).required(),
});
module.exports = {
    lao_setting,
    lao_price_item,
    lao_update_price_item,
    check_lao_ticket,
    save_lao_ticket,
    check_win_number,
    check_date,
    check_between_date,
    check_id,
    check_remark,
    check_cut_date,
    cut_number,
    cut_number_three_d
}