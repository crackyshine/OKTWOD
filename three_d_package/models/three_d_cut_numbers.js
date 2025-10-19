const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const threeDCutNumberSchema = new Schema({
    name:{type:String,required:true},
    win_date: {type: Date, default: Date.now},
    bet_num: {type:String,default:""},
    amount: {type:Number,default:0},
});
threeDCutNumberSchema.index({ name: 1, win_date:1});
const THREE_D_CUT_NUMBER_DB = MONGO.model('three_d_cut_numbers', threeDCutNumberSchema);
module.exports = THREE_D_CUT_NUMBER_DB;