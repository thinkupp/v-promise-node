const clientDB = function () {
    const mongoose = require('mongoose');

    const connectUrl = 'mongodb://localhost/v-promise';
    mongoose.connect( connectUrl );

    const db = mongoose.connection;

    db.on('error', function() {
        console.log('与数据库建立连接失败！');
    });

    db.once('open', async function() {
        console.log('已连接数据库')
    });
};

module.exports = {
    clientDB
}