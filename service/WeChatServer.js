const getWeChatInfo = function () {
    return {
        appid: 'wx79ad98ff036bd661',
        secret: '3c17a6cf762e28db59b9054bd80f3341'
    }
};

const crypto = require('crypto')

const decryptData = function (appId, sK, encryptedData, iv) {
    // base64 decode
    const sessionKey = new Buffer(sK, 'base64');
    encryptedData = new Buffer(encryptedData, 'base64');
    iv = new Buffer(iv, 'base64');
    let decoded;
    try {
        // 解密
        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true)
        decoded = decipher.update(encryptedData, 'binary', 'utf8')
        decoded += decipher.final('utf8')

        decoded = JSON.parse(decoded)

    } catch (err) {
        throw new Error('Illegal Buffer')
    }

    if (decoded.watermark.appid !== appId) {
        throw new Error('Illegal Buffer')
    }

    return decoded
}

module.exports = {
    getWeChatInfo,
    decryptData
}
