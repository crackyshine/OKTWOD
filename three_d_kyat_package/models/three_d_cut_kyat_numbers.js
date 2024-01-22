const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const threeDCutKyatNumberSchema = new Schema({
    name:{type:String,required:true},
    win_date: {type: Date, default: Date.now},
    bet_num: {type:String,default:""},
    amount: {type:Number,default:0},
});
const THREE_D_CUT_KYAT_NUMBER_DB = MONGO.model('three_d_cut_kayt_numbers', threeDCutKyatNumberSchema);
module.exports = THREE_D_CUT_KYAT_NUMBER_DB;