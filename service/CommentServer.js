const { dbQuery, $update, $findOne, $insert, $findAppointByLimit } = require('../utils/db');

const publishComment = function ( uid, params ) {
    return new Promise(async (resolve, reject) => {
        try {
            const { appointId, content } = params;
            if (!appointId || !content) return reject('参数不正确');

            // 检查约定状态
            const appoint = await checkAppoint(appointId);

            // 检查用户是否有权评论 * 暂定所有人都可以评论
            // if (uid !== appoint.creatorId) {
            //     // 如果不是创建者则检查是否是监督者
            //     const record = await dbQuery(`select id from watcher where appointId = ${appointId} and userId = ${uid}`);
            //     if (!record.length) {
            //         return reject('只有监督者才可以发表评论！')
            //     }
            // }

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

            const result = await dbQuery(`select comment_like.id as isLike, comments.id, comments.content, comments.userId, comments.createTime, comments.parise, users.avatar, users.nickName from comments left join comment_like on comment_like.commentId = comments.id and comment_like.userId = ${uid} inner join users on users.id = ${uid} WHERE comments.appointId = ${appointId} AND comments.userId = ${uid} AND comments.ban = 0 AND comments.id < ${startId} order by createTime desc limit ${size}`);

            result.isLike = !!result.isLike;
            resolve(result);
        } catch (err) {
            reject(err);
        }
    })
}

const commentLike = function ( uid, {appointId, commentId} ) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!commentId || !appointId) return reject('错误的ID');
            // 检查约定以及评论是否有效
            let result = await dbQuery(`select comment_like.id as isLike, appoint.deleted, comments.id as commentId, comments.ban, comments.parise from appoint left join comment_like on comment_like.userId = ${uid} and comment_like.commentId = ${commentId} inner join comments on comments.id = ${commentId} where appoint.id = ${appointId}`);

            if (!result.length) {
                return reject('未找到数据');
            }

            result = result[0];

            if (result.deleted) {
                return reject('约定已被作者删除，您无法再进行操作！')
            }

            if (!result.commentId) {
                return reject('查找评论数据失败！')
            }

            if (result.ban) {
                return reject('该评论已被系统屏蔽，请刷新显示最新评论列表');
            }

            let parise = result.parise;
            if (result.isLike) {
                // 已经是点赞状态删除这条数据
                await dbQuery(`delete from comment_like where comment_like.id = ${result.isLike}`);
                // 更新点赞数
                await dbQuery(`update comments SET parise = parise - 1 WHERE comments.id = ${commentId}`);
                parise--;
            } else {
                // 增加一条点赞数据
                await dbQuery(`insert into comment_like(commentId, userId) values(${commentId}, ${uid})`);
                // 更新点赞数
                await dbQuery(`update comments SET parise = parise + 1 WHERE comments.id = ${commentId}`);
                parise++;
            }

            resolve({
                like: !result.isLike,
                number: parise
            });
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
    getAppointComments,
    commentLike
}
