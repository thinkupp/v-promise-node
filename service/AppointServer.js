const { dbQuery, $update, $findOne, $insert, $findAppointByLimit } = require('../utils/db');
const types = require('../utils/types')
const { getCurrentTime } = require('../utils');

const createAppoint = function ( uid, params ) {
    params.startTime = parseInt(new Date( params.startTime ).getTime() / 1000);
    params.endTime = parseInt((new Date( params.startTime ).getTime() + params.effectiveTime * 60 * 1000) / 1000);
    params.creatorId = uid;
    // return AppointModel.$create( params )
    return $insert('appoint', params);
};

const getAppointDetail = function ( uid, appointId ) {
    return new Promise(async (resolve, reject) => {
        try {
            // 查询是否有此人的访问记录
            const visitRecord = await dbQuery(`select id from visit where userId = ${uid}`);

            if (visitRecord.length) {
                await $update('visit', { userId: uid }, {
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

module.exports = {
    createAppoint,
    getAppointDetail,
    getUserCreateAppointList
}

// select * from lists inner join users on users.id = 100000