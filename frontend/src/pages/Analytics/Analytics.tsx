import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSalesStats, useTopProducts, useTopClients, useCategoryStats } from '../../services/queries/analyticsQueries';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatNumber } from '../../utils/format';
import { CHART_COLORS } from '../../utils/constants';

const Analytics: React.FC = () => {
  const { data: salesStats, isLoading: statsLoading } = useSalesStats();
  const { data: topProducts } = useTopProducts(10);
  const { data: topClients } = useTopClients(10);
  const { data: categoryStats } = useCategoryStats();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">التحليلات</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">تحليل أداء المبيعات والمنتجات</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبيعات</p>
          <p className="mt-2 text-2xl font-bold text-[#D4AF37]">
            {salesStats ? formatCurrency(salesStats.totalRevenue) : '-'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">عدد الطلبات</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {salesStats ? formatNumber(salesStats.totalOrders) : '-'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">متوسط قيمة الطلب</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {salesStats ? formatCurrency(salesStats.avgOrderValue) : '-'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">صافي الدخل</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {salesStats ? formatCurrency(salesStats.netIncome) : '-'}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h2 className="font-semibold">أفضل المنتجات</h2>}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product.title" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card header={<h2 className="font-semibold">توزيع الفئات</h2>}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="revenue"
                  nameKey="category.name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryStats?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
