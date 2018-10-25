const router = require('koa-router')()
const UsersServer = require('../service/UsersServer');
router.prefix('/api/users');

router.post('/login', async function ( ctx ) {
    const body = ctx.request.body;

    try {
        const result = await UsersServer.checkUserStatus( body.code, body.loginStatus, ctx.request.header.host );

        if (result) {
            ctx.body = result;
        } else {
            ctx.body = {}
        }
    } catch (err) {
        console.log(err, 'err');
        ctx.throw( 400, err )
    }
});

router.post('/register', async function ( ctx ) {
    try {
        const uid = ctx.request.header.uid;
        await UsersServer.checkUser( uid );
        const body = ctx.request.body;

        ctx.body = await UsersServer.register( uid, body );
    } catch (err) {
        console.log(err, 'register error');
        ctx.throw( 400, err )
    }
});

router.post('/access-record', async function ( ctx ) {
    try {
        const uid = Number(ctx.request.header.uid);
        await UsersServer.checkUser(uid);
        const body = ctx.request.body;
        ctx.body = await UsersServer.userAccessRecord(uid, body);
    } catch (err) {
        ctx.throw(400, err.toString());
    }
});

module.exports = router;
