const mongoose = require('mongoose');
const SessionKeySchema = require('../schema/session-key');

const SessionKeyModel = mongoose.model('session-key', SessionKeySchema);

module.exports = SessionKeyModel;
