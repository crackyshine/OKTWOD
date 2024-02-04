const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const bornNumberSchema = new Schema({
    agent_name:{type:String,default:""},
    name: {type: String, required: true},
    born_num: {type: String, required: true},
    created: {type: Date, default:Date.now},
});
const BornNumberDB =MONGO.model('born_number',bornNumberSchema);
module.exports =BornNumberDB;