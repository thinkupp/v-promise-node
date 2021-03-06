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

router.post('/detail', async function ( ctx ) {
    // const id = ctx.params.id;
    const body = ctx.request.body;
    if (!body.appointId) return ctx.throw(400, '错误的ID');
    const uid = ctx.request.header.uid;

    try {
        const r = await AppointServer.getAppointDetail( uid, body );
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

/*
* 支持
* */
router.get('/supporters', async function ( ctx ) {
    try {
        const uid = Number(ctx.request.header.uid);
        const appointId = ctx.request.query.appoint_id;

        ctx.body = await AppointServer.supporters(appointId, 1);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

/*
* 取消支持
* */
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

/*
* 举报
* */
router.post('/tip-off', async function ( ctx ) {
    try {

    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

/*
* 大厅列表
* */
router.post('/all', async function ( ctx ) {
    try {
        ctx.body = await AppointServer.allAppoint(ctx.request.header.uid, ctx.request.body);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
})

/*
* 更新约定
*/
router.put('/create', async function ( ctx ) {
	try {
		ctx.body = await AppointServer.updateAppoint(ctx.request.header.uid, ctx.request.body);
	} catch (err) {
		ctx.throw(400, err.toString());
	}
});

/*
 * 查找监督者
 * */
router.post('/watcher/:id', async function ( ctx ) {
    try {
        const appointId = ctx.params.id;
        const body = ctx.request.body;
        ctx.body = await AppointServer.fetchWatcher(appointId, body);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
})

module.exports = router;
