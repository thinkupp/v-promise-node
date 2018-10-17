const mongoose = require('mongoose');
const WatchSchema = require('../schema/watch');

const WatchModel = mongoose.model('watch', WatchSchema);

module.exports = WatchModel;
