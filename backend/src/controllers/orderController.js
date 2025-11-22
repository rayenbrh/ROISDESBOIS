import { Order, Product, ConfigurableProduct, InventoryLog } from '../models/index.js';

// Helper function to reduce stock
const reduceStock = async (items, userId, orderId) => {
  for (const item of items) {
    if (item.productType === 'regular') {
      const product = await Product.findById(item.product);
      if (product) {
        const previousStock = product.stock;
        product.stock -= item.quantity;
        await product.save();

        await InventoryLog.create({
          product: product._id,
          action: 'order',
          quantityChange: -item.quantity,
          previousStock,
          newStock: product.stock,
          reference: { model: 'Order', id: orderId },
          performedBy: userId,
        });
      }
    } else if (item.productType === 'configurable') {
      // Reduce stock for each component
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
            action: 'order',
            quantityChange: -requiredQuantity,
            previousStock,
            newStock: product.stock,
            reference: { model: 'Order', id: orderId },
            notes: `Used in configurable product: ${configurableProduct.name}`,
            performedBy: userId,
          });
        }
      }
    }
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      paymentStatus = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const orders = await Order.find(query)
      .populate('createdBy', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
    });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { customer, items, taxRate, discount, paymentMethod, notes, estimatedDeliveryDate } =
      req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer and items are required',
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
        itemData.total = itemData.unitPrice * item.quantity;
      } else if (item.productType === 'configurable') {
        product = await ConfigurableProduct.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Configurable product ${item.product} not found`,
          });
        }

        // Check component stock
        const stockCheck = await product.checkComponentsStock(item.quantity);
        if (!stockCheck.inStock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for components of ${product.name}`,
            issues: stockCheck.issues,
          });
        }

        await product.populate('components.product');

        itemData.productModel = 'ConfigurableProduct';
        itemData.name = product.name;
        itemData.unitPrice = item.unitPrice || product.finalPrice;
        itemData.total = itemData.unitPrice * item.quantity;
        itemData.components = product.components.map((c) => ({
          productId: c.product._id,
          name: c.product.name,
          quantityRequired: c.quantityRequired,
        }));
      }

      subtotal += itemData.total;
      processedItems.push(itemData);
    }

    const tax = (subtotal * (taxRate || 0)) / 100;
    const total = subtotal + tax - (discount || 0);

    // Create order
    const order = await Order.create({
      customer,
      items: processedItems,
      subtotal,
      tax,
      taxRate: taxRate || 0,
      discount: discount || 0,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      notes,
      estimatedDeliveryDate,
      createdBy: req.user._id,
    });

    // Reduce stock
    await reduceStock(processedItems, req.user._id, order._id);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const allowedUpdates = [
      'customer',
      'status',
      'paymentStatus',
      'paymentMethod',
      'amountPaid',
      'notes',
      'internalNotes',
      'estimatedDeliveryDate',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    // Mark as delivered if status is delivered
    if (req.body.status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    order.updatedBy = req.user._id;
    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order',
      });
    }

    order.status = 'cancelled';
    order.updatedBy = req.user._id;
    await order.save();

    // TODO: Restore stock (implement if needed)

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/summary
// @access  Private
export const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalOrders = await Order.countDocuments(dateFilter);

    const statusDistribution = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const revenueStats = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalPaid: { $sum: '$amountPaid' },
          averageOrderValue: { $avg: '$total' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        statusDistribution,
        revenue: revenueStats[0] || { totalRevenue: 0, totalPaid: 0, averageOrderValue: 0 },
      },
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics',
    });
  }
};
