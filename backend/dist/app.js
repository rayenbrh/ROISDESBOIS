"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Middleware
const errorHandler_1 = require("./middleware/errorHandler");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const subProduct_routes_1 = __importDefault(require("./routes/subProduct.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const auditLog_routes_1 = __importDefault(require("./routes/auditLog.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
// Logger
const logger_1 = __importDefault(require("./config/logger"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use('/api/', limiter);
// Body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Compression
app.use((0, compression_1.default)());
// HTTP request logger
if (process.env.NODE_ENV !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => logger_1.default.info(message.trim())
        }
    }));
}
// Serve static files (uploads)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin/users', user_routes_1.default);
app.use('/api/admin/categories', category_routes_1.default);
app.use('/api/admin/subproducts', subProduct_routes_1.default);
app.use('/api/admin/products', product_routes_1.default);
app.use('/api/admin/orders', order_routes_1.default);
app.use('/api/admin/invoices', invoice_routes_1.default);
app.use('/api/admin/analytics', analytics_routes_1.default);
app.use('/api/admin/settings', settings_routes_1.default);
app.use('/api/admin/auditlogs', auditLog_routes_1.default);
app.use('/api/admin/uploads', upload_routes_1.default);
// Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Les Rois des Bois API',
            version: '1.0.0',
            description: 'Admin Dashboard API for Les Rois des Bois',
            contact: {
                name: 'Les Rois des Bois'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map