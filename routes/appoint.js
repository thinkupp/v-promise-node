const router = require('koa-router')();
router.prefix('/api/appoint');
const AppointServer = require('../service/AppointServer');
const UserServer = require('../service/UsersServer');

router.post('/', async function ( ctx ) {
    const body = ctx.request.body;
    const uid = ctx.request.header.uid;
    if (!uid) return ctx.throw(400, '用户信息验证失败');
    const u = UserServer.checkUser( uid );
    if (!u) return ctx.throw(400, '用户信息验证失败');

    try {
        body.creator = uid;
        const result = await AppointServer.createAppoint( body );
        if (result) return ctx.body = result;
        ctx.throw(400, '创建失败')
    } catch (err) {
        console.log(err.errors);
        ctx.throw(400, JSON.stringify(err))
    }
});

module.exports = router;