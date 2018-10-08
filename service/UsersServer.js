const UsersModel = require('../model/users');
const SessionKeyModel = require('../model/session-key');
const GlobalModel = require('../model/global');
const WeChatServer = require('./WeChatServer');
const ApiServer = require('./ApiServer');

const checkUserStatus = function ( code, loginStatus ) {
    const { appid, secret } = WeChatServer.getWeChatInfo();

    return new Promise(async (resolve, reject) => {
        try {
            const result = await ApiServer.fetchSessionKey( appid, secret, code );
            const { session_key, openid, unionid } = result;
            // const query = unionid ? {
            //     unionid
            // } : {
            //     openid
            // };
            const query = { openid };

            const g = await GlobalModel.findOne();

            let name = '$create';
            if (g) {
                name = '$updateOne';
                const updateData = {
                    lastLoginTime: Date.now()
                };

                if ( !loginStatus ) {
                    updateData['$inc'] = {
                        loginNumber: 1
                    }
                }

                await UsersModel.$updateOne(query, updateData)
            }

            GlobalModel[name] ({}, {
                sessionKey: session_key
            });

            return resolve(UsersModel.$findOne(query))
        } catch (err) {
            console.log(err, 'checkout status error');
            reject( err )
        }
    })
};

const register = function ( data ) {
    return new Promise(async (resolve, reject) => {
        try {
            const about = WeChatServer.getWeChatInfo();
            const { encryptedData, iv } = data.detail;
            let sessionKey = await GlobalModel.findOne({});
            sessionKey = sessionKey.sessionKey;
            const userInfo = await WeChatServer.decryptData( about.appid, sessionKey, encryptedData, iv );
            return resolve(UsersModel.$create({
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                avatar: userInfo.avatar,
                systemInfo: data.systemInfo,
                region: `${userInfo.country} ${userInfo.province } ${userInfo.city}`,
                scene: data.scene,
                openid: userInfo.openId,
                unionid: userInfo.unionid
            }))
        } catch (err) {
            reject (err);
        }
    })
}

module.exports = {
    checkUserStatus,
    register
}
