const router = require('koa-router')()
const UsersServer = require('../service/UsersServer');
router.prefix('/api/users');

router.post('/login', async function ( ctx ) {
    const body = ctx.request.body;

    try {
        const result = await UsersServer.checkUserStatus( body.code, body.loginStatus );

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
        const body = ctx.request.body;
        const result = await UsersServer.register( body );
        if ( !result ) ctx.throw( 400, '注册失败' );

        ctx.body = {}
    } catch (err) {
        console.log(err, 'register error');
        ctx.throw( 400, err )
    }
});

module.exports = router
