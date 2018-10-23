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
        };
        ctx.throw(400, '创建失败')
    } catch (err) {
        console.log(err.errors);
        ctx.throw(400, GlobalServer.handleError(err))
    }
});

router.get('/join', async function ( ctx ) {
    try {
        const query = ctx.request.query;
        const uid = Number(ctx.request.header.uid);
        await UserServer.checkUser(uid);

        const result = await AppointServer.getUserJoinAppointList(uid, query);
        ctx.body = result;
    } catch (err) {
        ctx.throw(400, err.toString())
    }
})

router.get('/:id', async function ( ctx ) {
    const id = ctx.params.id;
    if (!id) return ctx.throw(400, '错误的ID');
    const uid = Number(ctx.request.header.uid);
    await UserServer.checkUser( uid );

    try {
        const r = await AppointServer.getAppointDetail( uid, id );
        ctx.body = r;
    } catch (err) {
        ctx.throw(400, GlobalServer.handleError(err))
    }
});

router.post('/watch', async function ( ctx ) {
    const body = ctx.request.body;
    const uid = Number(ctx.request.header.uid);
    try {
        await UserServer.checkUser(uid);
        const result = await AppointServer.watchAppoint(uid, body.appointId);
        ctx.body = result;
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

router.post('/support', async function ( ctx ) {
    try {
        const body = ctx.request.body;
        const uid = Number(ctx.request.header.uid);
        await UserServer.checkUser(uid);

        ctx.body = await AppointServer.supportAppoint(uid, body);
    } catch (err) {
        ctx.throw(400, err.toString())
    }

});

module.exports = router;
