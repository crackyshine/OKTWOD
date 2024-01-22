const DB = require('../models/DB');
const UTILS = require('../helpers/Utils');
let loginUser = async (name, password) => {
    try {
        let user_id = "";
        let userData = await DB.UserDB.findOne({name: name});
        let con = 0;
        if (userData) {
            let is_match_pass = UTILS.comparePassword(password.toString(), userData.password);
            if (is_match_pass) {
                user_id = userData._id;
                con = 1;
            }
        }
        return {con: con, user_id: user_id};
    } catch (err) {
        return {con: 0, user_id: ""};
    }

}
let loginData = async (user_id) => {
    try {
        let auth_user = await DB.UserDB.findOne({_id: user_id});
        auth_user.password = undefined;
        return auth_user;
    } catch {
        return null;
    }
}
let setting = async () => {
    try {
        let data = await DB.SettingDB.findOne({show_id: 0});
        return data;
    } catch {
        return null;
    }
}
let priceSetting = async () => {
    try {
        let data = await DB.PriceSettingDB.findOne({show_id: 0});
        return data;
    } catch {
        return null;
    }
}
let winNumber = async (search_date) => {
    try {
        let data = await DB.WinNumberDB.findOne({date: search_date}).select("-api_link -__v -_id");
        return data;
    } catch {
        return null;
    }
}
let addDeviceId =async(user_id,device_id,full_name)=>{
    await DB.UserDB.updateOne({ _id: user_id}, {
        $push: {
            "user_list": {
                device_id: device_id,
                name: full_name,
                is_confirm: false
            }
        }
    }, {
        safe: true,
        multi: true
    });
}
module.exports = {
    loginUser,
    loginData,
    setting,
    priceSetting,
    winNumber,
    addDeviceId
}
