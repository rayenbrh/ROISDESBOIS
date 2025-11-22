import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { User, Product, Settings } from '../models/index.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    await connectDB();

    // Clear existing data (optional - comment out if you don't want to clear)
    // await User.deleteMany({});
    // await Product.deleteMany({});
    // await Settings.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@lesroisdesbois.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created:', admin.email);

    // Create cashier user
    const cashier = await User.create({
      name: 'Cashier User',
      email: 'cashier@lesroisdesbois.com',
      password: 'cashier123',
      role: 'cashier',
      isActive: true,
    });

    console.log('✅ Cashier user created:', cashier.email);

    // Create sample products
    const sampleProducts = [
      {
        name: 'طاولة خشبية كبيرة',
        description: 'طاولة خشبية فاخرة مصنوعة من خشب البلوط',
        category: 'طاولات',
        price: 25000,
        cost: 15000,
        sku: 'TBL-001',
        unit: 'piece',
        stock: 10,
        lowStockThreshold: 3,
        isActive: true,
        keywords: ['طاولة', 'خشب', 'بلوط', 'فاخرة'],
      },
      {
        name: 'كرسي خشبي',
        description: 'كرسي خشبي مريح',
        category: 'كراسي',
        price: 8000,
        cost: 5000,
        sku: 'CHR-001',
        unit: 'piece',
        stock: 25,
        lowStockThreshold: 5,
        isActive: true,
        keywords: ['كرسي', 'خشب', 'مريح'],
      },
      {
        name: 'لوح خشب بلوط',
        description: 'لوح خشب بلوط للتصنيع',
        category: 'مواد خام',
        price: 15000,
        cost: 10000,
        sku: 'WD-OAK-001',
        unit: 'sqm',
        stock: 50,
        lowStockThreshold: 10,
        isActive: true,
        keywords: ['خشب', 'بلوط', 'مواد'],
      },
      {
        name: 'أرجل طاولة معدنية',
        description: 'أرجل طاولة معدنية قوية',
        category: 'قطع غيار',
        price: 5000,
        cost: 3000,
        sku: 'LEG-MTL-001',
        unit: 'piece',
        stock: 40,
        lowStockThreshold: 10,
        isActive: true,
        keywords: ['أرجل', 'معدن', 'طاولة'],
      },
      {
        name: 'مصباح خشبي',
        description: 'مصباح خشبي عصري',
        category: 'إضاءة',
        price: 12000,
        cost: 7000,
        sku: 'LMP-001',
        unit: 'piece',
        stock: 15,
        lowStockThreshold: 5,
        isActive: true,
        keywords: ['مصباح', 'خشب', 'إضاءة'],
      },
    ];

    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${products.length} sample products`);

    // Create default settings
    const settings = await Settings.create({
      companyName: 'Les Rois des Bois',
      phone: '+213 XXX XXX XXX',
      email: 'contact@lesroisdesbois.com',
      address: {
        street: 'شارع الاستقلال',
        city: 'الجزائر',
        state: 'الجزائر',
        zipCode: '16000',
        country: 'الجزائر',
      },
      currency: 'DZD',
      taxRate: 19,
      language: 'ar',
      invoicePrefix: 'INV',
      invoiceFooter: 'شكراً لتعاملكم معنا - Les Rois des Bois',
      lowStockAlert: true,
      lowStockThreshold: 10,
    });

    console.log('✅ Settings created');

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@lesroisdesbois.com / admin123');
    console.log('   Cashier: cashier@lesroisdesbois.com / cashier123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
