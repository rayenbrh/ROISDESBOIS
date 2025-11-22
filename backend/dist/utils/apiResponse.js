"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, meta) => {
    const response = {
        success: true,
        data,
        ...(meta && { meta })
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, code = 'ERROR', details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details })
        }
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendPaginated = (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return (0, exports.sendSuccess)(res, data, 200, {
        page,
        limit,
        total,
        totalPages
    });
};
exports.sendPaginated = sendPaginated;
//# sourceMappingURL=apiResponse.js.map