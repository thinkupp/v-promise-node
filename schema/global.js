const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const GlobalSchema = new Schema({
    createTime: {
        type: Number,
        default: Date.now
    },

    sessionKey: String
});

GlobalSchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = GlobalSchema;

/*
* SessionKey
* */