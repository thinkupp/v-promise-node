const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const BrowseSchema = new Schema({
    createTime: {
        type: Number,
        default: Date.now
    },
    lastBrowserTime: {
        type: Number,
        default: Date.now
    },

    appointId: String,
    browsePeopleId: String
});

BrowseSchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = BrowseSchema;
