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
const productController = __importStar(require("../controllers/productController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const productVariantSchema = joi_1.default.object({
    color: validate_2.localizedStringSchema.required(),
    sku: joi_1.default.string().required(),
    image: joi_1.default.string().allow('', null),
    stock: joi_1.default.number().integer().min(0).required()
});
const bulkPriceSchema = joi_1.default.object({
    minQty: joi_1.default.number().integer().min(1).required(),
    price: joi_1.default.number().min(0).required()
});
const productPriceSchema = joi_1.default.object({
    retail: joi_1.default.number().min(0).required(),
    bulkPrices: joi_1.default.array().items(bulkPriceSchema)
});
const componentGroupSchema = joi_1.default.object({
    componentKey: joi_1.default.string().required(),
    label: validate_2.localizedStringSchema.required(),
    subProductIds: joi_1.default.array().items(validate_2.objectIdSchema).min(1).required(),
    required: joi_1.default.boolean().required()
});
const specialConfigSchema = joi_1.default.object({
    components: joi_1.default.array().items(componentGroupSchema).min(1).required(),
    combinationImages: joi_1.default.array(),
    compositeMode: joi_1.default.string().valid('auto', 'manual', 'both').required()
});
const createProductSchema = joi_1.default.object({
    title: validate_2.localizedStringSchema.required(),
    description: validate_2.localizedStringSchema.required(),
    sku: joi_1.default.string().required(),
    variants: joi_1.default.array().items(productVariantSchema),
    price: productPriceSchema.required(),
    cost: joi_1.default.number().min(0),
    categories: joi_1.default.array().items(validate_2.objectIdSchema).min(1).required(),
    isSpecial: joi_1.default.boolean(),
    specialConfig: specialConfigSchema,
    stockPolicy: joi_1.default.string().valid('byProduct', 'byVariant', 'byComponent'),
    stock: joi_1.default.number().integer().min(0),
    isActive: joi_1.default.boolean(),
    isFeatured: joi_1.default.boolean(),
    meta: joi_1.default.object({
        title: validate_2.localizedStringSchema,
        description: validate_2.localizedStringSchema,
        keywords: validate_2.localizedStringSchema
    })
});
const updateProductSchema = joi_1.default.object({
    title: validate_2.localizedStringSchema,
    description: validate_2.localizedStringSchema,
    sku: joi_1.default.string(),
    variants: joi_1.default.array().items(productVariantSchema),
    price: productPriceSchema,
    cost: joi_1.default.number().min(0),
    categories: joi_1.default.array().items(validate_2.objectIdSchema).min(1),
    isSpecial: joi_1.default.boolean(),
    specialConfig: specialConfigSchema,
    stockPolicy: joi_1.default.string().valid('byProduct', 'byVariant', 'byComponent'),
    stock: joi_1.default.number().integer().min(0),
    isActive: joi_1.default.boolean(),
    isFeatured: joi_1.default.boolean(),
    meta: joi_1.default.object({
        title: validate_2.localizedStringSchema,
        description: validate_2.localizedStringSchema,
        keywords: validate_2.localizedStringSchema
    })
});
const adjustStockSchema = joi_1.default.object({
    adjustment: joi_1.default.number().integer().required(),
    reason: joi_1.default.string().allow('', null),
    variantId: joi_1.default.string().allow(null)
});
const generateCompositeSchema = joi_1.default.object({
    mapping: joi_1.default.object().pattern(joi_1.default.string(), validate_2.objectIdSchema).required()
});
const getProductsQuerySchema = validate_2.paginationSchema.keys({
    search: joi_1.default.string(),
    categoryId: validate_2.objectIdSchema,
    isSpecial: joi_1.default.string().valid('true', 'false'),
    isActive: joi_1.default.string().valid('true', 'false'),
    isFeatured: joi_1.default.string().valid('true', 'false')
});
/**
 * @route   GET /api/admin/products
 * @desc    Get all products with pagination
 * @access  Private (Admin only)
 */
router.get('/', (0, validate_1.validateQuery)(getProductsQuerySchema), productController.getProducts);
/**
 * @route   GET /api/admin/products/composite-job/:jobId
 * @desc    Get composite generation job status
 * @access  Private (Admin only)
 */
router.get('/composite-job/:jobId', productController.getCompositeJobStatus);
/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product by ID
 * @access  Private (Admin only)
 */
router.get('/:id', productController.getProductById);
/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Private (Admin only)
 */
router.post('/', (0, validate_1.validate)(createProductSchema), productController.createProduct);
/**
 * @route   POST /api/admin/products/:id/generate-composite
 * @desc    Generate composite image for special product
 * @access  Private (Admin only)
 */
router.post('/:id/generate-composite', (0, validate_1.validate)(generateCompositeSchema), productController.generateComposite);
/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 */
router.put('/:id', (0, validate_1.validate)(updateProductSchema), productController.updateProduct);
/**
 * @route   PUT /api/admin/products/:id/stock
 * @desc    Adjust stock
 * @access  Private (Admin only)
 */
router.put('/:id/stock', (0, validate_1.validate)(adjustStockSchema), productController.adjustStock);
/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Upload images for product
 * @access  Private (Admin only)
 */
router.post('/:id/images', multer_1.upload.array('images', 10), productController.uploadProductImages);
/**
 * @route   DELETE /api/admin/products/:id/images/:imageIndex
 * @desc    Delete image from product
 * @access  Private (Admin only)
 */
router.delete('/:id/images/:imageIndex', productController.deleteProductImage);
/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product
 * @access  Private (Admin only)
 */
router.delete('/:id', productController.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map