const AppointModel = require('../model/appoint');

const createAppoint = function ( params ) {
    params.startTime = new Date( params.startTime ).getTime();
    params.endTime = params.startTime + params.effectiveTime * 60 * 1000;
    return AppointModel.$create( params )
};

const getAppoint = function ( uid, query ) {
    const getQuery = { creator: uid };
    const { startIndex = 0, count = 20 } = query;
    return AppointModel.$find( getQuery, startIndex, count )
};

module.exports = {
    createAppoint,
    getAppoint
}
