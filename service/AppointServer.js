const mongoose = require('mongoose');

const AppointModel = require('../model/appoint');
const UsersModel = require('../model/users');
const WatchModel = require('../model/watch');

const BrowseServer = require('./BrowseServer');
const { dbQuery, $update, $findOne, $insert, $findAppointByLimit } = require('../utils/db');

const createAppoint = function ( uid, params ) {
    params.startTime = parseInt(new Date( params.startTime ).getTime() / 1000);
    params.endTime = parseInt((new Date( params.startTime ).getTime() + params.effectiveTime * 60 * 1000) / 1000);
    params.creatorId = uid;
    // return AppointModel.$create( params )
    return $insert('appoint', params);
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