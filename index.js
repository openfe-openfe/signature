const Koa = require('koa')
const cors = require('koa2-cors')
const app = new Koa()
const router = require('./router/route.js')()
const bodyParse = require('koa-bodyparser')
const { logger, accessLogger } = require('./log');
app.use(cors())
app.use(bodyParse())
app.use(accessLogger())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)