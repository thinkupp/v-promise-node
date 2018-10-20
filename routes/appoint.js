const router = require('koa-router')();
router.prefix('/api/appoint');
const AppointServer = require('../service/AppointServer');
const UserServer = require('../service/UsersServer');
const GlobalServer = require('../service/GlobalServer');

router.get('/create', async function ( ctx ) {
    try {
        const query = ctx.request.query;
        const uid = ctx.request.header.uid;
        await UserServer.checkUser( uid );
        // 查询用户创建
        ctx.body = await AppointServer.getUserCreateAppointList( uid, query );
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.post('/create', async function ( ctx ) {
    const body = ctx.request.body;
    const uid = Number(ctx.request.header.uid);
    await UserServer.checkUser( uid );

    try {
        const result = await AppointServer.createAppoint( uid, body );
        if (result) return ctx.body = {
            id: result.insertId
        }
        ctx.throw(400, '创建失败')
    } catch (err) {
        console.log(err.errors);
        ctx.throw(400, GlobalServer.handleError(err))
    }
});

router.get('/:id', async function ( ctx ) {
    const id = ctx.params.id;
    if (!id) return ctx.throw(400, '错误的ID');
    const uid = ctx.request.header.uid;
    if (!uid) return ctx.throw(400, '用户信息验证失败');
    const u = UserServer.checkUser( uid );
    if (!u) return ctx.throw(400, '用户信息验证失败');

    try {
        const r = await AppointServer.getAppointDetail( uid, id );
        ctx.body = r;
    } catch (err) {
        ctx.throw(400, GlobalServer.handleError(err))
    }
})

module.exports = router;
