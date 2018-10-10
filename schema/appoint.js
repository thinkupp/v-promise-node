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
    private: Boolean,       //
    effectiveTime: Number,
    autoCreate: String,
    type: String,
    creator: String,        // 创建者
});

AppointSchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = AppointSchema;
