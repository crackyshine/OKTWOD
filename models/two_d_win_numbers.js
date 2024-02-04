const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const twoDWinNumberSchema = new Schema({
    agent: {
        id: {type: Schema.ObjectId, ref: 'user'},
        name: {type: String, required: true},
    },
    win_number:{type:String,default:""},
    type: {type: String, enum: ['MORNING', 'EVENING'], default: "MORNING"},
    win_date: {type: Date, default: Date.now},
    created: {type: Date, default: Date.now},
});
const TwoDWinNumberDB = MONGO.model('two_d_win_number', twoDWinNumberSchema);
module.exports = TwoDWinNumberDB;