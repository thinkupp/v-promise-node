const AppointModel = require('../model/appoint');

const createAppoint = function ( params ) {
    params.startTime = new Date( params.startTime ).getTime();
    params.endTime = params.startTime + params.effectiveTime * 60 * 1000;
    return AppointModel.$create( params )
};

module.exports = {
    createAppoint
}
