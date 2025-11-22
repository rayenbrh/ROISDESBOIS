import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User, Category, SubProduct, Product, Settings, Order } from '../src/models';
import { UserRole, StockPolicy, CompositeMode, OrderSource, OrderStatus } from '../src/types';
import logger from '../src/config/logger';

/**
 * Seed database with demo data
 */
const seed = async (): Promise<void> => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/roisdesbois';
    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    logger.info('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await SubProduct.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    await Order.deleteMany({});
    logger.info('✅ Existing data cleared');

    // ========================================================================
    // CREATE USERS
    // ========================================================================
    logger.info('👥 Creating users...');

    const admin = await User.create({
      name: { first: 'Admin', last: 'System' },
      email: 'admin@roisdesbois.tn',
      passwordHash: 'Admin123!', // Will be hashed by pre-save hook
      role: UserRole.ADMIN,
      isActive: true
    });

    const commercial = await User.create({
      name: { first: 'محمد', last: 'الأمين' },
      email: 'commercial@roisdesbois.tn',
      passwordHash: 'Commercial123!',
      role: UserRole.COMMERCIAL,
      isActive: true
    });

    const store = await User.create({
      name: { first: 'فاطمة', last: 'بن علي' },
      email: 'store@roisdesbois.tn',
      passwordHash: 'Store123!',
      role: UserRole.STORE,
      isActive: true
    });

    const client = await User.create({
      name: { first: 'أحمد', last: 'السالمي' },
      email: 'client@example.tn',
      passwordHash: 'Client123!',
      role: UserRole.CLIENT,
      assignedCommercial: commercial._id,
      isActive: true
    });

    logger.info('✅ Created 4 users (Admin, Commercial, Store, Client)');

    // ========================================================================
    // CREATE CATEGORIES
    // ========================================================================
    logger.info('📂 Creating categories...');

    const furnitureCategory = await Category.create({
      name: { ar: 'أثاث', en: 'Furniture' },
      slug: 'furniture',
      order: 1
    });

    const tablesCategory = await Category.create({
      name: { ar: 'طاولات', en: 'Tables' },
      slug: 'tables',
      parentId: furnitureCategory._id,
      order: 1
    });

    const chairsCategory = await Category.create({
      name: { ar: 'كراسي', en: 'Chairs' },
      slug: 'chairs',
      parentId: furnitureCategory._id,
      order: 2
    });

    const bedsCategory = await Category.create({
      name: { ar: 'أسرّة', en: 'Beds' },
      slug: 'beds',
      parentId: furnitureCategory._id,
      order: 3
    });

    logger.info('✅ Created 4 categories');

    // ========================================================================
    // CREATE SUBPRODUCTS (COMPONENTS)
    // ========================================================================
    logger.info('🔧 Creating subproducts (components)...');

    const tableLegs1 = await SubProduct.create({
      title: { ar: 'أرجل خشبية - نموذج 1' },
      sku: 'LEG-WOOD-01',
      images: [
        {
          path: '/uploads/subproducts/placeholder-legs-1.png',
          thumbPath: '/uploads/subproducts/placeholder-legs-1-thumb.png'
        }
      ],
      extraPrice: 50,
      stock: 100
    });

    const tableLegs2 = await SubProduct.create({
      title: { ar: 'أرجل معدنية - نموذج 2' },
      sku: 'LEG-METAL-02',
      images: [
        {
          path: '/uploads/subproducts/placeholder-legs-2.png',
          thumbPath: '/uploads/subproducts/placeholder-legs-2-thumb.png'
        }
      ],
      extraPrice: 80,
      stock: 75
    });

    const tableTop1 = await SubProduct.create({
      title: { ar: 'سطح خشبي دائري' },
      sku: 'TOP-WOOD-ROUND',
      images: [
        {
          path: '/uploads/subproducts/placeholder-top-1.png',
          thumbPath: '/uploads/subproducts/placeholder-top-1-thumb.png'
        }
      ],
      extraPrice: 120,
      stock: 50
    });

    const tableTop2 = await SubProduct.create({
      title: { ar: 'سطح خشبي مستطيل' },
      sku: 'TOP-WOOD-RECT',
      images: [
        {
          path: '/uploads/subproducts/placeholder-top-2.png',
          thumbPath: '/uploads/subproducts/placeholder-top-2-thumb.png'
        }
      ],
      extraPrice: 150,
      stock: 60
    });

    const chairBack1 = await SubProduct.create({
      title: { ar: 'ظهر كرسي - تقليدي' },
      sku: 'BACK-CLASSIC',
      images: [
        {
          path: '/uploads/subproducts/placeholder-back-1.png',
          thumbPath: '/uploads/subproducts/placeholder-back-1-thumb.png'
        }
      ],
      extraPrice: 30,
      stock: 80
    });

    const chairBack2 = await SubProduct.create({
      title: { ar: 'ظهر كرسي - عصري' },
      sku: 'BACK-MODERN',
      images: [
        {
          path: '/uploads/subproducts/placeholder-back-2.png',
          thumbPath: '/uploads/subproducts/placeholder-back-2-thumb.png'
        }
      ],
      extraPrice: 45,
      stock: 70
    });

    logger.info('✅ Created 6 subproducts');

    // ========================================================================
    // CREATE PRODUCTS
    // ========================================================================
    logger.info('🛋️  Creating products...');

    // Standard product 1: Simple chair
    const simpleChair = await Product.create({
      title: { ar: 'كرسي خشبي قياسي' },
      description: { ar: 'كرسي خشبي عالي الجودة مع تصميم كلاسيكي' },
      sku: 'CHAIR-STD-001',
      images: [
        {
          path: '/uploads/products/placeholder-chair-1.png',
          thumbPath: '/uploads/products/placeholder-chair-1-thumb.png'
        }
      ],
      price: {
        retail: 250,
        bulkPrices: [
          { minQty: 5, price: 230 },
          { minQty: 10, price: 210 }
        ]
      },
      cost: 150,
      categories: [furnitureCategory._id, chairsCategory._id],
      isSpecial: false,
      stockPolicy: StockPolicy.BY_PRODUCT,
      stock: 25,
      isActive: true,
      isFeatured: true,
      createdBy: admin._id
    });

    // Standard product 2: Bed
    const simpleBed = await Product.create({
      title: { ar: 'سرير مزدوج' },
      description: { ar: 'سرير مزدوج مريح مع هيكل خشبي قوي' },
      sku: 'BED-DBL-001',
      images: [
        {
          path: '/uploads/products/placeholder-bed-1.png',
          thumbPath: '/uploads/products/placeholder-bed-1-thumb.png'
        }
      ],
      variants: [
        {
          color: { ar: 'بني' },
          sku: 'BED-DBL-001-BRN',
          stock: 10
        },
        {
          color: { ar: 'أبيض' },
          sku: 'BED-DBL-001-WHT',
          stock: 8
        }
      ],
      price: {
        retail: 1500,
        bulkPrices: [
          { minQty: 3, price: 1400 }
        ]
      },
      cost: 1000,
      categories: [furnitureCategory._id, bedsCategory._id],
      isSpecial: false,
      stockPolicy: StockPolicy.BY_VARIANT,
      isActive: true,
      createdBy: admin._id
    });

    // Special product: Configurable table
    const configurableTable = await Product.create({
      title: { ar: 'طاولة قابلة للتخصيص' },
      description: { ar: 'صمم طاولتك الخاصة باختيار الأرجل والسطح' },
      sku: 'TABLE-CUSTOM-001',
      images: [
        {
          path: '/uploads/products/placeholder-table-1.png',
          thumbPath: '/uploads/products/placeholder-table-1-thumb.png'
        }
      ],
      price: {
        retail: 500 // Base price, components add extra
      },
      cost: 300,
      categories: [furnitureCategory._id, tablesCategory._id],
      isSpecial: true,
      specialConfig: {
        components: [
          {
            componentKey: 'legs',
            label: { ar: 'أرجل الطاولة' },
            subProductIds: [tableLegs1._id, tableLegs2._id],
            required: true
          },
          {
            componentKey: 'top',
            label: { ar: 'سطح الطاولة' },
            subProductIds: [tableTop1._id, tableTop2._id],
            required: true
          }
        ],
        combinationImages: [],
        compositeMode: CompositeMode.BOTH
      },
      stockPolicy: StockPolicy.BY_COMPONENT,
      isActive: true,
      isFeatured: true,
      createdBy: admin._id
    });

    // Special product: Configurable chair
    const configurableChair = await Product.create({
      title: { ar: 'كرسي قابل للتخصيص' },
      description: { ar: 'اختر تصميم ظهر الكرسي المفضل لديك' },
      sku: 'CHAIR-CUSTOM-001',
      images: [
        {
          path: '/uploads/products/placeholder-chair-custom.png',
          thumbPath: '/uploads/products/placeholder-chair-custom-thumb.png'
        }
      ],
      price: {
        retail: 200
      },
      cost: 120,
      categories: [furnitureCategory._id, chairsCategory._id],
      isSpecial: true,
      specialConfig: {
        components: [
          {
            componentKey: 'back',
            label: { ar: 'ظهر الكرسي' },
            subProductIds: [chairBack1._id, chairBack2._id],
            required: true
          }
        ],
        combinationImages: [],
        compositeMode: CompositeMode.MANUAL
      },
      stockPolicy: StockPolicy.BY_COMPONENT,
      isActive: true,
      createdBy: admin._id
    });

    logger.info('✅ Created 4 products (2 standard, 2 configurable)');

    // ========================================================================
    // CREATE SAMPLE ORDERS
    // ========================================================================
    logger.info('📦 Creating sample orders...');

    const order1 = await Order.create({
      orderNumber: 'ROI-ORD-2024-00001',
      clientId: client._id,
      commercialId: commercial._id,
      source: OrderSource.ADMIN,
      lines: [
        {
          productId: simpleChair._id,
          productTitle: simpleChair.title,
          unitPrice: 250,
          qty: 4,
          lineTotal: 1000,
          costPerUnit: 150
        },
        {
          productId: simpleBed._id,
          productTitle: simpleBed.title,
          variantId: 'BED-DBL-001-BRN',
          unitPrice: 1500,
          qty: 1,
          lineTotal: 1500,
          costPerUnit: 1000
        }
      ],
      subtotal: 2500,
      remise: 100,
      tax: 456, // 19% on (2500 - 100)
      total: 2856,
      costTotal: 1600,
      netIncome: 1256,
      status: OrderStatus.NEW,
      statusHistory: [
        {
          status: OrderStatus.NEW,
          changedBy: admin._id,
          changedAt: new Date(),
          note: 'طلب جديد'
        }
      ]
    });

    const order2 = await Order.create({
      orderNumber: 'ROI-ORD-2024-00002',
      clientId: client._id,
      commercialId: commercial._id,
      source: OrderSource.CATALOG,
      lines: [
        {
          productId: configurableTable._id,
          productTitle: configurableTable.title,
          componentSelections: {
            legs: tableLegs1._id.toString(),
            top: tableTop1._id.toString()
          },
          unitPrice: 670, // 500 + 50 + 120
          qty: 2,
          lineTotal: 1340,
          costPerUnit: 300
        }
      ],
      subtotal: 1340,
      remise: 0,
      tax: 254.6, // 19%
      total: 1594.6,
      costTotal: 600,
      netIncome: 994.6,
      status: OrderStatus.PROCESSING,
      statusHistory: [
        {
          status: OrderStatus.NEW,
          changedBy: admin._id,
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          note: 'طلب جديد'
        },
        {
          status: OrderStatus.PROCESSING,
          changedBy: admin._id,
          changedAt: new Date(),
          note: 'قيد المعالجة'
        }
      ]
    });

    logger.info('✅ Created 2 sample orders');

    // ========================================================================
    // CREATE SETTINGS
    // ========================================================================
    logger.info('⚙️  Creating settings...');

    await Settings.create({
      companyName: {
        ar: 'Les Rois des Bois - ملوك الخشب',
        en: 'Les Rois des Bois'
      },
      address: {
        ar: 'تونس، العاصمة، شارع الحبيب بورقيبة',
        en: 'Tunis, Avenue Habib Bourguiba'
      },
      phone: '+216 71 123 456',
      email: 'contact@roisdesbois.tn',
      taxNumber: '1234567/A/M/000',
      taxPercent: 19,
      currency: 'TND',
      invoiceFooter: {
        ar: 'شكراً لثقتكم بنا - ملوك الخشب',
        en: 'Thank you for your trust - Les Rois des Bois'
      },
      defaultLanguage: 'ar',
      theme: {
        primaryColor: '#D4AF37',
        mode: 'light'
      }
    });

    logger.info('✅ Created settings');

    // ========================================================================
    // SUMMARY
    // ========================================================================
    logger.info('\n🎉 ========================================');
    logger.info('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('🎉 ========================================\n');

    logger.info('📊 Summary:');
    logger.info(`   👥 Users: 4 (1 Admin, 1 Commercial, 1 Store, 1 Client)`);
    logger.info(`   📂 Categories: 4 (1 parent, 3 children)`);
    logger.info(`   🔧 SubProducts: 6 (components for configurable products)`);
    logger.info(`   🛋️  Products: 4 (2 standard, 2 configurable)`);
    logger.info(`   📦 Orders: 2 (different statuses and sources)`);
    logger.info(`   ⚙️  Settings: 1 (company configuration)\n`);

    logger.info('🔑 Login Credentials:');
    logger.info('   Admin:');
    logger.info('     Email: admin@roisdesbois.tn');
    logger.info('     Password: Admin123!');
    logger.info('   Commercial:');
    logger.info('     Email: commercial@roisdesbois.tn');
    logger.info('     Password: Commercial123!');
    logger.info('   Store:');
    logger.info('     Email: store@roisdesbois.tn');
    logger.info('     Password: Store123!');
    logger.info('   Client:');
    logger.info('     Email: client@example.tn');
    logger.info('     Password: Client123!\n');

    logger.info('🚀 You can now start the backend server and login!');
    logger.info('   Run: npm run dev\n');

    await mongoose.connection.close();
    logger.info('✅ Database connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed
seed();
