import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../services/queries/invoiceQueries';
import DataTable, { Column } from '../../components/common/DataTable';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { Invoice, InvoiceFilters } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

const InvoicesList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<InvoiceFilters>({});

  const { data, isLoading } = useInvoices(filters, page);

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      label: 'رقم الفاتورة',
      render: (invoice) => (
        <Link to={`/admin/invoices/${invoice._id}`} className="text-[#D4AF37] hover:underline">
          {invoice.invoiceNumber}
        </Link>
      ),
    },
    {
      key: 'client',
      label: 'العميل',
      render: (invoice) => {
        const client = invoice.client as any;
        return client ? `${client.firstName} ${client.lastName}` : '-';
      },
    },
    {
      key: 'amountDue',
      label: 'المبلغ المستحق',
      render: (invoice) => formatCurrency(invoice.amountDue),
    },
    {
      key: 'amountPaid',
      label: 'المبلغ المدفوع',
      render: (invoice) => formatCurrency(invoice.amountPaid),
    },
    {
      key: 'isPaid',
      label: 'الحالة',
      render: (invoice) => (
        <Badge variant={invoice.isPaid ? 'success' : 'warning'}>
          {invoice.isPaid ? 'مدفوعة' : 'غير مدفوعة'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (invoice) => formatDate(invoice.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">الفواتير</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة الفواتير والمدفوعات</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            label="الحالة"
            options={[
              { value: '', label: 'جميع الفواتير' },
              { value: 'true', label: 'مدفوعة' },
              { value: 'false', label: 'غير مدفوعة' },
            ]}
            value={filters.isPaid !== undefined ? String(filters.isPaid) : ''}
            onChange={(value) => setFilters({ ...filters, isPaid: value ? value === 'true' : undefined })}
          />
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(invoice) => invoice._id}
          loading={isLoading}
          emptyMessage="لا توجد فواتير"
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

export default InvoicesList;
