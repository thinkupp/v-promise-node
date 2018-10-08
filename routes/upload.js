const router = require('koa-router')();
const fs = require('fs');

router.prefix('/api/upload');


router.get('/', function ( ctx ) {
    ctx.body = 'success'
})

router.post('/avatar', async function ( ctx ) {
    console.log('上传图片成功', ctx.request.files.file.path);
    const file = fs.statSync(ctx.request.files.file.path);
    console.log(file.size);
    ctx.body = {
        code: 200,
        message: 'success'
    }
})

module.exports = router
