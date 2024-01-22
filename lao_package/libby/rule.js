const UTILS = require('../../helpers/Utils');
let calculateWinNumber = (win_num, item, price_items) => {
    let is_win = false;
    if (win_num == item.num) {
        item.win.amount = price_items[`${item.bet_amount}`].four_d;
        item.win.str = '(၄) လုံးဒဲ့';
        is_win = true;
    } else if (win_num.substring(1, 4) == item.num.toString().substr(1, 4)) {
        item.win.amount = price_items[`${item.bet_amount}`].three_d;
        item.win.str = 'နောက် (၃) လုံးတိုက်';
        is_win = true;
    } else if (win_num.substring(0,3) == item.num.toString().substr(0, 3)) {
        item.win.amount = price_items[`${item.bet_amount}`].front_three_d;
        item.win.str = 'ရှေ့ (၃) လုံးတိုက်';
        is_win = true;
    } else if (checkPermute(win_num, item.num)) {
        item.win.amount = price_items[`${item.bet_amount}`].four_permute;
        item.win.str = '(၄) လုံးပြန်';
        is_win = true;
    } else if (checkPermute(win_num.substring(1, 4), item.num.toString().substr(1, 4))) {
        item.win.amount = price_items[`${item.bet_amount}`].three_permute;
        item.win.str = 'နောက် (၃) လုံး ပြန်';
        is_win = true;
    } else if (win_num.substring(0, 2) == item.num.toString().substr(0, 2)) {
        item.win.amount = price_items[`${item.bet_amount}`].front_two_d;
        item.win.str = 'ရှေ့ (၂) လုံးတိုက်';
        is_win = true;
    } else if (win_num.substring(2, 4) == item.num.toString().substr(2, 4)) {
        item.win.amount = price_items[`${item.bet_amount}`].back_two_d;
        item.win.str = 'နောက် (၂) လုံးတိုက်';
        is_win = true;
    }
    return {win_item: item, is_win};
}
let calculateWinKNumber = (win_num, item, price_items) => {
    let is_win = false;
    if (win_num == item.num) {
        item.win.amount = price_items[`${item.bet_amount}`].four_d_k;
        item.win.str = '(၄) လုံးဒဲ့';
        is_win = true;
    } else if (win_num.substring(1, 4) == item.num.toString().substr(1, 4)) {
        item.win.amount = price_items[`${item.bet_amount}`].three_d_k;
        item.win.str = 'နောက် (၃) လုံးတိုက်';
        is_win = true;
    } else if (win_num.substring(0,3) == item.num.toString().substr(0, 3)) {
        item.win.amount = price_items[`${item.bet_amount}`].front_three_d_k;
        item.win.str = 'ရှေ့ (၃) လုံးတိုက်';
        is_win = true;
    } else if (checkPermute(win_num, item.num)) {
        item.win.amount = price_items[`${item.bet_amount}`].four_permute_k;
        item.win.str = '(၄) လုံးပြန်';
        is_win = true;
    } else if (checkPermute(win_num.substring(1, 4), item.num.toString().substr(1, 4))) {
        item.win.amount = price_items[`${item.bet_amount}`].three_permute_k;
        item.win.str = 'နောက် (၃) လုံး ပြန်';
        is_win = true;
    } else if (win_num.substring(0, 2) == item.num.toString().substr(0, 2)) {
        item.win.amount = price_items[`${item.bet_amount}`].front_two_d_k;
        item.win.str = 'ရှေ့ (၂) လုံးတိုက်';
        is_win = true;
    } else if (win_num.substring(2, 4) == item.num.toString().substr(2, 4)) {
        item.win.amount = price_items[`${item.bet_amount}`].back_two_d_k;
        item.win.str = 'နောက် (၂) လုံးတိုက်';
        is_win = true;
    }
    return {win_item: item, is_win};
}
let calculateCutWinNumber = (win_num, item, price_items) => {
    let is_win = false;
    let win_amount = 0;
    let win_str = "";
    if (win_num == item.bet_num) {
        win_amount = price_items[`${item.original_amount}`].four_d;
        win_str ="(၄) လုံးဒဲ့";
        is_win = true;
    } else if (win_num.substring(1, 4) == item.bet_num.toString().substr(1, 4)) {
        win_amount = price_items[`${item.original_amount}`].three_d;
        win_str ="ောက္ (၃) လုံးတိုက္";
        is_win = true;
    } else if (win_num.substring(0, 3) == item.bet_num.toString().substr(0, 3)) {
        win_amount = price_items[`${item.original_amount}`].front_three_d;
        win_str ="ေရွ႕ (၃) လုံးတိုက္";
        is_win = true;
    } else if (checkPermute(win_num, item.bet_num)) {
        win_amount = price_items[`${item.original_amount}`].four_permute;
        win_str = "(၄) လုံးျပန္";
        is_win = true;
    } else if (checkPermute(win_num.substring(1, 4), item.bet_num.toString().substr(1, 4))) {
        win_amount = price_items[`${item.original_amount}`].three_permute;
        win_str ="ေနာက္ (၃) လုံး ျပန္";
        is_win = true;
    } else if (win_num.substring(0, 2) == item.bet_num.toString().substr(0, 2)) {
        win_amount = price_items[`${item.original_amount}`].front_two_d;
        win_str ="ေရွ႕ (၂) လုံးတိုက္";
        is_win = true;
    } else if (win_num.substring(2, 4) == item.bet_num.toString().substr(2, 4)) {
        win_amount = price_items[`${item.original_amount}`].back_two_d;
        win_str = "ေနာက္ (၂) လုံးတိုက္";
        is_win = true;
    }
    return {is_win, win_amount, win_str};
}
let calculateCutKWinNumber = (win_num, item, price_items) => {
    let is_win = false;
    let win_amount = 0;
    let win_str = "";
    if (win_num == item.bet_num) {
        win_amount = price_items[`${item.original_amount}`].four_d;
        win_str ="(၄) လုံးဒဲ့";
        is_win = true;
    } else if (win_num.substring(1, 4) == item.bet_num.toString().substr(1, 4)) {
        win_amount = price_items[`${item.original_amount}`].three_d;
        win_str ="ောက္ (၃) လုံးတိုက္";
        is_win = true;
    } else if (win_num.substring(0, 3) == item.bet_num.toString().substr(0, 3)) {
        win_amount = price_items[`${item.original_amount}`].front_three_d_k;
        win_str ="ေရွ႕ (၃) လုံးတိုက္";
        is_win = true;
    } else if (checkPermute(win_num, item.bet_num)) {
        win_amount = price_items[`${item.original_amount}`].four_permute;
        win_str = "(၄) လုံးျပန္";
        is_win = true;
    } else if (checkPermute(win_num.substring(1, 4), item.bet_num.toString().substr(1, 4))) {
        win_amount = price_items[`${item.original_amount}`].three_permute;
        win_str ="ေနာက္ (၃) လုံး ျပန္";
        is_win = true;
    } else if (win_num.substring(0, 2) == item.bet_num.toString().substr(0, 2)) {
        win_amount = price_items[`${item.original_amount}`].front_two_d;
        win_str ="ေရွ႕ (၂) လုံးတိုက္";
        is_win = true;
    } else if (win_num.substring(2, 4) == item.bet_num.toString().substr(2, 4)) {
        win_amount = price_items[`${item.original_amount}`].back_two_d;
        win_str = "ေနာက္ (၂) လုံးတိုက္";
        is_win = true;
    }
    return {is_win, win_amount, win_str};
}
let checkPermute = (win_num, num) => {
    let permute_list = UTILS.permute(win_num);
    if (permute_list.includes(num)) {
        return true;
    }
    return false;
}


module.exports = {
    calculateWinNumber,
    calculateWinKNumber,
    calculateCutWinNumber
}