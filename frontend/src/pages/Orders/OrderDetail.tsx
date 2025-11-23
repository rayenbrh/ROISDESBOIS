import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrder, useUpdateOrderStatus, useGenerateInvoice } from '../../services/queries/orderQueries';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const updateStatusMutation = useUpdateOrderStatus();
  const generateInvoiceMutation = useGenerateInvoice();
  const [newStatus, setNewStatus] = useState('');

  const handleStatusChange = async () => {
    if (!newStatus || !id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success('تم تحديث حالة الطلب');
      setNewStatus('');
    } catch (error) {
      toast.error('فشل تحديث حالة الطلب');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    try {
      await generateInvoiceMutation.mutateAsync(id);
      toast.success('تم توليد الفاتورة بنجاح');
    } catch (error) {
      toast.error('فشل توليد الفاتورة');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return <div>الطلب غير موجود</div>;
  }

  const client = order.client as any;
  const commercial = order.commercial as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            طلب {order.orderNumber}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateInvoice} loading={generateInvoiceMutation.isPending}>
            توليد فاتورة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card header={<h2 className="font-semibold">معلومات العميل</h2>}>
          <div className="space-y-2">
            <p><strong>الاسم:</strong> {client?.firstName} {client?.lastName}</p>
            <p><strong>البريد:</strong> {client?.email}</p>
          </div>
        </Card>

        <Card header={<h2 className="font-semibold">معلومات التجاري</h2>}>
          <div className="space-y-2">
            <p><strong>الاسم:</strong> {commercial?.firstName} {commercial?.lastName}</p>
            <p><strong>البريد:</strong> {commercial?.email}</p>
          </div>
        </Card>

        <Card header={<h2 className="font-semibold">تغيير الحالة</h2>}>
          <div className="space-y-2">
            <p>الحالة الحالية: <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge></p>
            <Select
              options={[
                { value: '', label: 'اختر حالة' },
                { value: 'pending', label: ORDER_STATUS_LABELS.pending },
                { value: 'confirmed', label: ORDER_STATUS_LABELS.confirmed },
                { value: 'in_production', label: ORDER_STATUS_LABELS.in_production },
                { value: 'ready', label: ORDER_STATUS_LABELS.ready },
                { value: 'delivered', label: ORDER_STATUS_LABELS.delivered },
                { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
              ]}
              value={newStatus}
              onChange={setNewStatus}
            />
            <Button
              onClick={handleStatusChange}
              fullWidth
              disabled={!newStatus}
              loading={updateStatusMutation.isPending}
            >
              تحديث الحالة
            </Button>
          </div>
        </Card>
      </div>

      <Card header={<h2 className="font-semibold">العناصر</h2>}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium">المنتج</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الكمية</th>
              <th className="px-4 py-3 text-right text-sm font-medium">السعر</th>
              <th className="px-4 py-3 text-right text-sm font-medium">المجموع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.map((item, idx) => {
              const product = item.product as any;
              return (
                <tr key={idx}>
                  <td className="px-4 py-3 text-right">{product?.title?.ar || product?.title || '-'}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>الخصم:</span>
            <span>{formatCurrency(order.remise)}</span>
          </div>
          <div className="flex justify-between">
            <span>الضريبة ({order.taxPercent}%):</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>المجموع الكلي:</span>
            <span className="text-[#D4AF37]">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetail;
