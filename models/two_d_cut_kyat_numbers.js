const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const twoDCutKyatNumberSchema = new Schema({
    name:{type:String,required:true},
    type: {type: String, enum: ['MORNING', 'EVENING'], default: "MORNING"},
    win_date: {type: Date, default: Date.now},
    bet_num: {type:String,default:""},
    amount: {type:Number,default:0},
});
const TwoDCutKyatNumberDB = MONGO.model('two_d_cut_kyat_number', twoDCutKyatNumberSchema);
module.exports = TwoDCutKyatNumberDB;