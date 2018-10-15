const AppointModel = require('../model/appoint');
const mongoose = require('mongoose');

const createAppoint = function ( params ) {
    params.startTime = new Date( params.startTime ).getTime();
    params.endTime = params.startTime + params.effectiveTime * 60 * 1000;
    return AppointModel.$create( params )
};

const getAppointDetail = function ( id ) {
    return AppointModel.$findById(mongoose.Types.ObjectId( id ));
}

module.exports = {
    createAppoint,
    getAppointDetail
}
