const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const transferSchama = new Schema({
    from:{
        id:{type: Schema.ObjectId, ref: 'user'},
        name:{type: String, required:true},
    },
    to:{
        id:{type: Schema.ObjectId, ref: 'user'},
        name:{type: String, required:true},
    },
    air:{
        ids: {type:Array,default:[]},
        amount:{type:Number,default:0},
    },
    simple:{
        ids: {type:Array,default:[]},
        amount:{type:Number,default:0},
    },
    date: {type: Date, default: Date.now},

});
const transferDB = MONGO.model('ticket_transfer', transferSchama);
module.exports = transferDB;