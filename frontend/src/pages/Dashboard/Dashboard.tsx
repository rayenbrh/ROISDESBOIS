import React from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSalesStats } from '../../services/queries/analyticsQueries';
import { useLowStockProducts } from '../../services/queries/productQueries';
import { useOrders } from '../../services/queries/orderQueries';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { getStatusColor } from '../../utils/helpers';

const Dashboard: React.FC = () => {
  const { data: salesStats, isLoading: statsLoading } = useSalesStats();
  const { data: lowStockProducts } = useLowStockProducts();
  const { data: ordersData } = useOrders({}, 1, 5);

  const stats = [
    {
      name: 'إجمالي المبيعات',
      value: salesStats ? formatCurrency(salesStats.totalRevenue) : '-',
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'عدد الطلبات',
      value: salesStats ? formatNumber(salesStats.totalOrders) : '-',
      icon: ShoppingCartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'منتجات منخفضة المخزون',
      value: salesStats ? formatNumber(salesStats.lowStockCount) : '-',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'صافي الدخل',
      value: salesStats ? formatCurrency(salesStats.netIncome) : '-',
      icon: BanknotesIcon,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37] bg-opacity-10',
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">لوحة التحكم</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">نظرة عامة على النشاط التجاري</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sales Chart */}
      <Card
        header={
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            مبيعات آخر 30 يوماً
          </h2>
        }
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesStats?.salesTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value, 'dd/MM')}
              />
              <YAxis />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: '#D4AF37' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                أحدث الطلبات
              </h2>
              <Link
                to="/admin/orders"
                className="text-sm text-[#D4AF37] hover:underline"
              >
                عرض الكل
              </Link>
            </div>
          }
        >
          <div className="space-y-4">
            {(ordersData?.data || []).slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(order.total)}
                  </p>
                  <Badge variant="info" size="sm">
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Products */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                منتجات منخفضة المخزون
              </h2>
              <Link
                to="/admin/products?stockStatus=low_stock"
                className="text-sm text-[#D4AF37] hover:underline"
              >
                عرض الكل
              </Link>
            </div>
          }
        >
          <div className="space-y-4">
            {(lowStockProducts || []).slice(0, 5).map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {product.images?.[0]?.path && (
                    <img
                      src={product.images[0].path}
                      alt={product.title?.ar || product.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {product.title?.ar || product.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.sku || product.SKU}
                    </p>
                  </div>
                </div>
                <Badge variant="warning" size="sm">
                  {product.stock} متبقي
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
