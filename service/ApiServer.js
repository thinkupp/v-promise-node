const ApiSession = require('../api/session');

const fetchSessionKey = function ( appid, secret, code ) {
    if ( !appid || !secret || !code ) return Promise.reject('参数不完整');
    return ApiSession.fetchSessionKey( ...arguments );
};

module.exports = {
    fetchSessionKey
}