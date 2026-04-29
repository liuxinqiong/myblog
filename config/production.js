const { mongodb } = require("./default");

module.exports = {
  port: 8899,
  session: {
    secret: process.env.SESSION_SECRET || "myblog",
    key: process.env.SESSION_KEY || "myblog",
    maxAge: Number(process.env.SESSION_MAX_AGE) || 2592000000,
  },
  redis: {
    port: 6379,
    host: process.env.REDIS_HOST || "localhost",
    password: process.env.REDIS_PASSWORD || null,
  },
  mongodb: process.env.MONGODB_URI || "mongodb://localhost:27017/myblog",
};
