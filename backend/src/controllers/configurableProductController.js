import { ConfigurableProduct, Product } from '../models/index.js';

// @desc    Get all configurable products
// @route   GET /api/configurable-products
// @access  Private
export const getConfigurableProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      isActive = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const products = await ConfigurableProduct.find(query)
      .populate('components.product', 'name price cost stock unit')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ConfigurableProduct.countDocuments(query);

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
    console.error('Get configurable products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get configurable products',
    });
  }
};

// @desc    Get configurable product by ID
// @route   GET /api/configurable-products/:id
// @access  Private
export const getConfigurableProductById = async (req, res) => {
  try {
    const product = await ConfigurableProduct.findById(req.params.id).populate(
      'components.product',
      'name price cost stock unit images'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Configurable product not found',
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error('Get configurable product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get configurable product',
    });
  }
};

// @desc    Create configurable product
// @route   POST /api/configurable-products
// @access  Private/Admin
export const createConfigurableProduct = async (req, res) => {
  try {
    const { name, description, category, components, customPrice, images, productionNotes } =
      req.body;

    if (!components || components.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one component is required',
      });
    }

    // Verify all component products exist
    for (const component of components) {
      const product = await Product.findById(component.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${component.product} not found`,
        });
      }
      component.name = product.name; // Store denormalized name
    }

    // Create configurable product
    const configurableProduct = new ConfigurableProduct({
      name,
      description,
      category,
      components,
      customPrice,
      images,
      productionNotes,
    });

    // Calculate price
    await configurableProduct.calculatePrice();
    await configurableProduct.save();

    // Populate for response
    await configurableProduct.populate('components.product', 'name price cost stock unit');

    res.status(201).json({
      success: true,
      message: 'Configurable product created successfully',
      data: { product: configurableProduct },
    });
  } catch (error) {
    console.error('Create configurable product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create configurable product',
    });
  }
};

// @desc    Update configurable product
// @route   PUT /api/configurable-products/:id
// @access  Private/Admin
export const updateConfigurableProduct = async (req, res) => {
  try {
    const product = await ConfigurableProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Configurable product not found',
      });
    }

    const { name, description, category, components, customPrice, images, productionNotes, isActive } =
      req.body;

    // Update fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (customPrice !== undefined) product.customPrice = customPrice;
    if (images) product.images = images;
    if (productionNotes !== undefined) product.productionNotes = productionNotes;
    if (typeof isActive !== 'undefined') product.isActive = isActive;

    // Update components if provided
    if (components) {
      // Verify all component products exist
      for (const component of components) {
        const componentProduct = await Product.findById(component.product);
        if (!componentProduct) {
          return res.status(400).json({
            success: false,
            message: `Product ${component.product} not found`,
          });
        }
        component.name = componentProduct.name;
      }
      product.components = components;
    }

    // Recalculate price
    await product.calculatePrice();
    await product.save();

    // Populate for response
    await product.populate('components.product', 'name price cost stock unit');

    res.json({
      success: true,
      message: 'Configurable product updated successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Update configurable product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configurable product',
    });
  }
};

// @desc    Delete configurable product
// @route   DELETE /api/configurable-products/:id
// @access  Private/Admin
export const deleteConfigurableProduct = async (req, res) => {
  try {
    const product = await ConfigurableProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Configurable product not found',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Configurable product deleted successfully',
    });
  } catch (error) {
    console.error('Delete configurable product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete configurable product',
    });
  }
};

// @desc    Check stock availability for configurable product
// @route   GET /api/configurable-products/:id/check-stock
// @access  Private
export const checkConfigurableProductStock = async (req, res) => {
  try {
    const { quantity = 1 } = req.query;

    const product = await ConfigurableProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Configurable product not found',
      });
    }

    const stockCheck = await product.checkComponentsStock(parseInt(quantity));

    res.json({
      success: true,
      data: stockCheck,
    });
  } catch (error) {
    console.error('Check stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock',
    });
  }
};

// @desc    Recalculate prices for all configurable products
// @route   POST /api/configurable-products/recalculate-prices
// @access  Private/Admin
export const recalculateAllPrices = async (req, res) => {
  try {
    const products = await ConfigurableProduct.find();

    let updated = 0;
    for (const product of products) {
      await product.calculatePrice();
      await product.save();
      updated++;
    }

    res.json({
      success: true,
      message: `Recalculated prices for ${updated} configurable products`,
      data: { updated },
    });
  } catch (error) {
    console.error('Recalculate prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate prices',
    });
  }
};

// @desc    Upload configurable product images
// @route   POST /api/configurable-products/:id/images
// @access  Private/Admin
export const uploadConfigurableProductImages = async (req, res) => {
  try {
    const product = await ConfigurableProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Configurable product not found',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

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
