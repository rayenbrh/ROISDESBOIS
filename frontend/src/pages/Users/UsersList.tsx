import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useUsers, useDeleteUser } from '../../services/queries/userQueries';
import DataTable, { Column } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import UserForm from './UserForm';
import { User, UserFilters } from '../../types';
import { formatDate } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const UsersList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading } = useUsers(filters, page);
  const deleteMutation = useDeleteUser();

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'الاسم',
      render: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني',
    },
    {
      key: 'role',
      label: 'الدور',
      render: (user) => <Badge variant="info">{ROLE_LABELS[user.role]}</Badge>,
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (user) => (
        <Badge variant={user.isActive ? 'success' : 'danger'}>
          {user.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'آخر تسجيل دخول',
      render: (user) => user.lastLogin ? formatDate(user.lastLogin) : '-',
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (user) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingUser(user);
              setIsFormOpen(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(user._id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('تم حذف المستخدم بنجاح');
      } catch (error) {
        toast.error('فشل حذف المستخدم');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المستخدمون</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة مستخدمي النظام</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}
          icon={<PlusIcon className="h-5 w-5" />}
        >
          إضافة مستخدم
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            label="الدور"
            options={[
              { value: '', label: 'جميع الأدوار' },
              { value: 'admin', label: 'مدير' },
              { value: 'commercial', label: 'تجاري' },
              { value: 'cashier', label: 'كاشير' },
              { value: 'client', label: 'عميل' },
            ]}
            value={filters.role || ''}
            onChange={(value) => setFilters({ ...filters, role: value || undefined })}
          />
          <Input
            label="البحث"
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(user) => user._id}
          loading={isLoading}
          emptyMessage="لا يوجد مستخدمون"
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default UsersList;
