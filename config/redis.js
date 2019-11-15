const Redis = require('ioredis')
const redis = {
    port: 6379,          // Redis port
    host: '127.0.0.1',   // Redis host
    family: 4,
    db: 0
}
const newRedis = new Redis(redis)
module.exports = newRedis