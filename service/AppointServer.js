const mongoose = require('mongoose');

const AppointModel = require('../model/appoint');
const UsersModel = require('../model/users');
const WatchModel = require('../model/watch');

const BrowseServer = require('./BrowseServer');
const { $update, $findOne, $insert, $findByLimit } = require('../utils/db');


const createAppoint = function ( uid, params ) {
    params.startTime = new Date( params.startTime ).getTime();
    params.endTime = params.startTime + params.effectiveTime * 60 * 1000;
    params.creator = mongoose.Types.ObjectId( uid );
    return AppointModel.$create( params )
};

const getAppointDetail = function ( uid, id ) {
    AppointModel.findById( mongoose.Types.ObjectId( id ) ).populate('users').exec(function ( err, doc ) {
        console.log(err, doc);
    });

    return new Promise(async (resolve, reject) => {
        try {
            const d = await AppointModel.$findById(mongoose.Types.ObjectId( id ));
            const u = await UsersModel.$findById(mongoose.Types.ObjectId( uid ));
            if (d && u) {
                // 访问量自增
                d.accessNumber++;

                const updateData = {$inc: { accessNumber: 1 }};
                const peopleNumberNeed = await BrowseServer.handleBrowseRecord( uid, id );
                if ( peopleNumberNeed ) {
                    updateData.$inc.browsePeopleNumber = 1;
                    d.browsePeopleNumber++;
                }

                await AppointModel.$updateOne({ _id: id }, updateData);

                const watching = await WatchModel.$findOne({userId: uid});
                const detail = JSON.parse(JSON.stringify(d));
                detail.watching = !!watching;
                detail.u = {
                    nickName: u.nickName,
                    avatar: u.avatar,
                    _id: u._id,
                    gender: u.gender,
                };
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
    return $findByLimit('appoint', { id: uid }, null, query)
};

module.exports = {
    createAppoint,
    getAppointDetail,
    getUserCreateAppointList
}
