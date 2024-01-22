const mongoose =require('mongoose');
const Schema =mongoose.Schema;
const ThreeDBlockKyatNumberSchema =new Schema({
    block_num:{type:Number,required:true},
    created:{type:Date,default:Date.now}
});
const THREE_D_BLOCK_KYAT_NUMBER_DB =mongoose.model("three_d_block_kyat_number",ThreeDBlockKyatNumberSchema);
module.exports =THREE_D_BLOCK_KYAT_NUMBER_DB;