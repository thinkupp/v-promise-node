const AppointModel = require('../model/appoint');
const mongoose = require('mongoose');

const createAppoint = function ( uid, params ) {
    params.startTime = new Date( params.startTime ).getTime();
    params.endTime = params.startTime + params.effectiveTime * 60 * 1000;
    params.creator = mongoose.Types.ObjectId( uid );
    return AppointModel.$create( params )
};

const getAppoint = function ( uid, query ) {
    const { startIndex = 0, count = 20 } = query;
    return AppointModel.getCreateAppoint( uid, { startIndex, count } )
};

module.exports = {
    createAppoint,
    getAppoint
}
