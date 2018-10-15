const handleError = function ( err ) {
    if (typeof err === 'string') return err;
    return JSON.stringify(err)
}

module.exports = {
    handleError
}