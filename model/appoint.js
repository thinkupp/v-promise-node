const mongoose = require('mongoose');
const AppointSchema = require('../schema/appoint');

const AppointModel = mongoose.model('appoint', AppointSchema);

module.exports = AppointModel;
