import React, { useState } from 'react';
import { useAuditLogs } from '../../services/queries/auditLogQueries';
import DataTable, { Column } from '../../components/common/DataTable';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { AuditLog } from '../../types';
import { formatDateTime } from '../../utils/format';
import { ACTION_TYPE_LABELS, RESOURCE_TYPE_LABELS } from '../../utils/constants';

const AuditLogsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({}, page);

  const columns: Column<AuditLog>[] = [
    {
      key: 'user',
      label: 'المستخدم',
      render: (log) => {
        const user = log.user as any;
        return user ? `${user.firstName} ${user.lastName}` : '-';
      },
    },
    {
      key: 'actionType',
      label: 'نوع الإجراء',
      render: (log) => (
        <Badge variant="info">{ACTION_TYPE_LABELS[log.actionType] || log.actionType}</Badge>
      ),
    },
    {
      key: 'resourceType',
      label: 'نوع المورد',
      render: (log) => (
        <Badge>{RESOURCE_TYPE_LABELS[log.resourceType] || log.resourceType}</Badge>
      ),
    },
    {
      key: 'timestamp',
      label: 'التاريخ والوقت',
      render: (log) => formatDateTime(log.timestamp),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">سجل المراجعة</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">سجل جميع العمليات في النظام</p>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(log) => log._id}
          loading={isLoading}
          emptyMessage="لا توجد سجلات"
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

export default AuditLogsList;
