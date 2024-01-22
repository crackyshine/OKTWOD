const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const winNumberSchema = new Schema({
    first_prize: {
        num:{type: String, default:""},
        amount:{type: Number, default:0}
    },
    first_close_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    first_front_three_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    first_back_three_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    first_back_two_prize: {
        num:{type: String, default:""},
        amount:{type: Number, default:0}
    },
    second_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    third_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    fourth_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    fifth_prize: {
        num:[{type: String}],
        amount:{type: Number, default:0}
    },
    date: {type: Date, default:Date.now},
    youtube_url: {type: String,default:""},
    pdf_url: {type: String,default:""},
    api_link:{type:String,default:""},
});
const WinNumberDB =MONGO.model('win_number',winNumberSchema);
module.exports =WinNumberDB;
