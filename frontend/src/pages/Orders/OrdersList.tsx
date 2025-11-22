import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../services/queries/orderQueries';
import DataTable, { Column } from '../../components/common/DataTable';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { Order, OrderFilters } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { getStatusColor } from '../../utils/helpers';

const OrdersList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({});

  const { data, isLoading } = useOrders(filters, page);

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: 'رقم الطلب',
      render: (order) => (
        <Link to={`/admin/orders/${order._id}`} className="text-[#D4AF37] hover:underline">
          {order.orderNumber}
        </Link>
      ),
    },
    {
      key: 'client',
      label: 'العميل',
      render: (order) => {
        const client = order.client as any;
        return client ? `${client.firstName} ${client.lastName}` : '-';
      },
    },
    {
      key: 'total',
      label: 'المجموع',
      render: (order) => formatCurrency(order.total),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (order) => (
        <Badge className={getStatusColor(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (order) => formatDate(order.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">الطلبات</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة طلبات العملاء</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            label="الحالة"
            options={[
              { value: '', label: 'جميع الحالات' },
              { value: 'pending', label: ORDER_STATUS_LABELS.pending },
              { value: 'confirmed', label: ORDER_STATUS_LABELS.confirmed },
              { value: 'in_production', label: ORDER_STATUS_LABELS.in_production },
              { value: 'ready', label: ORDER_STATUS_LABELS.ready },
              { value: 'delivered', label: ORDER_STATUS_LABELS.delivered },
              { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
            ]}
            value={filters.status || ''}
            onChange={(value) => setFilters({ ...filters, status: value || undefined })}
          />
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(order) => order._id}
          loading={isLoading}
          emptyMessage="لا توجد طلبات"
          pagination={
            data?.pagination
              ? {
                  currentPage: data.pagination.currentPage,
                  totalPages: data.pagination.totalPages,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      </Card>
    </div>
  );
};

export default OrdersList;
