const mongoose = require('mongoose');
const CommonQuestionStatics = require('../statics/CommonStatics');
const Schema = mongoose.Schema;

const now = Date.now();

const UsersSchema = new Schema({
    createTime: {
        type: Number,
        default: now
    },
    anonymousNickname: {
        type: String,
        default: '匿名'
    },
    inviteBy: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    ban: {
        type: Boolean,
        default: false
    },
    unionid: {
        type: String,
        default: ''
    },
    lastLoginTime: {
        type: Number,
        default: now
    },
    loginNumber: {
        type: Number,
        default: 1
    },

    nickName: String,
    avatar: String,
    gender: String,
    region: String,
    systemInfo: Object,
    scene: Number,
    openid: String,

});

UsersSchema.statics = Object.assign({}, CommonQuestionStatics);

module.exports = UsersSchema;

/*
* 注册时间
* 匿名时显示的昵称
* 邀请人
* 注册手机信息
* 手机号
* 是否禁止登陆
* 唯一ID
* 上次登陆时间
* 登陆次数
*
* 昵称
* 头像
* 性别
* 地区
* 注册时的硬件信息
* 注册场景
*
* */