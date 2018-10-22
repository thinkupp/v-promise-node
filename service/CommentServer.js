const { dbQuery, $update, $findOne, $insert, $findAppointByLimit } = require('../utils/db');

const publishComment = function ( uid, params ) {
    return new Promise(async (resolve, reject) => {
        try {
            const { appointId, content } = params;
            if (!appointId || !content) return reject('参数不正确');
            const r = await $insert('comments', {
                appointId,
                content,
                userId: uid
            });
            const result = await dbQuery(`select comments.id, comments.content, comments.userId, comments.createTime, comments.parise, users.avatar, users.nickName from comments inner join users on users.id = ${uid} WHERE comments.id = ${r.insertId}`);
            resolve(result[0]);
        } catch (err) {
            reject(err);
        }
    })
};

const getAppointComments = function ( uid, appointId, params ) {
    return new Promise(async (resolve, reject) => {
        try {
            let { startId, size } = params;
            if (!startId || !size) return reject('错误的参数');
            if (Number(startId) === -1) {
                // 从头开始获取
                startId = await dbQuery('select max(id) from comments');
                startId = startId[0]['max(id)'] || 0;
                startId += 1;
            }

            const result = await dbQuery(`select comments.id, comments.content, comments.userId, comments.createTime, comments.parise, users.avatar, users.nickName from comments inner join users on users.id = ${uid} WHERE comments.appointId = ${appointId} AND comments.userId = ${uid} AND comments.ban = 0 AND comments.id < ${startId} order by createTime desc limit ${size}`);

            resolve(result);
        } catch (err) {
            reject(err);
        }
    })
}

module.exports = {
    publishComment,
    getAppointComments
}
