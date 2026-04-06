const Bull = require("bull");
const Redis = require("ioredis");
require("dotenv").config();

// Create separate Redis client instances
const redisClient = new Redis({ // For your app's use (if needed)
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: false,
  connectTimeOut: 10000
  // maxRetriesPerRequest: null
});

const bullRedisClient = new Redis({ // Specifically for Bull
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: false,
  connectTimeOut: 10000
  // maxRetriesPerRequest: null
});

// --- CONNECTION STATUS LOGGING ---

bullRedisClient.on("connect", () => {
  console.log("✅ Redis connection established for Bull");
});

bullRedisClient.on("ready", () => {
  console.log("🚀 Redis is ready and accepting commands");
});

bullRedisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

bullRedisClient.on("close", () => {
  console.warn("⚠️ Redis connection closed");
});

bullRedisClient.on("reconnecting", (delay) => {
  console.log(`🔄 Reconnecting to Redis in ${delay}ms...`);
});


// Define your job queues - Use bullRedisClient here
const eventQueue = new Bull("event", { redis: bullRedisClient });
// ... (rest of your code: checkConnection, setupQueueListeners, initQueues)

module.exports = {
  redisClient, // Export the main Redis client (if your application needs it)
  eventQueue
};