const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const GlobalSchema = new Schema({
    sessionKey: String
});

GlobalSchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = GlobalSchema;

/*
* SessionKey
* */