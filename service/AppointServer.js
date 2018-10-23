const { dbQuery, $update, $findOne, $insert, $findAppointByLimit, $findJoinAppointByLimit } = require('../utils/db');
const types = require('../utils/types')
const { getCurrentTime } = require('../utils');

const createAppoint = function ( uid, params ) {
    params.startTime = parseInt(new Date( params.startTime ).getTime() / 1000);
    params.endTime = parseInt((new Date( params.startTime ).getTime() * 1000 + params.effectiveTime * 60 * 1000) / 1000);
    params.creatorId = uid;
    return $insert('appoint', params);
};

const getAppointDetail = function ( uid, appointId ) {
    return new Promise(async (resolve, reject) => {
        try {
            // 查询是否有此人的访问记录
            const visitRecord = await dbQuery(`select id from visit where userId = ${uid} AND appointId = ${appointId}`);
            if (visitRecord.length) {
                await $update('visit', {
                    userId: uid,
                    appointId
                }, {
                    visitNumber: 'visitNumber + 1' + types.SPECIAL_SET_VALUE,
                    lastVisitTime: getCurrentTime()
                });
                // 增加访问量
                await $update('appoint', { id: appointId }, {
                    accessNumber: 'accessNumber + 1' + types.SPECIAL_SET_VALUE
                })
            } else {
                await $insert('visit', {
                    lastVisitTime: getCurrentTime(),
                    userId: uid,
                    appointId
                });
                // 增加浏览人次以及访问量
                await $update('appoint', {
                    id: appointId
                }, {
                    visitNumber: 'visitNumber + 1' + types.SPECIAL_SET_VALUE,
                    accessNumber: 'accessNumber + 1' + types.SPECIAL_SET_VALUE
                })
            }

            let result = await dbQuery(`select appoint.*, users.nickName, users.avatar, users.gender, watcher.userId from appoint left join watcher on watcher.userId = ${uid} and appointId = ${appointId} inner join users on users.id = ${uid} where appoint.id = ${appointId}`);
            if (result.length) {
                result = result[0];
                result.watching = !!result.userId;
                delete result.userId;
            } else {
                return reject('未找到数据');
            }

            // 计算约定状态
            const currentTime = Date.now();
            result.startTime *= 1000;
            result.endTime *= 1000;

            // 0-> 未开始, 1 -> 进行中 2 -> 结束 3 -> 按时完成 4 -> 超时完成
            if (result.finishTime) {
                result.finishTime *= 1000;
                if (result.finishTime < result.endTime) {
                    result.status = 3;
                } else {
                    result.status = 4;
                }
            } else {
                result.status = currentTime < result.startTime ? 0 : currentTime > result.endTime ? 2 : 1;
            }

            result.u = {
                avatar: result.avatar,
                nickName: result.nickName,
                gender: result.gender
            };
            delete result.avatar;
            delete result.nickName;
            delete result.gender;

            // 查询该约定
            resolve(result)
        } catch (err) {
            reject(err);
        }
    })
}

const getUserCreateAppointList = function ( uid, option ) {
    option.id = Number(option.id);
    option.size = Number(option.size);
    return $findAppointByLimit( { creatorId: uid }, option);
};

const getUserJoinAppointList = function ( uid, query ) {
    query.startId = Number(query.startId) || -1;
    query.size = Number(query.size) || 30;
    return $findJoinAppointByLimit(uid, query);
};

const watchAppoint = function ( uid, appointId ) {
    return new Promise(async (resolve, reject) => {
        try {
            if ( !appointId ) return reject('错误的约定ID');
            let result = await dbQuery(`select deleted, creatorId, startTime, endTime, watcherNumber, watcherMax from appoint where appoint.id = ${appointId}`);
            // 约定是否存在
            if (!result.length) return reject('约定不存在');
            // 约定是否已被删除
            if (result.deleted) return reject('此约定已被创建者删除');
            result = result[0];
            if (uid === result.creatorId) return reject('创建者不能监督自己的约定');
            // 查询是否已经监督
            const record = await dbQuery(`select id from watcher where userId = ${uid} and appointId = ${appointId}`);
            if (record.length) return reject('您已是监督者');
            // 是否已经开始
            const currentTime = Date.now();
            if (currentTime < result.startTime) {
                return reject('约定未开启');
            }
            if (currentTime > result.endTime) {
                return reject('约定已结束')
            }
            // 是否已经满员
            if (result.watcherMax > 0 && result.watcherNumber >= result.watcherMax) {
                return reject('监督者已达到上限！')
            }
            // 写入监督者表
            const watchResult = await dbQuery(`insert into watcher(userId, appointId) values (${uid}, ${appointId})`);
            // 监督者
            await dbQuery(`update appoint set watcherNumber = watcherNumber + 1 where appoint.id = ${appointId}`);
            resolve(watchResult.insertId);
        } catch (err) {
            reject(err)
        }
    })
};

const supportAppoint = function ( uid, params ) {
    return new Promise(async (resolve, reject) => {
        try {
            const { support, appointId } = params;
            if (support === void 0 || appointId === void 0) return reject('参数不完整');

            // 约定是否有效
            const appoint = await $findOne('appoint', {
                id: appointId,
                deleted: 0
            });

            if (!appoint) return reject('约定不存在或已被创建者删除');

            const currentTime = Date.now();

            // if (currentTime > appoint.endTime * 1000 || appoint.finishTime) return reject('约定已结束，无法再选择');

            // 查询是否已有
            const query = {
                userId: uid,
                appointId
            };

            const record = await $findOne('support', query);

            if (record) {
                // 更新
                return reject('不能重复选择');
            }


            // 写入数据到表
            await $insert('support', {
                userId: uid,
                appointId,
                support
            });

            // 更新用户字段信息
            const supportName = support === 0 ? 'unSupport' : 'support';
            await dbQuery(`update appoint SET ${supportName} = ${supportName} + 1 WHERE id = ${appointId}`);

            // 返回约定的支持者和反对者
            const result = {
                support: appoint.support,
                unSupport: appoint.unSupport
            };
            // 将老数据更新
            result[supportName]++;

            resolve(result);
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    createAppoint,
    getAppointDetail,
    getUserCreateAppointList,
    getUserJoinAppointList,
    watchAppoint,
    supportAppoint
}

// select * from lists inner join users on users.id = 100000