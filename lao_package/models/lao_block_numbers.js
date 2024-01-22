const mongoose =require('mongoose');
const Schema =mongoose.Schema;
const laoBlockNumberSchema =new Schema({
    block_num:{type:Number,required:true},
    created:{type:Date,default:Date.now}
});
const LAO_BLOCK_NUMBER_DB =mongoose.model("lao_block_number",laoBlockNumberSchema);
module.exports =LAO_BLOCK_NUMBER_DB;