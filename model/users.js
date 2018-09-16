const mongoose = require('mongoose');
const UsersSchema = require('../schema/users');

const UsersModel = mongoose.model('users', UsersSchema);

module.exports = UsersModel;
