const router = require('koa-router')();
router.prefix('/api/appoint');
const AppointServer = require('../service/AppointServer');
const UserServer = require('../service/UsersServer');
const GlobalServer = require('../service/GlobalServer');

router.get('/create', async function ( ctx ) {
    try {
        const query = ctx.request.query;
        const uid = ctx.request.header.uid;
        // 查询用户创建
        ctx.body = await AppointServer.getUserCreateAppointList( uid, query );
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.post('/create', async function ( ctx ) {
    const body = ctx.request.body;
    const uid = Number(ctx.request.header.uid);

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
        ctx.body = await AppointServer.getUserJoinAppointList(uid, query);
    } catch (err) {
        ctx.throw(400, err.toString())
    }
})

router.get('/detail/:id', async function ( ctx ) {
    const id = ctx.params.id;
    if (!id) return ctx.throw(400, '错误的ID');
    const uid = Number(ctx.request.header.uid);

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
        ctx.body = await AppointServer.watchAppoint(uid, body.appointId);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

router.post('/support', async function ( ctx ) {
    try {
        const body = ctx.request.body;
        const uid = Number(ctx.request.header.uid);
        ctx.body = await AppointServer.supportAppoint(uid, body);
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.post('/clock-in', async function ( ctx ) {
    try {
        const body = ctx.request.body;
        const uid = Number(ctx.request.header.uid);
        await AppointServer.userClockIn(uid, body);
        ctx.body = {};
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.get('/supporters', async function ( ctx ) {
    try {
        const uid = Number(ctx.request.header.uid);
        const appointId = ctx.request.query.appoint_id;

        ctx.body = await AppointServer.supporters(appointId, 1);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

router.get('/un-supporters', async function ( ctx ) {
    try {
        const uid = Number(ctx.request.header.uid);
        await UserServer.checkUser(uid);
        const appointId = ctx.request.query.appoint_id;

        ctx.body = await AppointServer.supporters(appointId, 0);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

router.post('/tip-off', async function ( ctx ) {
    try {

    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

module.exports = router;
