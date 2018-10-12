const CommonStatics = (function() {
    /*
    * 增
    * */
    const $create = function( data ) {
        const that = this;

        return new Promise((resolve, reject) => {
            const createData = new that( data );
            createData.save(function( err, result ) {
                if( err ) return reject( err );
                resolve( result );
            })
        })
    };

    /*
    * 删
    * */
    const $remove = function( query ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.remove(query, function( err, result ) {
                if( err ) return reject( err );
                const removeResult = result.ok === 1 && result.n > 0;
                resolve( removeResult )
            })
        })
    };

    const $deleteOne = function ( query ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.deleteOne(query, function ( err, result ) {
                if ( err ) return reject(err);
                const deleteResult = result.ok === 1 && result.n === 1;
                resolve( deleteResult );
            })
        })
    }

    /*
    * 改
    * */
    const $updateOne = function( query, data ) {
        const that = this;
        return new Promise((resolve, reject) => {
            that.updateOne(query, data, function( err, result ) {
                if( err ) return reject( err );
                const updateResult = result.ok === 1 && result.n > 0;
                resolve( updateResult );
            })
        })
    };

    /*
    * 查
    * */
    const $find = function( { query = {}, startIndex, count, sort = { _id: -1 }, field = {} } ) {
        if (typeof startIndex === 'string') startIndex = Number( startIndex );
        if (typeof count === 'string') count = Number( count );
        const that = this;
        return new Promise((resolve, reject) => {
            that.find( query, field ).skip( startIndex ).limit( count ).sort( sort ).exec(function( err, result ) {
                if( err ) return reject( err );
                resolve( result );
            })
        })
    };

    /*
    * 查指定 根据ID
    * */
    const $findById = function( id ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.findById(id, function( err, result ) {
                if( err ) return reject( err );
                resolve( result );
            })
        })
    };

    /*
    * 查指定 根据某条件
    * */
    const $findOne = function( query, field ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.findOne(query, field, function( err, result ) {
                if( err ) return reject( err );
                resolve( result );
            })
        })
    };

    /*
    * 总数
    * */
    const $count = function( query ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.count(query, function( err, count ) {
                if( err ) return reject( err );
                resolve( count )
            })
        })
    };

    /*
    * 直接删 一条
    * */
    const $findByIdAndDelete = function( id ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.findByIdAndDelete(id, function( err, result ) {
                if( !err ) return reject( err );
                resolve( result );
            })
        })
    };

    /*
    * 直接改 一条
    * */
    const $findByIdAndUpdate = function( id, data ) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.findByIdAndUpdate(id, data, function( err, result ) {
                if( err ) return reject( err );
                resolve( result );
            })
        })
    };

    /*
    *
    * */
    const $bulkWrite = function( array ) {
        const that = this;

        return new Promise((resolve, reject) => {
            resolve(that.bulkWrite( array ))
        })
    };

    return {
        $create,
        $remove,
        $deleteOne,
        $updateOne,
        $find,
        $findById,
        $findOne,
        $count,
        $bulkWrite,
        $findByIdAndDelete,
        $findByIdAndUpdate
    }
})();

module.exports = CommonStatics;