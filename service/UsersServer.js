const WeChatServer = require('./WeChatServer');
const ApiServer = require('./ApiServer');
const { $update, $findOne, $insert, dbQuery } = require('../utils/db');
const types = require('../utils/types');

/*
* 检查用户是否需要注册
*/
const checkUserStatus = function ( {code, loginStatus} ) {
    const { appid, secret } = WeChatServer.getWeChatInfo();

    return new Promise(async (resolve, reject) => {
        try {
            const result = await ApiServer.fetchSessionKey( appid, secret, code );
            if (result.errmsg && result.errcode) return reject( result.errmsg );

            const { session_key, openid } = result;

            let u = await dbQuery(`select id, ban, registerTime, avatar, nickName from users where openid = ?`, [ openid ]);

            u = u[0];

            if ( u ) {
                if (u.registerTime) {
                    const updateData = { lastLoginTime: parseInt(Date.now() / 1000) };
                    if (!loginStatus) updateData.loginNumber = 'loginNumber+1' + types.SPECIAL_SET_VALUE;
                    await $update('users', {openid}, updateData)
                }
            }

            // 如果不存在，创建一个以openid为标识的临时用户
            else {
                const i = await $insert('users', {openid});
                u = { ban: false, id: i.insertId }
            }

            const sessionKeyData = { session_key,  user_id: u.id };

            const sk = await $findOne('session_keys', { user_id: u.id });

            if (sk) {
                $update('session_keys', {user_id: u.id}, sessionKeyData)
            } else {
                $insert('session_keys', sessionKeyData);
            }

            resolve({
                ban: !!u.ban,
                regStatus: !!u.registerTime,
                id: u.id,
                u: {
                    avatar: u.avatar,
                    nickName: u.nickName
                }
            });
        } catch (err) {
            reject( err )
        }
    })
};

/*
* 注册
*/
const register = function ( id, data ) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) reject('ID错误，注册失败');

            const about = WeChatServer.getWeChatInfo();
            const { encryptedData, iv } = data.detail;
            let uSession = await $findOne('session_keys', { user_id: id });

            // 客户端传code，重新获取sessionkey
            if (!uSession) return reject( 'session key error' );

            const userInfo = await WeChatServer.decryptData( about.appid, uSession.session_key, encryptedData, iv );
            await $update('users', { id }, {
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                avatar: userInfo.avatarUrl,
                systemInfo: data.systemInfo,
                region: `${userInfo.country} ${userInfo.province } ${userInfo.city}`,
                scene: data.scene,
                openid: userInfo.openId,
                unionid: userInfo.unionid || '',
                registerTime: parseInt(Date.now() / 1000)
            });
            return resolve({
                u: {
                    avatar: userInfo.avatarUrl,
                    nickName: userInfo.nickName
                }
            })
        } catch (err) {
            reject (err);
        }
    })
};

/*
* 获取用户访问记录
* @params
*   body
*       startId 开始查询的ID
*       size 数量
* */
const userAccessRecord = function( uid, params ) {
    return new Promise(async (resolve, reject) => {
        try {
            let { startId = 999999, size = 30 } = params;
            if (startId === -1) startId = 999999;

            // 根据用户ID查出所有的访问记录
            const result = await dbQuery(`select appoint.title, appoint.id, appoint.startTime, appoint.createTime, appoint.finishTime, appoint.type, users.avatar, users.nickName, visit.lastVisitTime from visit, appoint, users where visit.userId = ${uid} and visit.deleted = 0 and appoint.id = visit.appointId and users.id = appoint.creatorId and visit.id < ${startId} order by visit.lastVisitTime desc limit ${size}`);

            // 计算任务状态
            result.forEach(record => {
                record.calcAppointStatus();
								record.lastVisitTime *= 1000;
                delete record.startTime;
                delete record.endTime;
                delete record.finishTime;
            });

            resolve(result);

        } catch (err) {
            reject(err);
        }
    })
};

/*
* 删除用户访问记录
* @params
*   body
*       access_record_id
* */
const removeAccessRecord = function ( visit_id ) {
    return new Promise((resolve, reject) => {
        try {
            if (!visit_id) return reject('错误的请求');
            resolve(dbQuery(`update table visit SET delete = 1 where id = ${visit_id}`));
        } catch (err) {
            reject(err)
        }
    })
}

const checkUser = function ( uid ) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!uid) reject({
                status: 400,
                message: '错误的访问'
            });

            const u = await $findOne('users', {id: uid});
            if (u) return resolve();
            reject({
                status: 400,
                message: '用户不存在'
            });
        } catch (err) {
            if (typeof err === 'string') {
                reject({
                    status: 400,
                    message: err
                })
            } else {
                reject({
                    message: err.toString()
                })
            }
        }
    })
};

module.exports = {
    checkUserStatus,
    register,
    checkUser,
    userAccessRecord,
    removeAccessRecord
}
