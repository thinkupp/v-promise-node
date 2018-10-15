const AppointModel = require('../model/appoint');
const UsersModel = require('../model/users');
const mongoose = require('mongoose');

const createAppoint = function ( uid, params ) {
    params.startTime = new Date( params.startTime ).getTime();
    params.endTime = params.startTime + params.effectiveTime * 60 * 1000;
    params.creator = mongoose.Types.ObjectId( uid );
    return AppointModel.$create( params )
};

const getAppointDetail = function ( uid, id ) {
    return new Promise(async (resolve, reject) => {
        try {
            const d = await AppointModel.$findById(mongoose.Types.ObjectId( id ));
            const u = await UsersModel.$findById(mongoose.Types.ObjectId( uid ))
            if (d && u) {
                const detail = JSON.parse(JSON.stringify(d))
                detail.u = {
                    nickName: u.nickName,
                    avatar: u.avatar,
                    _id: u._id,
                    gender: u.gender
                }
                resolve(detail)
            }  else {
                if (!d) return reject( '约定不存在' );
                reject( '用户不存在' )
            }
        } catch (err) {
            reject( err );
        }
    })
}

const getUserCreateAppointList = function ( uid, query ) {
    const { startIndex = 0, count = 20 } = query;
    return AppointModel.getCreateAppoint( uid, { startIndex, count } )
};

module.exports = {
    createAppoint,
    getAppointDetail,
    getUserCreateAppointList
}
