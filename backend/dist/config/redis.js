"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("./logger"));
let redisClient = null;
// Only create Redis client if queue is enabled
if (process.env.USE_QUEUE === 'true') {
    redisClient = (0, redis_1.createClient)({
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379')
        },
        password: process.env.REDIS_PASSWORD || undefined
    });
    redisClient.on('error', (err) => {
        logger_1.default.error('Redis Client Error:', err);
    });
    redisClient.on('connect', () => {
        logger_1.default.info('✅ Redis connected successfully');
    });
}
const connectRedis = async () => {
    if (process.env.USE_QUEUE === 'true' && redisClient) {
        try {
            await redisClient.connect();
        }
        catch (error) {
            logger_1.default.error('Failed to connect to Redis:', error);
            // Don't exit - queue is optional
        }
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
    }
};
exports.disconnectRedis = disconnectRedis;
exports.default = redisClient;
//# sourceMappingURL=redis.js.map