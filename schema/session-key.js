const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const SessionKeySchema = new Schema({
    sessionKey: String,
    openid: String
});

SessionKeySchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = SessionKeySchema;

/*
* SessionKey
* */