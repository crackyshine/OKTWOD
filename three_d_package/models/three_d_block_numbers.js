const mongoose =require('mongoose');
const Schema =mongoose.Schema;
const ThreeDBlockNumberSchema =new Schema({
    block_num:{type:String,required:true},
    created:{type:Date,default:Date.now}
});
const THREE_D_BLOCK_NUMBER_DB =mongoose.model("three_d_block_number",ThreeDBlockNumberSchema);
module.exports =THREE_D_BLOCK_NUMBER_DB;