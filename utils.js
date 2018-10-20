const getCurrentTime = function ( time ) {
    if (time) {
        return parseInt((new Date(time).getTime() / 1000))
    }

    return parseInt(Date.now() / 1000)
};

module.exports = {
    getCurrentTime
}