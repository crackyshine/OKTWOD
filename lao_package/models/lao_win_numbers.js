const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const laoWinNumberSchema = new Schema({
    agent: {
        id: {type: Schema.ObjectId, ref: 'user'},
        name: {type: String, required: true},
    },
    win_number:{type:String,default:""},
    win_date: {type: Date, default: Date.now},
    created: {type: Date, default: Date.now},
});
const LAO_WIN_NUMBER_DB = MONGO.model('lao_win_number', laoWinNumberSchema);
module.exports = LAO_WIN_NUMBER_DB;