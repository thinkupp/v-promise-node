const UsersModel = require('../model/users');
const SessionKeyModel = require('../model/session-key');
const GlobalModel = require('../model/global');
const WeChatServer = require('./WeChatServer');
const ApiServer = require('./ApiServer');
const mongoose = require('mongoose');
const db = require('../utils/db');
const uuid = require('node-uuid');

function initUser ( openid, uid ) {
    return db.query('insert into users (openid, uid) VALUES (?, ?)', [ openid, uid ]);
}

const checkUserStatus = function ( code, loginStatus, ip ) {
    const { appid, secret } = WeChatServer.getWeChatInfo();

    return new Promise(async (resolve, reject) => {
        try {
            const result = await ApiServer.fetchSessionKey( appid, secret, code );
            if (result.errmsg && result.errcode) return reject( result.errmsg );

            const { session_key, openid } = result;
            const query = { openid };

            // 用户是否存在
            let u = await db.query('select openid from users where openid = ?', [ openid ]);
            if ( u.length ) {
                u = u[0];
                console.log(u);
            } else {
                // 用户不存在，根据openid、uid初始化用户
                const uid = uuid.vi().replace('-', '');
                await initUser( openid, uid );
                u = {
                    uid,
                    ban: false
                }
            }

            resolve({
                ban: u.ban,
                regStatus: !!u.registerTime,
                uid: u.uid
            });
            // let u = await UsersModel.findOne( query );
            // const sk = await SessionKeyModel.findOne( query );

            // const sessionKeyData = {
            //     sessionKey: session_key,
            //     openid
            // };
            //
            // if (u && u.registerTime) {
            //     const updateData = { lastLoginTime: Date.now() };
            //
            //     if ( !loginStatus ) {
            //         updateData['$inc'] = { loginNumber: 1 }
            //     }
            //
            //     await UsersModel.$updateOne( query, updateData );
            // } else {
            //     if (!u) {
            //         u = await UsersModel.$create(query);
            //     }
            // }
            //
            // const returnObj = {};
            // returnObj.id = u._id;
            // returnObj.ban = u.ban;
            // returnObj.regStatus = !!u.registerTime;
            //
            // if (sk) {
            //     await SessionKeyModel.$updateOne( query, sessionKeyData );
            // } else {
            //     await SessionKeyModel.$create ( sessionKeyData );
            // }
// sequel pro encountered an unexpected error
            return resolve( returnObj )
        } catch (err) {
            reject( err )
        }
    })
};

const register = function ( data ) {
    return new Promise(async (resolve, reject) => {
        try {
            const _id = data.id;
            if (!_id) return reject( 'error register id' );

            delete data.id;
            const about = WeChatServer.getWeChatInfo();
            const { encryptedData, iv } = data.detail;
            let sessionKey = await SessionKeyModel.findOne();
            sessionKey = sessionKey.sessionKey;
            if (!sessionKey) return reject( 'session key error' );

            const userInfo = await WeChatServer.decryptData( about.appid, sessionKey, encryptedData, iv );
            return resolve(UsersModel.$updateOne({ _id }, {
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                avatar: userInfo.avatarUrl,
                systemInfo: data.systemInfo,
                region: `${userInfo.country} ${userInfo.province } ${userInfo.city}`,
                scene: data.scene,
                openid: userInfo.openId,
                unionid: userInfo.unionid,
                registerTime: Date.now()
            }))
        } catch (err) {
            reject (err);
        }
    })
};

const checkUser = function ( uid ) {
    if (!uid) return Promise.reject('用户不存在');
    return UsersModel.$findById( mongoose.Types.ObjectId( uid ) );
}

module.exports = {
    checkUserStatus,
    register,
    checkUser
}
