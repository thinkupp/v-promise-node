const router = require('koa-router')();
const fs = require('fs');

router.prefix('/api/upload');


router.get('/', function ( ctx ) {
    ctx.body = 'success'
})

router.post('/image', async function ( ctx ) {
    console.log(ctx.request.files);
    const path = ctx.request.files.image.path;
    console.log('上传图片成功', path);
    const file = fs.statSync(path);
    console.log(file.size);
    ctx.body = {
        image: path
    }
})

module.exports = router
