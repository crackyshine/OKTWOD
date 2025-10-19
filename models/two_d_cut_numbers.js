const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const twoDCutNumberSchema = new Schema({
    name:{type:String,required:true},
    type: {type: String, enum: ['MORNING', 'EVENING'], default: "MORNING"},
    win_date: {type: Date, default: Date.now},
    bet_num: {type:String,default:""},
    amount: {type:Number,default:0},
});
twoDCutNumberSchema.index({ name: 1, type: 1, win_date:1});
const TwoDCutNumberDB = MONGO.model('two_d_cut_number', twoDCutNumberSchema);
module.exports = TwoDCutNumberDB;