const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const path = require('path');
const UserServer = require('./service/UsersServer');

const koaBody = require('koa-body');
app.use(koaBody({
    multipart: true,
    formidable:{
        uploadDir:path.join(__dirname, 'uploads/'), // 设置文件上传目录
        keepExtensions: true,    // 保持文件的后缀
        maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
        onFileBegin:(name,file) => { // 文件上传前的设置
            // console.log(`name: ${name}`);
            // console.log(file);
        },
    }
}))

// error handler
onerror(app)

/*
* 自定义方法：计算约定状态
* */
Object.prototype.calcAppointStatus = function () {
    this.startTime *= 1000;
    this.endTime *= 1000;
    // 0 -> 未开始 1 -> 进行中 2 -> 已结束 3 -> 按时完成 4 -> 超时完成
    if (this.finishTime) {
        this.finishTime *= 1000;
        this.status = this.finishTime > this.endTime ? 4 : 3;
    } else {
        const currentTime = Date.now();
        this.status = currentTime < this.startTime ? 0 : currentTime > this.endTime ? 2 : 1;
    }
};

/*
* 处理用户信息
* */
Object.prototype.handleUserInfo = function ( handleU = true ) {
    this.onlookers = !!this.onlookers;
    this.private = !!this.private;

    if (handleU) {
        this.u = {
            nickName: this.nickname,
            avatar: this.avatar,
            gender: this.gender
        };

        delete this.nickName;
        delete this.avatar;
        delete this.gender;
        delete this.deleted;
        delete this.updateTime;
    }
};

/*
* 用户信息合并、相关类型转换、状态判断
* */
Object.prototype.handleAppointData = function handleAppointData( handleU = true ) {
    this.forEach(item => {
        item.handleUserInfo( handleU );
        item.calcAppointStatus();
    })
};

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    try {
        const noAuth = ['/api/users/login'];
        if (noAuth.includes(ctx.url)) {
            return await next()
        }
        await UserServer.checkUser(ctx.request.header.uid);
        ctx.request.header.uid = Number(ctx.request.header.uid);
        await next()
    } catch (err) {
        ctx.response.status = err.statusCode || err.status || 500;
        ctx.response.body = err.message
    }
})

// error-handling
app.on('error', (err, ctx) => {
    console.log(err, ctx);
});

const index = require('./routes/index');
const users = require('./routes/users');
const upload = require('./routes/upload');
const appoint = require('./routes/appoint');
const comment = require('./routes/comment');
// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(upload.routes(), upload.allowedMethods());
app.use(appoint.routes(), appoint.allowedMethods());
app.use(comment.routes(), comment.allowedMethods());

module.exports = app
