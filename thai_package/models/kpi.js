const mongoose = require('mongoose');
const shopSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    two: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    six: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
});
const kpiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    items: {
        type: [shopSchema],
        default: null
    },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    createdAt: {
        type: Number, required: true, default: () => {
            return Math.floor(Date.now() / 1000);
        }
    },
});

module.exports = mongoose.model('kpi', kpiSchema);