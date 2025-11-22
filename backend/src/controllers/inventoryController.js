import { Product, InventoryLog } from '../models/index.js';

// @desc    Get inventory logs
// @route   GET /api/inventory/logs
// @access  Private
export const getInventoryLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId = '',
      action = '',
      startDate = '',
      endDate = '',
    } = req.query;

    const query = {};

    if (productId) {
      query.product = productId;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await InventoryLog.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get inventory logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory logs',
    });
  }
};

// @desc    Get inventory log for specific product
// @route   GET /api/inventory/logs/product/:productId
// @access  Private
export const getProductInventoryLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logs = await InventoryLog.find({ product: req.params.productId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryLog.countDocuments({ product: req.params.productId });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get product inventory logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product inventory logs',
    });
  }
};

// @desc    Adjust product stock manually
// @route   POST /api/inventory/adjust
// @access  Private/Admin
export const adjustStock = async (req, res) => {
  try {
    const { productId, quantityChange, notes } = req.body;

    if (!productId || typeof quantityChange !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity change are required',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    product.stock = newStock;
    await product.save();

    // Create inventory log
    await InventoryLog.create({
      product: product._id,
      action: 'manual_adjustment',
      quantityChange,
      previousStock,
      newStock,
      notes,
      performedBy: req.user._id,
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust stock',
    });
  }
};

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
// @access  Private
export const getInventorySummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });

    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    });

    const outOfStockProducts = await Product.countDocuments({
      stock: 0,
      isActive: true,
    });

    const totalStockValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$cost'] } },
          totalRetailValue: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
    ]);

    const categoryDistribution = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        stockValue: totalStockValue[0] || { totalValue: 0, totalRetailValue: 0 },
        categoryDistribution,
      },
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory summary',
    });
  }
};

// @desc    Get stock alerts
// @route   GET /api/inventory/alerts
// @access  Private
export const getStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    }).select('name sku stock lowStockThreshold category');

    const outOfStockProducts = await Product.find({
      stock: 0,
      isActive: true,
    }).select('name sku category');

    res.json({
      success: true,
      data: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        totalAlerts: lowStockProducts.length + outOfStockProducts.length,
      },
    });
  } catch (error) {
    console.error('Get stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock alerts',
    });
  }
};
