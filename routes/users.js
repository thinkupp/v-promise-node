const router = require('koa-router')()
const UsersServer = require('../service/UsersServer');
router.prefix('/api/users');

router.post('/login', async function ( ctx ) {
    try {
        ctx.body = await UsersServer.checkUserStatus(ctx.request.body)
    } catch (err) {
        ctx.throw( 400, err.toString() )
    }
});

router.post('/register', async function ( ctx ) {
    try {
        const uid = ctx.request.header.uid;
        const body = ctx.request.body;
        ctx.body = await UsersServer.register( uid, body );
    } catch (err) {
        ctx.throw( 400, err.toString() )
    }
});

router.post('/access-record', async function ( ctx ) {
    try {
        const uid = Number(ctx.request.header.uid);
        const body = ctx.request.body;
        ctx.body = await UsersServer.userAccessRecord(uid, body);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

router.delete('/access-record', async function ( ctx ) {
    try {
        const { access_record_id } = ctx.request.body;
        ctx.body = await UsersServer.removeAccessRecord( access_record_id );

    } catch (err) {
        ctx.throw(400, err.toString());
    }
})

router.post('/feedback', async function ( ctx ) {
		try {
				const uid = ctx.request.header.uid;
				ctx.body = await UsersServer.feedback( uid, ctx.request.body );
		} catch (err) {
				ctx.throw(400, err.toString());
		}
})

module.exports = router;
