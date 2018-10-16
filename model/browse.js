const mongoose = require('mongoose');
const BrowseSchema = require('../schema/browse');

const BrowseModel = mongoose.model('browse', BrowseSchema);

module.exports = BrowseModel;
