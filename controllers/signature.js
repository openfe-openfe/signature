const fetch = require('node-fetch')
const sha1 = require('sha1')
const { logger } = require('../log')
const redis = require("../config/redis")

exports.getAccessToken = async (ctx,next) => {
  let cache = await redis.get('access_token').then(function (result) {
     return result
  })
  logger.info(`access_token缓存数据\n${cache}`)
  if(cache) {
    ctx.state.accesstoken = cache
    // 直接执行获取票据接口
    await next()
  }else {
    // 缓存过期才会重新获取token
    console.log('过期了')
    let data = await fetch('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx392eafbf2ac8672d&secret=505c74753d40a4195f6a9e873bd0cf38')
      .then(res => res.json())
      .then(json => {
        return json
    })
    if(data.access_token) {
      let token = data.access_token
      ctx.state.accesstoken = token
      redis.set('access_token', token)
      // 执行下一个中间件
      await next()
    }else {
      ctx.body = {
        errorCode:json.errcode,
        errorMsg: json.errmsg
      }
    }
  }
}

exports.getTicket = async (ctx,next) => {
  // console.log('进入下一个中间件了')
  let noncestr = 'Wm3WZYTPz0wzccnW'
  let timestamp = new Date().getTime()
  let url = 'http://www.openfe.cn/test/index.html'
  // 获取存储的票据ticket
  let cache = await redis.get('jsapi_ticket').then(function (result) {
    return result
  }) 
  if(cache) {
    let jsapi_ticket = cache
    let signature = sha1(`jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`)
    let json = {
      errorCode: 0,
      errorMsg:'获取成功'
    }
    json.noncestr = noncestr
    json.timestamp = timestamp
    json.signature = signature
    ctx.body = json
  }else{
     // 获取上一个中间件存储的accessToken,并换取ticket票据
    let data = await fetch(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${ctx.state.accesstoken}&type=jsapi`)
    .then(res => res.json())
    .then(res => {
      if(res.errcode === 0) {
        // 继续存储ticket
        redis.set('jsapi_ticket', res.ticket)
        let jsapi_ticket = res.ticket
        let signature = sha1(`jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`)
        let json = {
          errorCode: 0,
          errorMsg:'获取成功'
        }
        json.noncestr = noncestr
        json.timestamp = timestamp
        json.signature = signature
        return json
    }else {
      return {
        errorCode:res.errcode,
        errorMsg: res.errmsg
      }
    }
    });
    ctx.body = data
  }
}