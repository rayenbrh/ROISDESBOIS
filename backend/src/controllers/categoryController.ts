import { Request, Response, NextFunction } from 'express';
import { Category } from '../models';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { logCreate, logUpdate, logDelete } from '../services/auditService';
import logger from '../config/logger';

/**
 * Get all categories with optional tree structure
 * GET /api/admin/categories
 */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const tree = req.query.tree === 'true';
    const parentId = req.query.parentId as string | undefined;

    if (tree) {
      // Build tree structure
      const categories = await Category.find({}).sort({ order: 1, 'name.ar': 1 });

      const buildTree = (parentId: any = null): any[] => {
        return categories
          .filter(cat => {
            const catParentId = cat.parentId ? cat.parentId.toString() : null;
            const compareId = parentId ? parentId.toString() : null;
            return catParentId === compareId;
          })
          .map((cat: any) => ({
            ...cat.toObject(),
            children: buildTree(cat._id)
          }));
      };

      const tree = buildTree();
      sendSuccess(res, tree);
      return;
    }

    // Regular paginated list
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (parentId !== undefined) {
      filter.parentId = parentId === 'null' ? null : parentId;
    }

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate('parentId', 'name')
        .sort({ order: 1, 'name.ar': 1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments(filter)
    ]);

    sendPaginated(res, categories, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * GET /api/admin/categories/:id
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentId', 'name');

    if (!category) {
      sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
      return;
    }

    // Get subcategories count
    const subcategoriesCount = await Category.countDocuments({
      parentId: category._id
    });

    sendSuccess(res, {
      ...category.toObject(),
      subcategoriesCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 * POST /api/admin/categories
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, parentId, icon, order } = req.body;

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      sendError(res, 'Slug already exists', 400, 'SLUG_EXISTS');
      return;
    }

    // Verify parent category exists if parentId is provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        sendError(res, 'Parent category not found', 404, 'PARENT_NOT_FOUND');
        return;
      }
    }

    const category = new Category({
      name,
      slug,
      parentId,
      icon,
      order
    });

    await category.save();

    // Log creation
    if (req.user) {
      await logCreate(req.user.userId, 'category', category._id.toString(), {
        name: category.name.ar,
        slug: category.slug
      });
    }

    logger.info(`Category created: ${category.name.ar} by ${req.user?.email}`);

    sendSuccess(res, category, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * PUT /api/admin/categories/:id
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, parentId, icon, order } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
      return;
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        sendError(res, 'Slug already exists', 400, 'SLUG_EXISTS');
        return;
      }
      category.slug = slug;
    }

    // Prevent category from being its own parent
    if (parentId && parentId.toString() === category._id.toString()) {
      sendError(res, 'Category cannot be its own parent', 400, 'INVALID_PARENT');
      return;
    }

    // Prevent circular reference (category cannot be child of its own descendant)
    if (parentId) {
      const isDescendant = await checkIfDescendant(category._id.toString(), parentId);
      if (isDescendant) {
        sendError(res, 'Cannot set parent as descendant', 400, 'CIRCULAR_REFERENCE');
        return;
      }
    }

    // Update fields
    if (name) category.name = name;
    if (parentId !== undefined) category.parentId = parentId;
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = order;

    await category.save();

    // Log update
    if (req.user) {
      await logUpdate(req.user.userId, 'category', category._id.toString(), {
        updatedFields: Object.keys(req.body)
      });
    }

    logger.info(`Category updated: ${category.name.ar} by ${req.user?.email}`);

    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
      return;
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({
      parentId: category._id
    });

    if (subcategoriesCount > 0) {
      sendError(
        res,
        'لا يمكن حذف فئة تحتوي على فئات فرعية',
        400,
        'HAS_SUBCATEGORIES'
      );
      return;
    }

    // Check if category is used by any products
    const { Product } = await import('../models');
    const productsCount = await Product.countDocuments({
      categories: category._id
    });

    if (productsCount > 0) {
      sendError(
        res,
        'لا يمكن حذف فئة مستخدمة في منتجات',
        400,
        'CATEGORY_IN_USE'
      );
      return;
    }

    await category.deleteOne();

    // Log deletion
    if (req.user) {
      await logDelete(req.user.userId, 'category', category._id.toString(), {
        name: category.name.ar
      });
    }

    logger.info(`Category deleted: ${category.name.ar} by ${req.user?.email}`);

    sendSuccess(res, { message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder categories
 * PUT /api/admin/categories/reorder
 */
export const reorderCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(categoryOrders)) {
      sendError(res, 'Invalid request format', 400, 'INVALID_FORMAT');
      return;
    }

    // Update orders in bulk
    const bulkOps = categoryOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } }
      }
    }));

    await Category.bulkWrite(bulkOps);

    // Log reordering
    if (req.user) {
      await logUpdate(req.user.userId, 'category', 'bulk', {
        action: 'reorder',
        count: categoryOrders.length
      });
    }

    logger.info(`Categories reordered by ${req.user?.email}`);

    sendSuccess(res, { message: 'Categories reordered successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to check if a category is descendant of another
 */
async function checkIfDescendant(
  categoryId: string,
  potentialAncestorId: string
): Promise<boolean> {
  const category = await Category.findById(potentialAncestorId);

  if (!category) return false;
  if (!category.parentId) return false;
  if (category.parentId.toString() === categoryId) return true;

  return checkIfDescendant(categoryId, category.parentId.toString());
}
