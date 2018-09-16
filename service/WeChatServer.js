const getWeChatInfo = function () {
    return {
        appid: 'wx5673da08b2521198',
        secret: 'bce6ebe8ba083ef9ff4eacfed8b55a3e'
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