const router = require('koa-router')()
const UsersServer = require('../service/UsersServer');
const CommentServer = require('../service/CommentServer');
router.prefix('/api/comment');

router.post('/', async function ( ctx ) {
    try {
        const body = ctx.request.body;
        const uid = ctx.request.header.uid;
        ctx.body = await CommentServer.publishComment(uid, body);
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.get('/:id', async function ( ctx ) {
    try {
        const appointId = ctx.params.id;
        if (!appointId) return ctx.throw(400, '错误的ID');
        const uid = ctx.request.header.uid;
        const query = ctx.request.query;
        ctx.body = await CommentServer.getAppointComments(uid, appointId, query);
    } catch (err) {
        ctx.throw(400, err.toString())
    }
});

router.post('/like', async function ( ctx ) {
    try {
        const uid = ctx.request.header.uid;
        const body = ctx.request.body;
        ctx.body = await CommentServer.commentLike(uid, body);

    } catch (err) {
        ctx.throw(400, err.toString())
    }
})

module.exports = router;
