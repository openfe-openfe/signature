const Router = require('koa-router')
const app = require('../controllers/signature')
module.exports = () => {
  const router = new Router({
    prefix: '/apis'
  })
  router.get('/accessToken',app.getAccessToken,app.getTicket)
  return router
}