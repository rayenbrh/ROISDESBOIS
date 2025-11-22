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
exports.reorderCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const models_1 = require("../models");
const apiResponse_1 = require("../utils/apiResponse");
const auditService_1 = require("../services/auditService");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Get all categories with optional tree structure
 * GET /api/admin/categories
 */
const getCategories = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const tree = req.query.tree === 'true';
        const parentId = req.query.parentId;
        if (tree) {
            // Build tree structure
            const categories = await models_1.Category.find({}).sort({ order: 1, 'name.ar': 1 });
            const buildTree = (parentId = null) => {
                return categories
                    .filter(cat => {
                    if (parentId === null) {
                        return !cat.parentId;
                    }
                    return cat.parentId?.toString() === parentId.toString();
                })
                    .map(cat => ({
                    ...cat.toObject(),
                    children: buildTree(cat._id)
                }));
            };
            const tree = buildTree();
            (0, apiResponse_1.sendSuccess)(res, tree);
            return;
        }
        // Regular paginated list
        const skip = (page - 1) * limit;
        const filter = {};
        if (parentId !== undefined) {
            filter.parentId = parentId === 'null' ? null : parentId;
        }
        const [categories, total] = await Promise.all([
            models_1.Category.find(filter)
                .populate('parentId', 'name')
                .sort({ order: 1, 'name.ar': 1 })
                .skip(skip)
                .limit(limit),
            models_1.Category.countDocuments(filter)
        ]);
        (0, apiResponse_1.sendPaginated)(res, categories, page, limit, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
/**
 * Get category by ID
 * GET /api/admin/categories/:id
 */
const getCategoryById = async (req, res, next) => {
    try {
        const category = await models_1.Category.findById(req.params.id)
            .populate('parentId', 'name');
        if (!category) {
            (0, apiResponse_1.sendError)(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
            return;
        }
        // Get subcategories count
        const subcategoriesCount = await models_1.Category.countDocuments({
            parentId: category._id
        });
        (0, apiResponse_1.sendSuccess)(res, {
            ...category.toObject(),
            subcategoriesCount
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
/**
 * Create new category
 * POST /api/admin/categories
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, slug, parentId, icon, order } = req.body;
        // Check if slug already exists
        const existingCategory = await models_1.Category.findOne({ slug });
        if (existingCategory) {
            (0, apiResponse_1.sendError)(res, 'Slug already exists', 400, 'SLUG_EXISTS');
            return;
        }
        // Verify parent category exists if parentId is provided
        if (parentId) {
            const parentCategory = await models_1.Category.findById(parentId);
            if (!parentCategory) {
                (0, apiResponse_1.sendError)(res, 'Parent category not found', 404, 'PARENT_NOT_FOUND');
                return;
            }
        }
        const category = new models_1.Category({
            name,
            slug,
            parentId,
            icon,
            order
        });
        await category.save();
        // Log creation
        if (req.user) {
            await (0, auditService_1.logCreate)(req.user.userId, 'category', category._id.toString(), {
                name: category.name.ar,
                slug: category.slug
            });
        }
        logger_1.default.info(`Category created: ${category.name.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, category, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
/**
 * Update category
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const { name, slug, parentId, icon, order } = req.body;
        const category = await models_1.Category.findById(req.params.id);
        if (!category) {
            (0, apiResponse_1.sendError)(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
            return;
        }
        // Check if slug is being changed and if it already exists
        if (slug && slug !== category.slug) {
            const existingCategory = await models_1.Category.findOne({ slug });
            if (existingCategory) {
                (0, apiResponse_1.sendError)(res, 'Slug already exists', 400, 'SLUG_EXISTS');
                return;
            }
            category.slug = slug;
        }
        // Prevent category from being its own parent
        if (parentId && parentId.toString() === category._id.toString()) {
            (0, apiResponse_1.sendError)(res, 'Category cannot be its own parent', 400, 'INVALID_PARENT');
            return;
        }
        // Prevent circular reference (category cannot be child of its own descendant)
        if (parentId) {
            const isDescendant = await checkIfDescendant(category._id.toString(), parentId);
            if (isDescendant) {
                (0, apiResponse_1.sendError)(res, 'Cannot set parent as descendant', 400, 'CIRCULAR_REFERENCE');
                return;
            }
        }
        // Update fields
        if (name)
            category.name = name;
        if (parentId !== undefined)
            category.parentId = parentId;
        if (icon !== undefined)
            category.icon = icon;
        if (order !== undefined)
            category.order = order;
        await category.save();
        // Log update
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'category', category._id.toString(), {
                updatedFields: Object.keys(req.body)
            });
        }
        logger_1.default.info(`Category updated: ${category.name.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, category);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
/**
 * Delete category
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const category = await models_1.Category.findById(req.params.id);
        if (!category) {
            (0, apiResponse_1.sendError)(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
            return;
        }
        // Check if category has subcategories
        const subcategoriesCount = await models_1.Category.countDocuments({
            parentId: category._id
        });
        if (subcategoriesCount > 0) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete category with subcategories', 400, 'HAS_SUBCATEGORIES');
            return;
        }
        // Check if category is used by any products
        const { Product } = await Promise.resolve().then(() => __importStar(require('../models')));
        const productsCount = await Product.countDocuments({
            categories: category._id
        });
        if (productsCount > 0) {
            (0, apiResponse_1.sendError)(res, 'Cannot delete category that is assigned to products', 400, 'CATEGORY_IN_USE');
            return;
        }
        await category.deleteOne();
        // Log deletion
        if (req.user) {
            await (0, auditService_1.logDelete)(req.user.userId, 'category', category._id.toString(), {
                name: category.name.ar
            });
        }
        logger_1.default.info(`Category deleted: ${category.name.ar} by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Category deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
/**
 * Reorder categories
 * PUT /api/admin/categories/reorder
 */
const reorderCategories = async (req, res, next) => {
    try {
        const { categoryOrders } = req.body; // Array of { id, order }
        if (!Array.isArray(categoryOrders)) {
            (0, apiResponse_1.sendError)(res, 'Invalid request format', 400, 'INVALID_FORMAT');
            return;
        }
        // Update orders in bulk
        const bulkOps = categoryOrders.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order } }
            }
        }));
        await models_1.Category.bulkWrite(bulkOps);
        // Log reordering
        if (req.user) {
            await (0, auditService_1.logUpdate)(req.user.userId, 'category', 'bulk', {
                action: 'reorder',
                count: categoryOrders.length
            });
        }
        logger_1.default.info(`Categories reordered by ${req.user?.email}`);
        (0, apiResponse_1.sendSuccess)(res, { message: 'Categories reordered successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.reorderCategories = reorderCategories;
/**
 * Helper function to check if a category is descendant of another
 */
async function checkIfDescendant(categoryId, potentialAncestorId) {
    const category = await models_1.Category.findById(potentialAncestorId);
    if (!category)
        return false;
    if (!category.parentId)
        return false;
    if (category.parentId.toString() === categoryId)
        return true;
    return checkIfDescendant(categoryId, category.parentId.toString());
}
//# sourceMappingURL=categoryController.js.map