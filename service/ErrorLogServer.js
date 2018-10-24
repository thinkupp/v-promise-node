const {dbQuery} = require('../utils/db');

const appointErrorLog = {
    // type
    //      0 -> 提前打卡
    //      1 -> 超时打卡
    //      2 -> 重复打卡
    //      3 -> 非创建者打卡
    //      4 ->
    //      5 -> appointId 错误
    //      6 -> 约定不存在
    //      7 -> 约定已被创建者删除

    // 错误的AppointId
    appointIdError: function ({appointId, uid, api}) {
        const des = '检查是否数据未获取到就发起了请求';
        insertLog({
            appointId,
            userId: uid,
            api,
            des,
            type: 5
        })
    },

    // 打卡错误
    clockInError: function ({type, appointId, uid, api, des = '这不是个小BUG'}) {
        // 提前打卡

        // 超时打卡

        // 重复打卡

        // 非创建者打卡
        insertLog({
            type,
            appointId,
            userId: uid,
            api,
            des
        })
    }
};

function insertLog({type, des, api = '', userId, appointId = -1}) {
    dbQuery(`insert into error_log(type, des, api, userId, appointId) VALUES(?, ?, ?, ?, ?)`, [type, des, api, userId, appointId])
}

module.exports = {
    appointErrorLog
}