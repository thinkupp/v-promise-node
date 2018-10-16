const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const now = Date.now();

const BrowseSchema = new Schema({
    createTime: {
        type: Number,
        default: now
    },
    lastBrowserTime: {
        type: Number,
        default: now
    },

    appointId: String,
    browsePeopleId: String
});

BrowseSchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = BrowseSchema;
