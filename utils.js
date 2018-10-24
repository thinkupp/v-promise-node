const getCurrentTime = function ( time ) {
    if (time) {
        return parseInt((new Date(time).getTime() / 1000))
    }

    return parseInt(Date.now() / 1000)
};

function handleNumber( number ) {
    if (number < 10) return `0${number}`;

    return number;
}

const formatTime = function ( time ) {
    time = new Date(time);
    const year = time.getFullYear();
    const month = handleNumber(time.getMonth() + 1);
    const day = handleNumber(time.getDate());

    const hours = handleNumber(time.getHours());
    const minutes = handleNumber(time.getMinutes());
    const seconds = handleNumber(time.getSeconds());

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

const calcTime = function( time1, time2 ) {
    const time = time2 - time1;
    return time / 3600000 + '小时';
}

module.exports = {
    getCurrentTime,
    formatTime,
    calcTime
}