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

            let result = await dbQuery(`select appoint.*, users.nickName, users.avatar, users.gender from appoint inner join users on users.id = ${uid} where appoint.id = ${appointId}`);
            if (result.length) {
                result = result[0];
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

module.exports = {
    createAppoint,
    getAppointDetail,
    getUserCreateAppointList,
    getUserJoinAppointList
}

// select * from lists inner join users on users.id = 100000