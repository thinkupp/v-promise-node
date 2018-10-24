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
    //      8 -> 获取约定错误
    //      9 -> 监督者监督自己的约定
    //      10 -> 约定重复监督
    //      11 -> 约定开始时间未到
    //      12 -> 约定时间已过或创建者已完成约定

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
    },

    watchError: function ({type, api, appointId, uid, des}) {
        // 创建者监督自己约定
        // 重复监督
        // 时间未到
        // 已经结束
        insertLog({
            appointId,
            userId: uid,
            api,
            des,
            type
        })
    },

    // 获取约定错误
    fetchAppointDetailError: function ({type = 8, api, uid, appointId, des}) {
        insertLog({
            type,
            api,
            userId: uid,
            appointId,
            des
        })
    },
};

function insertLog({type, des, api = '', userId, appointId = -1}) {
    try {
        dbQuery(`insert into error_log(type, des, api, userId, appointId) VALUES(?, ?, ?, ?, ?)`, [type, des, api, userId, appointId])
    } catch (err) {
        console.log('上传错误数据时发生错误' + err);
        log.error('上传错误数据时发生错误' + err);
    }
}

module.exports = {
    appointErrorLog
}