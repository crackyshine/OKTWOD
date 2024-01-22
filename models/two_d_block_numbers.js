const mongoose =require('mongoose');
const Schema =mongoose.Schema;
const TwoDBlockNumberSchema =new Schema({
    block_num:{type:Number,required:true},
    amount:{type:Number,required:true},
    created:{type:Date,default:Date.now}
});
const TwoDBlockNumberDB =mongoose.model("two_d_block_numbers",TwoDBlockNumberSchema);
module.exports =TwoDBlockNumberDB;