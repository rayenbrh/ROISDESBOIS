import { Product, InventoryLog } from '../models/index.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      isActive = '',
      lowStock = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Active status filter
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Low stock filter
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Create initial inventory log
    if (product.stock > 0) {
      await InventoryLog.create({
        product: product._id,
        action: 'initial_stock',
        quantityChange: product.stock,
        previousStock: 0,
        newStock: product.stock,
        performedBy: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const previousStock = product.stock;

    // Update product
    Object.assign(product, req.body);
    await product.save();

    // Log stock change if stock was modified
    if (req.body.stock !== undefined && previousStock !== product.stock) {
      await InventoryLog.create({
        product: product._id,
        action: 'manual_adjustment',
        quantityChange: product.stock - previousStock,
        previousStock,
        newStock: product.stock,
        performedBy: req.user._id,
        notes: req.body.stockNote || 'Manual stock adjustment',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
};

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
export const uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Add new images
    const newImages = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      alt: product.name,
    }));

    product.images = [...product.images, ...newImages];
    await product.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
    });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
export const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.images = product.images.filter(
      (img) => img._id.toString() !== req.params.imageId
    );

    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock/alert
// @access  Private
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    }).sort({ stock: 1 });

    res.json({
      success: true,
      data: { products, count: products.length },
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock products',
    });
  }
};
