import { POSSale, Product, ConfigurableProduct, InventoryLog } from '../models/index.js';

// Helper function to reduce stock
const reduceStockForPOS = async (items, userId, saleId) => {
  for (const item of items) {
    if (item.productType === 'regular') {
      const product = await Product.findById(item.product);
      if (product) {
        const previousStock = product.stock;
        product.stock -= item.quantity;
        await product.save();

        await InventoryLog.create({
          product: product._id,
          action: 'pos_sale',
          quantityChange: -item.quantity,
          previousStock,
          newStock: product.stock,
          reference: { model: 'POSSale', id: saleId },
          performedBy: userId,
        });
      }
    } else if (item.productType === 'configurable') {
      const configurableProduct = await ConfigurableProduct.findById(item.product).populate(
        'components.product'
      );
      if (configurableProduct) {
        for (const component of configurableProduct.components) {
          const product = component.product;
          const requiredQuantity = component.quantityRequired * item.quantity;
          const previousStock = product.stock;
          product.stock -= requiredQuantity;
          await product.save();

          await InventoryLog.create({
            product: product._id,
            action: 'pos_sale',
            quantityChange: -requiredQuantity,
            previousStock,
            newStock: product.stock,
            reference: { model: 'POSSale', id: saleId },
            notes: `Used in configurable product: ${configurableProduct.name}`,
            performedBy: userId,
          });
        }
      }
    }
  }
};

// @desc    Get all POS sales
// @route   GET /api/pos-sales
// @access  Private
export const getPOSSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      paymentMethod = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { saleNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const sales = await POSSale.find(query)
      .populate('cashier', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await POSSale.countDocuments(query);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get POS sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get POS sales',
    });
  }
};

// @desc    Get POS sale by ID
// @route   GET /api/pos-sales/:id
// @access  Private
export const getPOSSaleById = async (req, res) => {
  try {
    const sale = await POSSale.findById(req.params.id).populate('cashier', 'name email');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'POS sale not found',
      });
    }

    res.json({
      success: true,
      data: { sale },
    });
  } catch (error) {
    console.error('Get POS sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get POS sale',
    });
  }
};

// @desc    Create POS sale
// @route   POST /api/pos-sales
// @access  Private
export const createPOSSale = async (req, res) => {
  try {
    const {
      items,
      taxRate,
      discount,
      paymentMethod,
      amountPaid,
      customerName,
      customerPhone,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required',
      });
    }

    if (!paymentMethod || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and amount paid are required',
      });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let product;
      let itemData = { ...item };

      if (item.productType === 'regular') {
        product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.product} not found`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }

        itemData.productModel = 'Product';
        itemData.name = product.name;
        itemData.unitPrice = item.unitPrice || product.price;
        itemData.total = itemData.unitPrice * item.quantity - (item.discount || 0);
      } else if (item.productType === 'configurable') {
        product = await ConfigurableProduct.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Configurable product ${item.product} not found`,
          });
        }

        const stockCheck = await product.checkComponentsStock(item.quantity);
        if (!stockCheck.inStock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for components of ${product.name}`,
            issues: stockCheck.issues,
          });
        }

        itemData.productModel = 'ConfigurableProduct';
        itemData.name = product.name;
        itemData.unitPrice = item.unitPrice || product.finalPrice;
        itemData.total = itemData.unitPrice * item.quantity - (item.discount || 0);
      }

      subtotal += itemData.total;
      processedItems.push(itemData);
    }

    const tax = (subtotal * (taxRate || 0)) / 100;
    const total = subtotal + tax - (discount || 0);
    const change = amountPaid - total;

    if (change < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient payment amount',
      });
    }

    // Create POS sale
    const sale = await POSSale.create({
      items: processedItems,
      subtotal,
      tax,
      taxRate: taxRate || 0,
      discount: discount || 0,
      total,
      paymentMethod,
      amountPaid,
      change,
      customerName,
      customerPhone,
      notes,
      cashier: req.user._id,
    });

    // Reduce stock
    await reduceStockForPOS(processedItems, req.user._id, sale._id);

    res.status(201).json({
      success: true,
      message: 'POS sale created successfully',
      data: { sale },
    });
  } catch (error) {
    console.error('Create POS sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create POS sale',
    });
  }
};

// @desc    Get POS sales statistics
// @route   GET /api/pos-sales/stats/summary
// @access  Private
export const getPOSSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalSales = await POSSale.countDocuments({ ...dateFilter, status: 'completed' });

    const revenueStats = await POSSale.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageSale: { $avg: '$total' },
          totalCash: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0] },
          },
          totalCard: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0] },
          },
        },
      },
    ]);

    const salesByHour = await POSSale.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalSales,
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averageSale: 0,
          totalCash: 0,
          totalCard: 0,
        },
        salesByHour,
      },
    });
  } catch (error) {
    console.error('Get POS sales stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get POS sales statistics',
    });
  }
};
