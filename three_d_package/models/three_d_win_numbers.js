const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const threeDWinNumberSchema = new Schema({
    agent: {
        id: {type: Schema.ObjectId, ref: 'user'},
        name: {type: String, required: true},
    },
    win_number:{type:String,default:""},
    win_date: {type: Date, default: Date.now},
    created: {type: Date, default: Date.now},
});
const THREE_D_WIN_NUMBER_DB = MONGO.model('three_d_win_number', threeDWinNumberSchema);
module.exports = THREE_D_WIN_NUMBER_DB;