const MOMENT = require("moment-timezone");
let IS_CLOSE =(setting_date,win_date)=>{
     return win_date > MOMENT(Date.parse(setting_date)).tz('Asia/Rangoon').add('hours',14).add('minutes',50).unix();
}
module.exports ={
    IS_CLOSE,
}