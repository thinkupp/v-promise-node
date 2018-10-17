const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const WatchSchema = new Schema({
    createTime: {
        type: Number,
        default: Date.now
    },

    appointId: String,
    userId: String
});

WatchSchema.statics = Object.assign({}, CommonQuestionStatics);
module.exports = WatchSchema;
