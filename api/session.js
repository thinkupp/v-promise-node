const request = require('./request');

const fetchSessionKey = function ( appid, secret, code ) {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    return request.get(url);
};

const checkSessionKey = function () {

}

module.exports = {
    fetchSessionKey
}