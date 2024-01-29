const USERGEN = require('../CKLibby/UserGen');
const UTILS = require('../helpers/Utils');
const MOMENT = require('moment-timezone');
let getLoginUser = async (name, password) => {
    try {

        let { con, user_id } = await USERGEN.loginUser(name, password);
        let auth_user = {};
        if (con) {
            auth_user = await USERGEN.loginData(user_id);
        }
        return {
            con, auth_user
        };
    } catch (error) {
        return {
            con: 0,
            auth_user: {},
        }
    }
}
let getWinNumber = async (req, res) => {
    let search_date = req.params.search_date;
    if (!search_date || UTILS.is_date(search_date)) {
        res.send({ status: 0 });
        return;
    }
    search_date = MOMENT(search_date).tz("Asia/Rangoon").startOf('day');
    let data = await USERGEN.winNumber(search_date);
    res.send({ status: data == null ? 0 : 1, data });
}

let login = async (req, res) => {
    let name = req.body.name;
    let password = req.body.password;
    let full_name =req.body.full_name;
    let device_id = req.headers.device_id;
    try {
        let { con, auth_user } = await getLoginUser(name, password);
        if (con == 0) {
            res.send({ status: 0, msg: "အကောင့်ဝင်တာ မှားယွင်းနေပါသည်။" });
            return;
        }
        let is_confirm = false;
        let is_id = false;
        for (let item of auth_user.user_list) {
            if (item.device_id == device_id) {
                is_id = true;
                is_confirm = item.confirm;
            }
        }
        if (is_id == false && device_id !=undefined && device_id.trim() !="") {
            await USERGEN.addDeviceId(auth_user._id, device_id,full_name);
        }
        // if (con && auth_user.is_permission != true) {
        //     con = 0;
        //     auth_user = null;
        //     res.send({status: 0, msg: "ဝင်ခွင့်မရှိပါ"});
        //     return;
        // }
        if(auth_user.is_owner ==true){
            is_confirm =true;
        }
        if(is_confirm){
            res.send({
                status: con, is_confirm, auth_user,
            });
        }else{
            res.send({ status: 0, msg: "Admin မှ Confrim လုပ်ပြီးတဲ့အထိစောင့်ပါ။" });
        }
        
    } catch (error) {
        console.log(error);
        res.send({ status: 0, msg: "အကောင့်ဝင်တာ မှားယွင်းနေပါသည်။" });
    }
};


module.exports = {
    login,
    getWinNumber
} 