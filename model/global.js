const mongoose = require('mongoose');
const GlobalSchema = require('../schema/global');

const GlobalModel = mongoose.model('global', GlobalSchema);

module.exports = GlobalModel;
