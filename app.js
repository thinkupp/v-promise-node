const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const StartServer = require('./service/StartServer');
const path = require('path');

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
// const session = require('koa-session');

StartServer.clientDB();

// app.keys = ['www.vvipo.cn/session'];
// const SESSION_CONFIG = {
//     key: 'koa:sess',    // cookie key
//     maxAge: 86400000,   // cookie的过期时间
// };
// app.use(session(SESSION_CONFIG, app));

// error handler
onerror(app)

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
// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(upload.routes(), upload.allowedMethods());

module.exports = app
