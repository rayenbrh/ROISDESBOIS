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
const categoryController = __importStar(require("../controllers/categoryController"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const joi_1 = __importDefault(require("joi"));
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.adminOnly);
// Validation schemas
const createCategorySchema = joi_1.default.object({
    name: validate_2.localizedStringSchema.required(),
    slug: joi_1.default.string().required(),
    parentId: validate_2.objectIdSchema.allow(null),
    icon: joi_1.default.string().allow('', null),
    order: joi_1.default.number().integer().min(0)
});
const updateCategorySchema = joi_1.default.object({
    name: validate_2.localizedStringSchema,
    slug: joi_1.default.string(),
    parentId: validate_2.objectIdSchema.allow(null),
    icon: joi_1.default.string().allow('', null),
    order: joi_1.default.number().integer().min(0)
});
const reorderCategoriesSchema = joi_1.default.object({
    categoryOrders: joi_1.default.array().items(joi_1.default.object({
        id: validate_2.objectIdSchema.required(),
        order: joi_1.default.number().integer().min(0).required()
    })).required()
});
const getCategoriesQuerySchema = validate_2.paginationSchema.keys({
    tree: joi_1.default.string().valid('true', 'false'),
    parentId: joi_1.default.string().allow('null')
});
/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories (tree or flat)
 * @access  Private (Admin only)
 */
router.get('/', (0, validate_1.validateQuery)(getCategoriesQuerySchema), categoryController.getCategories);
/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get category by ID
 * @access  Private (Admin only)
 */
router.get('/:id', categoryController.getCategoryById);
/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post('/', (0, validate_1.validate)(createCategorySchema), categoryController.createCategory);
/**
 * @route   PUT /api/admin/categories/reorder
 * @desc    Reorder categories
 * @access  Private (Admin only)
 */
router.put('/reorder', (0, validate_1.validate)(reorderCategoriesSchema), categoryController.reorderCategories);
/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put('/:id', (0, validate_1.validate)(updateCategorySchema), categoryController.updateCategory);
/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete('/:id', categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map