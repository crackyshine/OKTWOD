const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const refillRecordSchema = new Schema({
    agent: {
        id:{type: Schema.ObjectId, ref: 'user'},
        name: {type: String, default: ""},
        open: {type: Number, default: 0},
        amount: {type: Number, default: 0},
        close:{type:Number,default:0},
    },
    status: {type: String, enum: ['PAY', 'WITHDRAW'],default:"WITHDRAW"},
    creator:{type:String,required:true},
    remark:{type:String,default:""},
    date: {type: Date, default: Date.now},

});
const RefillRecordDB = MONGO.model('refill_record', refillRecordSchema);
module.exports = RefillRecordDB;