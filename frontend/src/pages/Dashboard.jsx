import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, inventoryRes, ordersRes] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/inventory/summary'),
        api.get('/orders?limit=5'),
      ]);

      const products = await api.get('/products/low-stock/alert');

      setStats({
        totalProducts: inventoryRes.data.data.totalProducts || 0,
        lowStockProducts: products.data.data.count || 0,
        totalOrders: ordersRes.data.data.pagination.total || 0,
        totalRevenue: 0, // Calculate from orders if needed
      });

      setRecentOrders(ordersRes.data.data.orders || []);
    } catch (error) {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'blue',
    },
    {
      title: 'منتجات منخفضة المخزون',
      value: stats.lowStockProducts,
      icon: FiAlertTriangle,
      color: 'red',
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'green',
    },
    {
      title: 'المبيعات',
      value: stats.totalRevenue.toLocaleString() + ' DZD',
      icon: FiDollarSign,
      color: 'gold',
    },
  ];

  const salesData = [
    { month: 'يناير', sales: 40000 },
    { month: 'فبراير', sales: 55000 },
    { month: 'مارس', sales: 65000 },
    { month: 'أبريل', sales: 75000 },
    { month: 'مايو', sales: 85000 },
    { month: 'يونيو', sales: 95000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-gray-600 dark:text-gray-400">مرحباً بك في نظام إدارة Les Rois des Bois</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}
              >
                <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-gold-500" />
            المبيعات الشهرية
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-bold mb-4">أحدث الطلبات</h2>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customer.name}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gold-600">{order.total} DZD</p>
                    <span className={`badge badge-${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    in_production: 'info',
    ready: 'success',
    delivered: 'success',
    cancelled: 'danger',
  };
  return colors[status] || 'info';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    in_production: 'قيد الإنتاج',
    ready: 'جاهز',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
};

export default Dashboard;
