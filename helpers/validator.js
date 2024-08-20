const JWT = require('jsonwebtoken');
const UTILS = require('../helpers/Utils');
const USERGEN = require('../CKLibby/UserGen');
let genToken = (payload) => {
    return JWT.sign({ id: payload }, process.env.SECRET_KEY);
}
let validateAuthToken = async (req, res, next) => {
    let payload = req.headers.authorization;
    let device_id = req.headers.device_id;
    try {
        let decode = JWT.verify(payload, process.env.SECRET_KEY);
        let id = decode.id;
        if (id && UTILS.is_mongo(id)) {
            let auth_user = await USERGEN.loginData(id)
            let is_confirm = false;
            for (let item of auth_user.user_list) {
                if (item.device_id == device_id && item.confirm == true) {
                    is_confirm = true;
                }
            }
            // if(auth_user.is_owner ==false && is_confirm ==false){
            if (auth_user.is_owner == false && auth_user.name != "ksl" && is_confirm == false) {
                res.send({ status: 0, msg: "ဝင်ခွင့်မရှိပါ။" });
                return;
            }
            auth_user.user_list = undefined;
            // if(auth_user && auth_user.is_permission ==true){
            res.locals.auth_user = auth_user;
            next();
            // }else{
            //     res.send({status:0,msg:"ဝင်ခွင့်မရှိပါ။"});
            // }
        } else {
            res.send({ status: 0, msg: "ဝင်ခွင့်မရှိပါ။" });
        }
    } catch (error) {
        console.log(error);
        res.send({ status: 0, msg: process.env.connect_dev });
    }
}
let validateBody = (schema) => {
    return (req, res, next) => {
        let result = schema.validate(req.body);
        if (result.error) {
            next(new Error(result.error.message));
        } else {
            next();
        }
    }
}
let validateParam = (schema) => {
    return async (req, res, next) => {
        let result = schema.validate(req.params);
        if (result.error) {
            next(new Error(result.error.message));
        } else {
            next();
        }
    }
}

module.exports = {
    genToken,
    validateAuthToken,
    validateBody,
    validateParam
}