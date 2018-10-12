const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const AppointSchema = new Schema({
    createTime: {
        type: Number,
        default: Date.now()
    },
    updateTime: {
        type: Number,
        default: Date.now()
    },
    images: {
        type: Array,
        default: []
    },

    startTime: Number,
    endTime: Number,
    onlookers: Boolean,     // 是否允许围观
    private: Boolean,
    effectiveTime: Number,
    autoCreate: String,
    type: String,
    creator: Schema.Types.ObjectId,        // 创建者
    desc: String,           // 描述
});

AppointSchema.statics = Object.assign({
    getCreateAppoint,
    getJoinAppoint
}, CommonQuestionStatics);

async function getCreateAppoint( uid, query = {} ) {
    return new Promise((resolve, reject) => {
        try {
            let { startIndex = 0, count = 20 } = query;
            startIndex = Number( startIndex );
            count = Number( count );

            this.aggregate([
                {
                    $match: {
                        creator: mongoose.Types.ObjectId( uid )
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creator',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $limit: count
                },
                {
                    $skip: startIndex
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ])
        } catch (err) {

        }
    })
}

function getJoinAppoint () {}

module.exports = AppointSchema;

/*
*             this.aggregate([
                {
                    $match: {
                        creator: mongoose.Types.ObjectId( uid )
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creator',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $limit: count
                },
                {
                    $skip: startIndex
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ])

* */