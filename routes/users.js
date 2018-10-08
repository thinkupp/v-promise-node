const router = require('koa-router')()
const UsersServer = require('../service/UsersServer');
router.prefix('/api/users');

router.get('/', function ( ctx ) {
    const userData = ctx.body;
    ctx.body = {
      name: 'test'
    }
});

router.post('/login', async function ( ctx ) {
    const body = ctx.request.body;

    try {
        const result = await UsersServer.checkUserStatus( body.code, body.loginStatus );

        if (result) {
            ctx.body = {
                ban: result.ban
            };
        } else {
            ctx.body = {
                register: true
            }
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
        console.log(result, 'register result');
        ctx.body = {
            u: result
        }
    } catch (err) {
        console.log(err, 'register error');
        ctx.throw( 400, err )
    }
});

router.post('/avatar', async function ( ctx ) {
    console.log(ctx.request.files.path);

    ctx.body = 'success'
})

module.exports = router
