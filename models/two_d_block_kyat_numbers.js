const mongoose =require('mongoose');
const Schema =mongoose.Schema;
const TwoDBlockKyatNumberSchema =new Schema({
    block_num:{type:Number,required:true},
    amount:{type:Number,required:true},
});
const TwoDBlockKyatNumberDB =mongoose.model("two_d_block_kyat_numbers",TwoDBlockKyatNumberSchema);
module.exports =TwoDBlockKyatNumberDB;