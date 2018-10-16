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
    // 监督者上限
    watcherMax: {
        type: Number,
        default: 0
    },
    // 监督者数量
    watcherNumber: {
        type: Number,
        default: 0
    },
    // 访问量
    accessNumber: {
        type: Number,
        default: 0
    },
    // 浏览人次
    browsePeopleNumber: {
        type: Number,
        default: 0
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
    return new Promise(async (resolve, reject) => {
        try {
            let { startIndex = 0, count = 20 } = query;
            startIndex = Number( startIndex );
            count = Number( count );
            const result = await this.aggregate([
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
                        as: 'u'
                    }
                },
                { $limit: count },
                { $skip: startIndex },
                { $sort: { _id: -1 } }
            ]);

            result.forEach(function ( item ) {
                if (item.u && item.u.length) {
                    item.u = item.u[ 0 ];
                }
            });

            resolve( result )
        } catch (err) {
            reject( err );
        }
    })
}

function getJoinAppoint () {}

module.exports = AppointSchema;
