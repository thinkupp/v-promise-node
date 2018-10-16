const BrowseModel = require('../model/browse');

const handleBrowseRecord = function ( uid, appointId ) {
    return new Promise(async (resolve, reject) => {
        try {
            const record = await BrowseModel.$findOne({browsePeopleId: uid, appointId});
            if ( !record ) {
                await BrowseModel.$create({
                    appointId,
                    browsePeopleId: uid
                });
                resolve( true );        // 人次自增1
            } else {
                resolve( false );       // 人次不需自增
            }
        } catch (err) {
            reject(err)
        }
    })
};

module.exports = {
    handleBrowseRecord
}