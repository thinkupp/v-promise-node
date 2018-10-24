const { dbQuery, $update, $findOne, $insert, $findAppointByLimit } = require('../utils/db');

const publishComment = function ( uid, params ) {
    return new Promise(async (resolve, reject) => {
        try {
            const { appointId, content } = params;
            if (!appointId || !content) return reject('参数不正确');

            // 检查约定状态
            const appoint = await checkAppoint(appointId);

            // 检查用户是否有权评论
            if (uid !== appoint.creatorId) {
                // 如果不是创建者则检查是否是监督者
                const record = await dbQuery(`select id from watcher where appointId = ${appointId} and userId = ${uid}`);
                if (!record.length) {
                    return reject('只有监督者才可以发表评论！')
                }
            }

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

function checkAppoint( appointId ) {
    return new Promise(async (resolve, reject) => {
        try {
            let appoint = await dbQuery(`select * from appoint where id = ${appointId}`);
            if (!appoint.length) {
                return reject('约定不存在')
            }
            appoint = appoint[0];
            if (appoint.deleted) {
                return reject('约定已被作者删除')
            }
            resolve(appoint)
        } catch (err) {
            reject(err);
        }
    })
}

module.exports = {
    publishComment,
    getAppointComments
}
