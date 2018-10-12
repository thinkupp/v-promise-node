const router = require('koa-router')();
router.prefix('/api/appoint');
const AppointServer = require('../service/AppointServer');
const UserServer = require('../service/UsersServer');

router.get('/create', async function ( ctx ) {
    try {
        const query = ctx.request.query;
        const uid = ctx.request.header.uid;
        const u = await UserServer.checkUser( uid );
        if ( !u ) return ctx.throw(400, '用户信息验证失败');
        // 查询用户创建
        ctx.body = await AppointServer.getAppoint( uid, query );
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.post('/create', async function ( ctx ) {
    const body = ctx.request.body;
    const uid = ctx.request.header.uid;
    const u = await UserServer.checkUser( uid );
    if ( !u ) return ctx.throw(400, '用户信息验证失败');

    try {
        const result = await AppointServer.createAppoint( uid, body );
        if (result) return ctx.body = result;
        ctx.throw(400, '创建失败')
    } catch (err) {
        console.log(err.errors);
        ctx.throw(400, JSON.stringify(err))
    }
});



module.exports = router;