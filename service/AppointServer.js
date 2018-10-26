const { dbQuery, $update, $findOne, $insert, $findAppointByLimit, $findJoinAppointByLimit } = require('../utils/db');
const types = require('../utils/types');
const ErrorLogServer = require('./ErrorLogServer');
const { getCurrentTime, formatTime, calcTime } = require('../utils');

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
                    number: 'number + 1' + types.SPECIAL_SET_VALUE,
                    lastVisitTime: getCurrentTime()
                });
                // 增加访问量
                await $update('appoint', { id: appointId }, {
                    access: 'access + 1' + types.SPECIAL_SET_VALUE
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
                    visit: 'visit + 1' + types.SPECIAL_SET_VALUE,
                    access: 'access + 1' + types.SPECIAL_SET_VALUE
                })
            }

            let result = await dbQuery(`select appoint.*, users.nickName, users.avatar, users.gender, watcher.userId from appoint left join watcher on watcher.userId = ${uid} and appointId = ${appointId} inner join users on users.id = ${uid} where appoint.id = ${appointId}`);
            if (result.length) {
                result = result[0];
                result.watching = !!result.userId;
                result.isCreator = result.creatorId === Number(uid);
                delete result.userId;
            } else {
                const api = '/appoint/:id GET';
                ErrorLogServer.appointErrorLog.fetchAppointDetailError({
                    api,
                    uid,
                    appointId,
                    dsc: `查询条件：select appoint.*, users.nickName, users.avatar, users.gender, watcher.userId from appoint left join watcher on watcher.userId = ${uid} and appointId = ${appointId} inner join users on users.id = ${uid} where appoint.id = ${appointId}`
                });
                return reject('未找到数据');
            }

            // 计算约定状态
            result.calcAppointStatus();
            result.handleUserInfo();

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
        const api = '/appoint/watch POST';
        try {
            if ( !appointId ) {
                ErrorLogServer.appointErrorLog.appointIdError({
                    api,
                    uid,
                    appointId
                });
                return reject('错误的约定ID');
            }
            let result = await dbQuery(`select deleted, creatorId, startTime, endTime, watcherNumber, watcherMax from appoint where appoint.id = ${appointId}`);
            // 约定是否存在
            if (!result.length) {
                ErrorLogServer.appointErrorLog.fetchAppointDetailError({
                    type: 8,
                    api,
                    uid,
                    appointId,
                    des: `查询条件：select deleted, creatorId, startTime, endTime, watcherNumber, watcherMax from appoint where appoint.id = ${appointId}`
                });
                return reject('约定不存在');
            }
            // 约定是否已被删除
            if (result.deleted) {
                ErrorLogServer.appointErrorLog.fetchAppointDetailError({
                    type: 7,
                    api,
                    uid,
                    appointId,
                    des: '该约定已被创建者删除，可能是通过分享访问的'
                })
                return reject('此约定已被创建者删除');
            }
            result = result[0];
            if (uid === result.creatorId) {
                ErrorLogServer.appointErrorLog.watchError({
                    type: 9,
                    uid,
                    appointId,
                    des: '检查是否是前端代码Bug导致监督者能访问这个按钮，如果不是则可能是有人通过工具模拟访问',
                    api
                });
                return reject('创建者不能监督自己的约定');
            }
            // 查询是否已经监督
            const record = await dbQuery(`select id from watcher where userId = ${uid} and appointId = ${appointId}`);
            if (record.length) {
                ErrorLogServer.appointErrorLog.watchError({
                    type: 10,
                    uid,
                    appointId,
                    des: '检查是否是前端代码Bug导致已监督后还能访问这个按钮，如果不是可能是有人通过工具模拟访问，查询条件:',
                    api
                });
                return reject('您已是监督者');
            }
            // 是否已经开始
            const currentTime = Date.now();
            const startTime = result.startTime * 1000;
            if (currentTime < startTime) {
                ErrorLogServer.appointErrorLog.watchError({
                    type: 11,
                    uid,
                    appointId,
                    des: `开始时间：${formatTime(startTime)}，请求访问时间：${currentTime}，相差：${calcTime(currentTime, startTime)}`,
                    api
                });
                return reject('约定未开启');
            }
            const endTime = result.endTime * 1000;
            if (currentTime > endTime || result.finishTime) {
                ErrorLogServer.appointErrorLog.watchError({
                    type: 12,
                    uid,
                    appointId,
                    des: `结束时间：${formatTime(endTime)}，请求访问时间：${currentTime}，相差：${calcTime(currentTime, startTime)}`,
                    api
                });
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

            if (currentTime > appoint.endTime * 1000 || appoint.finishTime) return reject('约定已结束，无法再选择');

            // 查询是否已有
            if (appoint.isSupport !== void 0 && appoint.isSupport !== null) {
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
            await dbQuery(`update appoint SET ${supportName} = ${supportName} + 1, isSupport = ${support} WHERE id = ${appointId}`);

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
};

const userClockIn = function ( uid, body = {} ) {
    return new Promise(async (resolve, reject) => {
        const api = '/appoint/clock-in POST';
        try {
            if (!body.appointId) {
                ErrorLogServer.appointErrorLog.appointIdError({
                    api,
                    uid,
                    appointId: body.appointId || 'undefined'
                });
                return reject('错误的约定ID');
            }

            // 检测约定是否有效
            const appoint = await checkAppoint(body.appointId, api);

            // 检查是否为创建者
            if (appoint.creatorId !== uid) {
                const des = `创建者id：${appoint.creatorId}，打卡者id：${uid}`;
                ErrorLogServer.appointErrorLog.clockInError({
                    type: 3,
                    appointId: body.appointId,
                    uid,
                    api,
                    des
                });

                return reject('只有创建者才可以打卡！');
            }

            // 是否已经打卡
            if (appoint.finishTime) {
                const des = `该约定已经打卡了，打卡时间为：${formatTime(appoint.finishTime * 1000)}`;
                ErrorLogServer.appointErrorLog.clockInError({
                    type: 2,
                    appointId: body.appointId,
                    uid,
                    api,
                    des
                });

                return reject('您已经打卡')
            }

            // 检测是否已经超时或未开始
            const currentTime = Date.now();
            const startTime = appoint.startTime * 1000;
            if (currentTime < startTime) {
                const des = `约定开始时间：${formatTime(startTime)}，请求打卡时间：${formatTime(currentTime)}，提前了 ${calcTime(startTime, currentTime)}`;
                ErrorLogServer.appointErrorLog.clockInError({
                    type: 0,
                    appointId: body.appointId,
                    uid,
                    api,
                    des
                });
                return reject('约定未开始，稍等会再来');
            }
                // 【超时打卡】暂不处理，暂时允许创建者超时打卡

            // 打卡
            await dbQuery(`update appoint SET finishTime = ? where id = ${body.appointId}`, [ getCurrentTime(currentTime) ]);
            resolve();
        } catch (err) {
            reject(err);
        }
    })
};

const supporters = function ( appointId, type ) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!appointId) return reject('错误的ID');
            if (type === void 0) return reject('请求类型错误');
            // 检查约定是否有效
            await checkAppoint(appointId);

            return resolve(dbQuery(`select users.avatar, users.nickName from support, users where support.appointId = ${appointId} and users.id = support.userId and support.support = ${type}`))
        } catch (err) {
            reject(err);
        }
    })
};

const allAppoint = function ( params = {} ) {
    return new Promise(async (resolve, reject) => {
        try {
            let { startId = -1, size = 30 } = params;
            if (startId === -1) startId = 999999;

            const result = await dbQuery(`select appoint.*, users.avatar, users.nickName, users.gender from appoint, users where appoint.id < ${startId}  and appoint.creatorId = users.id order by id desc limit ${size}`);

            result.handleAppointData();
            resolve(result);
        } catch (err) {
            reject(err)
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
    createAppoint,
    getAppointDetail,
    getUserCreateAppointList,
    getUserJoinAppointList,
    watchAppoint,
    supportAppoint,
    userClockIn,
    supporters,
    allAppoint
}
