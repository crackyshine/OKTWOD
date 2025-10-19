const DB = require('../../models/DB');
const _ = require("underscore");

let GEN_KYAT_TO_BAHT =(items,price_items)=>{
    let data =[];
    for(let item of items){
        if(item.num.length == 4){
            item.original_amount =price_items[`${item.original_amount}`].amount;
        }
        data.push(item);
    }
    return data;
}
let REFORMAT_ITEM = (items, isCompany) => {
    let working_items = [];
    items.forEach(object => {
        object.exist_count = 0;
        object.exist_amount = 0;
        object.count = 1;
        object.access_count = 1;
        if (working_items.some(e => e.num == object.num && (object.num.length == 3 || (object.num.length == 4 && (object.original_amount == e.original_amount || isCompany == false))))) {
            for (let d of working_items) {
                if (d.num == object.num) {
                    if (object.num.length == 3) {
                        d.bet_amount += object.bet_amount;
                        d.original_amount += object.bet_amount;
                    } else {
                        if (d.original_amount == object.original_amount || isCompany == false) {
                            d.count++;
                            d.access_count++;
                        }
                    }
                }
            }
        } else {
            working_items.push(object);
        }
    });
    return working_items;
}

let GEN_ITEMS = (items, exist_items, isCompany, cut_count) => {
    for (let item of exist_items) {
        if (items.some(e => e.num == item.bet_num && (item.bet_num.length == 3 || (item.bet_num.length == 4 && (item.original_amount == e.original_amount || isCompany == false))))) {
            for (let d of items) {
                if (d.num == item.bet_num) {
                    if (item.bet_num.length == 4) {
                        if (item.original_amount == d.original_amount || isCompany == false) { 
                            d.exist_amount += item.bet_amount;
                            d.exist_count += (item.bet_amount / item.original_amount) + ((isCompany == false && item.original_amount > d.original_amount && item.original_amount > 60) ? cut_count.prize_two : 0);
                        }
                    } else {
                        d.exist_amount = item.bet_amount;
                        d.exist_count = 1;
                    }
                }
            }
        }
    }
    return items;
}
let GEN_ITEMS_K = (items, exist_items, isCompany, cut_count) => {
    for (let item of exist_items) {
        if (items.some(e => e.num == item.bet_num && (item.bet_num.length == 3 || (item.bet_num.length == 4 && (item.original_amount == e.original_amount || isCompany == false))))) {
            for (let d of items) {
                if (d.num == item.bet_num) {
                    if (item.bet_num.length == 4) {
                        if (item.original_amount == d.original_amount || isCompany == false) {
                            d.exist_amount += item.original_amount;
                            d.exist_count += (item.bet_amount / item.original_amount) + ((isCompany == false && item.original_amount > d.original_amount && item.original_amount > 60) ? cut_count.prize_two : 0);
                        }
                    } else {
                        d.exist_amount = item.bet_amount;
                        d.exist_count = 1;
                    }
                }
            }
        }
    }
    return items;
}
let GEN_FINAL_ITEMS = (confirm, items) => {
    let return_items = [];
    for (let item of items) {
        if (item.count > 1) {
            for (let i = 0; i < item.count; i++) {
                if (i >= Number(item.access_count)) {
                    confirm = true;
                }
                return_items.push({
                    num: item.num,
                    bet_amount: i >= item.access_count ? 0 : item.bet_amount,
                    original_amount: item.original_amount,
                    count: i > item.access_count ? 0 : 1,
                    server_amount: item.exist_amount
                })
            }
        } else {
            return_items.push({
                num: item.num,
                bet_amount: item.bet_amount,
                original_amount: item.original_amount,
                count: item.count,
                server_amount: item.exist_amount
            });
        }
    }
    return {
        final_confirm: confirm,
        return_items
    }
}
let CHECK_BLOCK_COMPANY_ITEMS = async (items, three_d_block_amount, price_items) => {
    let confirm = false;
    let nums = _.uniq(_.pluck(items, 'num'));
    let block_items = await DB.LAO_BLOCK_NUMBER_DB.find({ block_number: { $in: Array.from(new Set(nums)) } })
    block_items = _.indexBy(block_items, 'block_number');
    for (let item of items) {
        if (item.num in block_items) {
            item.bet_amount = 0;
            item.access_count = 0;
            confirm = true;
        } else {
            if (item.num.length == 3) {
                if (Number(item.exist_amount) >= three_d_block_amount) {
                    item.bet_amount = 0;
                    confirm = true;
                } else if ((Number(item.bet_amount) + Number(item.exist_amount)) > three_d_block_amount) {
                    item.bet_amount = three_d_block_amount - Number(item.exist_amount);
                    confirm = true;
                }
            } else {
                if (Number(item.exist_count) >= price_items[`${item.original_amount}`].block_count) {
                    item.access_count = 0;
                    item.bet_amount = 0;
                    confirm = true;
                } else if ((Number(item.count) + Number(item.exist_count)) > price_items[`${item.original_amount}`].block_count) {
                    item.access_count = price_items[`${item.original_amount}`].block_count - item.exist_count;
                    confirm = true;
                }
            }
        }
    }
    return {
        confirm: confirm,
        check_items: items
    }
}
let CHECK_BLOCK_HNH_ITEMS = async (items, three_d_block_amount, lao_cut_count) => {
    let confirm = false;
    let nums = _.uniq(_.pluck(items, 'num'));
    let block_items = await DB.LAO_BLOCK_NUMBER_DB.find({ block_number: { $in: Array.from(new Set(nums)) } })
    block_items = _.indexBy(block_items, 'block_number');
    for (let item of items) {
        let block_count = lao_cut_count.prize_one;
        if (item.original_amount == 60) {
            block_count = lao_cut_count.prize_two;
        }
        if (item.original_amount == 100) {
            block_count = lao_cut_count.prize_three;
        }
        if (item.original_amount == 150) {
            block_count = lao_cut_count.prize_four;
        }
        if (item.num in block_items) {
            item.bet_amount = 0;
            item.access_count = 0;
            confirm = true;
        } else {
            if (item.num.length == 3) {
                if (Number(item.exist_amount) >= three_d_block_amount) {
                    item.bet_amount = 0;
                    confirm = true;
                } else if ((Number(item.bet_amount) + Number(item.exist_amount)) > three_d_block_amount) {
                    item.bet_amount = three_d_block_amount - Number(item.exist_amount);
                    confirm = true;
                }
            } else {
                if (Number(item.exist_count) >= block_count) {
                    item.access_count = 0;
                    item.bet_amount = 0;
                    confirm = true;
                } else if ((Number(item.count) + Number(item.exist_count)) > block_count) {
                    item.access_count = block_count - item.exist_count;
                    confirm = true;
                }
            }
        }
    }
    return {
        confirm: confirm,
        check_items: items
    }
}
let checkLaoNumber = async (items, win_date, name, setting, price_items) => {
    let nums = _.uniq(_.pluck(items, 'num'));
    items = REFORMAT_ITEM(items, name == "Company");
    let exist_tickets = await DB.LAO_CUT_NUMBER_DB.find({
        $and: [
            { bet_num: { $in: Array.from(new Set(nums)) } },
            { win_date: win_date },
            { name: name },
        ]
    });
    let gen_items = GEN_ITEMS(items, exist_tickets, name == "Company", setting.lao_cut_count);
    let data;
    if (name == "Company") {
        data = await CHECK_BLOCK_COMPANY_ITEMS(gen_items, setting.three_d.block_amount, price_items);
    } else {
        data = await CHECK_BLOCK_HNH_ITEMS(items, setting.three_d_cut_amount, setting.lao_cut_count);
    }
    const { final_confirm, return_items } = GEN_FINAL_ITEMS(data.confirm, data.check_items);
    return {
        confirm: final_confirm,
        numbers: return_items
    }

}


let checkLaoKNumber = async (items, win_date, name, setting, price_items) => {
    let four_nums =_.filter(items, (item) => item.num.length == 4);
    let three_nums =_.filter(items, (item) => item.num.length == 3);
    let f_nums = _.uniq(_.pluck(four_nums, 'num'));
    let t_nums = _.uniq(_.pluck(three_nums, 'num'));
    items =REFORMAT_ITEM(items,name="Company");
    let four_exit_tickets = await DB.LAO_CUT_NUMBER_DB.find({
        $and: [
            { bet_num: { $in: Array.from(new Set(f_nums)) } },
            { win_date: win_date },
            { name: name },
        ]
    });
    let three_exit_tickets = await DB.LAO_KYAT_CUT_NUMBER_DB.find({
        $and: [
            { bet_num: { $in: Array.from(new Set(t_nums)) } },
            { win_date: win_date },
            { name: name },
        ]
    });
    let exit_tickets = four_exit_tickets.concat(three_exit_tickets);
    let gen_items = GEN_ITEMS_K(items, exit_tickets, name == "Company", setting.lao_cut_count);
    let data;
    if (name == "Company") {
        data = await CHECK_BLOCK_COMPANY_ITEMS(gen_items, setting.three_d.block_amount_k, price_items);
    } else {
        data = await CHECK_BLOCK_HNH_ITEMS(items, setting.three_d_cut_amount_k, setting.lao_cut_count);
    }
    const { final_confirm, return_items } = GEN_FINAL_ITEMS(data.confirm, data.check_items);
    return {
        confirm: final_confirm,
        numbers: return_items
    }
}

module.exports = {
    checkLaoNumber,
    checkLaoKNumber,
    GEN_KYAT_TO_BAHT,
}