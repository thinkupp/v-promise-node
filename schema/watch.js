const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const WatchSchema = new Schema({
    createTime: Number,
    appointId: String,
    userId: String
});

WatchSchema.statics = Object.assign({}, CommonQuestionStatics);
module.exports = WatchSchema;
