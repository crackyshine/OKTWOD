const MOMENT = require("moment-timezone");
const _ = require("underscore");
let IS_CLOSE = (setting_date, win_date) => {
    return win_date > MOMENT(Date.parse(setting_date)).tz('Asia/Rangoon').add('hours', 14).add('minutes', 50).unix();
}

let GEN_NAME_AND_SUM_AMOUNT = (ledgers) => {
    let grouped_two_ledgers = _.groupBy(ledgers, (e) => e.agent.name);
    let agent_totals = _.mapObject(grouped_two_ledgers, (ledgers) => {
        return _.reduce(ledgers, (sum, ledger) => sum + (ledger.amount.total || 0), 0);
    });
    let agent_array = _.map(agent_totals, (amount, name) => {
        return { name: name, amount: amount };
    });
    agent_array.sort((a, b) => a.name.localeCompare(b.name));
    return agent_array;
}
let GEN_LAO_NAME_AND_SUM_AMOUNT = (ledgers) => {
    let grouped_two_ledgers = _.groupBy(ledgers, (e) => e.agent.name);
    let agent_totals = _.mapObject(grouped_two_ledgers, (ledgers) => {
        return _.reduce(ledgers, (sum, ledger) => sum + (ledger.amount.bet || 0), 0);
    });
    let agent_array = _.map(agent_totals, (amount, name) => {
        return { name: name, amount: amount };
    });
    agent_array.sort((a, b) => a.name.localeCompare(b.name));
    return agent_array;
}
let GEN_THAI_NAME_AND_SUM_AMOUNT = (ledgers) => {
    let grouped_two_ledgers = _.groupBy(ledgers, (e) => e.sold_out.name);
    let agent_totals = _.mapObject(grouped_two_ledgers, (ledgers) => {
        return _.reduce(ledgers, (sum, ledger) => sum + (ledger.amount.sold_out || 0), 0);
    });
    let agent_array = _.map(agent_totals, (amount, name) => {
        return { name: name, amount: amount };
    });
    agent_array.sort((a, b) => a.name.localeCompare(b.name));
    return agent_array;
}

let COMPOUND_ARRAY = (arr) => {
    let result = {};
    arr.forEach(item => {
        if (item.name) {
            if (!result[item.name]) {
                result[item.name] = { ...item, amount: item.amount || 0 };
            } else {
                result[item.name].amount += item.amount || 0;
            }
        }
    });
    return Object.values(result);
};
module.exports = {
    IS_CLOSE,
    GEN_NAME_AND_SUM_AMOUNT,
    GEN_LAO_NAME_AND_SUM_AMOUNT,
    GEN_THAI_NAME_AND_SUM_AMOUNT,
    COMPOUND_ARRAY
}