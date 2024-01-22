const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const ticketLedgerSchema = new Schema({
    ticket: {
        number:{type: String, required: true},
        scanner:{type: String, required: true},
        is_air:{type: Boolean, required: true},
        count:{type: Number, default:1},
        amount:{type:Number,default:0},
        date:{type:Date,required:true},
    },
    agent:{
        id:{type:Schema.ObjectId,ref:'user'},
        name:{type:String,required:true},
        amount:{type:Number,required:true},
        date:{type:Date,required:null},
    },
    sold_out:{
        is_sold_out:{type:Boolean,default:false},
        name:{type:String,default:""},
        amount:{type:Number,default:0},
        date:{type:Date,default:null},
    },
    air:{
        status:{type: Boolean, default:false},
        amount:{type:Number,default:0},
        cash:{type: Boolean, default:false},
        date:{type:Date,default:null},
        win_title:[{title:String,amount: Number}]
    },
    simple:{
        status:{type: Boolean, default:false},
        amount:{type:Number,default:0},
        cash:{type: Boolean, default:false},
        date:{type:Date,default:null},
        win_title:[{title:String,amount: Number}]
    },
    status:{
        status: {type: String, enum: ['PENDING', 'LOSE', 'WIN'],default:"PENDING"},
        finish:{type: Boolean, default:false},
        promotion:{type:Number,default:0},
    },
    delete:{
        is_delete:{type: Boolean, default: false},
        date:{type: Date, default:null},
        name:{type: String, default:""},
    },
    crated:{type:Date,default:Date.now},
    remark:{type:String,default:""}
});

const TicketLedgerDB =MONGO.model('ticket_ledger',ticketLedgerSchema);
module.exports =TicketLedgerDB;