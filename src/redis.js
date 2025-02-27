const { createClient } = require("redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const IoRedis = require("ioredis");
const config = require("../config/config.json");

module.exports = async function (app) {
  const redisConf = app.get("redis"),
    client = createClient({
      socket: {
        host: redisConf.host,
      },
    });

  await client.connect().catch((e) => console.error(e));

  app.set("redisClient", client);

  const rateLimiterRedisClient = new IoRedis(
    redisConf.useSocket
      ? { enableOfflineQueue: false, path: redisConf.path }
      : { enableOfflineQueue: false, host: redisConf.host }
  );

  app.set("rateLimiterRedisClient", rateLimiterRedisClient);

  const rateLimiter = new RateLimiterRedis({
    storeClient: rateLimiterRedisClient,
    keyPrefix: "middleware",
    points: 20,
    duration: 5,
  });

  app.set("rateLimiter", rateLimiter);
};
