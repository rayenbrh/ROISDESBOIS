"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = __importDefault(require("./config/logger"));
const PORT = process.env.PORT || 5000;
/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Connect to Redis (optional - for queue)
        if (process.env.USE_QUEUE === 'true') {
            await (0, redis_1.connectRedis)();
        }
        // Start HTTP server
        const server = app_1.default.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT}`);
            logger_1.default.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            logger_1.default.info(`🏥 Health check: http://localhost:${PORT}/health`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger_1.default.info(`${signal} received, closing server gracefully...`);
            server.close(async () => {
                logger_1.default.info('HTTP server closed');
                try {
                    const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
                    await mongoose.connection.close();
                    logger_1.default.info('Database connection closed');
                    if (process.env.USE_QUEUE === 'true') {
                        const { disconnectRedis } = await Promise.resolve().then(() => __importStar(require('./config/redis')));
                        await disconnectRedis();
                        logger_1.default.info('Redis connection closed');
                    }
                    process.exit(0);
                }
                catch (error) {
                    logger_1.default.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });
            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger_1.default.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map