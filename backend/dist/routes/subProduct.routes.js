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
const express_1 = require("express");
const subProductController = __importStar(require("../controllers/subProductController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const createSubProductSchema = joi_1.default.object({
    title: validate_2.localizedStringSchema.required(),
    sku: joi_1.default.string().allow('', null),
    extraPrice: joi_1.default.number().min(0),
    stock: joi_1.default.number().integer().min(0),
    metadata: joi_1.default.object()
});
const updateSubProductSchema = joi_1.default.object({
    title: validate_2.localizedStringSchema,
    sku: joi_1.default.string().allow('', null),
    extraPrice: joi_1.default.number().min(0),
    stock: joi_1.default.number().integer().min(0),
    metadata: joi_1.default.object()
});
const adjustStockSchema = joi_1.default.object({
    adjustment: joi_1.default.number().integer().required(),
    reason: joi_1.default.string().allow('', null)
});
const getSubProductsQuerySchema = validate_2.paginationSchema.keys({
    search: joi_1.default.string(),
    lowStock: joi_1.default.string().valid('true', 'false')
});
/**
 * @route   GET /api/admin/subproducts
 * @desc    Get all subproducts with pagination
 * @access  Private (Admin only)
 */
router.get('/', (0, validate_1.validateQuery)(getSubProductsQuerySchema), subProductController.getSubProducts);
/**
 * @route   GET /api/admin/subproducts/:id
 * @desc    Get subproduct by ID
 * @access  Private (Admin only)
 */
router.get('/:id', subProductController.getSubProductById);
/**
 * @route   POST /api/admin/subproducts
 * @desc    Create new subproduct
 * @access  Private (Admin only)
 */
router.post('/', (0, validate_1.validate)(createSubProductSchema), subProductController.createSubProduct);
/**
 * @route   PUT /api/admin/subproducts/:id
 * @desc    Update subproduct
 * @access  Private (Admin only)
 */
router.put('/:id', (0, validate_1.validate)(updateSubProductSchema), subProductController.updateSubProduct);
/**
 * @route   PUT /api/admin/subproducts/:id/stock
 * @desc    Adjust stock
 * @access  Private (Admin only)
 */
router.put('/:id/stock', (0, validate_1.validate)(adjustStockSchema), subProductController.adjustStock);
/**
 * @route   POST /api/admin/subproducts/:id/images
 * @desc    Upload images for subproduct
 * @access  Private (Admin only)
 */
router.post('/:id/images', multer_1.upload.array('images', 10), subProductController.uploadSubProductImages);
/**
 * @route   DELETE /api/admin/subproducts/:id/images/:imageIndex
 * @desc    Delete image from subproduct
 * @access  Private (Admin only)
 */
router.delete('/:id/images/:imageIndex', subProductController.deleteSubProductImage);
/**
 * @route   DELETE /api/admin/subproducts/:id
 * @desc    Delete subproduct
 * @access  Private (Admin only)
 */
router.delete('/:id', subProductController.deleteSubProduct);
exports.default = router;
//# sourceMappingURL=subProduct.routes.js.map