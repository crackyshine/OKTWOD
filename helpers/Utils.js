const MOMENT = require('moment-timezone');
const BCRYPT = require('bcrypt');
comparePassword = (plain, hash) => {
    return BCRYPT.compareSync(plain, hash);
}
encodePassword = (password) => {
    return BCRYPT.hashSync(password, 10);
}

checkPassword = (password) => {
    let strongRegex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{6})");
    return strongRegex.test(password);
}

let is_date = (value) => {
    return MOMENT(value, 'yyyy-MM-dd', true).isValid();
}
let is_mongo = (id) => {
    return id.match(/^[0-9a-fA-F]{24}$/);
}

let permuteAll = (string) => {
    if (string.length < 2) return string; // This is our break condition

    var permutations = []; // This array will hold our permutations
    for (var i = 0; i < string.length; i++) {
        var char = string[i];

        // Cause we don't want any duplicates:
        if (string.indexOf(char) != i) // if char was used already
            continue; // skip it this time

        var remainingString = string.slice(0, i) + string.slice(i + 1, string.length); //Note: you can concat Strings via '+' in JS

        for (var subPermutation of permuteAll(remainingString))
            permutations.push(char + subPermutation)

    }
    return permutations;
}


let permute = (string) => {
    return permuteAll(string).filter((element) => element != string);
}

let isThreeEqual = (string) => {
    var s = string.split('');
    return (s[0] == s[1] && s[0] == s[2]);
}

let getTwoDData = (setting) => {
    let type = "MORNING";
    let is_close = false;
    let evening = MOMENT(Date.now()).tz("Asia/Rangoon").startOf("days").add(12, "hours").add(10, 'minutes');
    let morning = MOMENT(Date.now()).tz("Asia/Rangoon").startOf("days").add(16, "hours").add(40, 'minutes');
    let date = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days');
    let now = MOMENT(Date.now()).tz("Asia/Rangoon");
    if (date.format("dddd") == "Saturday") {
        date = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(2, "days");
    } else if (date.format("dddd") == "Sunday") {
        date = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(1, "days");
    } else {
        if (now.isAfter(evening) && now.isBefore(morning)) {
            type = "EVENING";
        }
        if (now.isAfter(morning)) {
            date = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(1, "days");
        }
        for (let time of setting.morning) {
            let start = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(Number(time.start.split(":")[0]), 'hours').add(Number(time.start.split(":")[1]), 'minutes')
            let end = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(Number(time.end.split(":")[0]), 'hours').add(Number(time.end.split(":")[1]), 'minutes');
            if (now.isBetween(start, end)) {
                is_close = true;
            }
        }
        for (let time of setting.evening) {
            let start = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(Number(time.start.split(":")[0]), 'hours').add(Number(time.start.split(":")[1]), 'minutes')
            let end = MOMENT(Date.now()).tz("Asia/Rangoon").startOf('days').add(Number(time.end.split(":")[0]), 'hours').add(Number(time.end.split(":")[1]), 'minutes');
            if (now.isBetween(start, end)) {
                is_close = true;
            }
        }
    }
    return {
        is_close,
        type,
        date
    }
}

let checkCloseThreeD = (setting) => {
    let bet_time = MOMENT(MOMENT(Date.now()).tz("Asia/Rangoon"));
    let close_time = MOMENT(Date.parse(setting.win_date)).tz("Asia/Rangoon").startOf('days').add(Number(setting.close_time.split(":")[0]), 'hours').add(Number(setting.close_time.split(":")[1]), 'minutes');
    if (bet_time.isBefore(close_time)) {
        return false;
    } else {
        return true;
    }
}
let checkLaoData = (setting) => {
    let bet_time = MOMENT(MOMENT(Date.now()).tz("Asia/Rangoon"));
    let close_time = MOMENT(Date.parse(setting.win_date)).tz("Asia/Rangoon").startOf('days').add(Number(setting.close_time.split(":")[0]), 'hours').add(Number(setting.close_time.split(":")[1]), 'minutes');
    if (bet_time.isBefore(close_time)) {
        return false;
    } else {
        return true;
    }
}

let UTZ = {
    "(၄) လုံးဒဲ့": "(၄) လုံးဒဲ့",
    "နောက် (၃) လုံးတိုက်": "ေနာက္ (၃) လုံးတိုက္",
    "ရှေ့ (၃) လုံးတိုက်": "ေရွ႕ (၃) လုံးတိုက္",
    "(၄) လုံးပြန်": "(၄) လုံးျပန္",
    "နောက် (၃) လုံး ပြန်": "ေနာက္ (၃) လုံး ျပန္",
    "ရှေ့ (၂) လုံးတိုက်": "ေရွ႕ (၂) လုံးတိုက္",
    "နောက် (၂) လုံးတိုက်": "ေနာက္ (၂) လုံးတိုက္",
}

let SHARE_HOLDERS = [
    'HNH',
    'Lucky',
    'UH',
    'MTK',
]

module.exports = {
    comparePassword: comparePassword,
    encodePassword: encodePassword,
    checkPassword: checkPassword,
    is_mongo: is_mongo,
    is_date: is_date,
    permuteAll,
    permute,
    isThreeEqual,
    getTwoDData,
    checkCloseThreeD,
    checkLaoData,
    UTZ,
    SHARE_HOLDERS
}