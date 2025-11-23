import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCategories, useDeleteCategory } from '../../services/queries/categoryQueries';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import CategoryForm from './CategoryForm';
import { Category } from '../../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';

const CategoriesList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('تم حذف الفئة بنجاح');
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">الفئات</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة فئات المنتجات</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          icon={<PlusIcon className="h-5 w-5" />}
        >
          إضافة فئة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(categories || []).map((category) => (
          <Card key={category._id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {category.icon && (
                  <img src={category.icon} alt={category.name?.ar || category.name} className="w-10 h-10 rounded" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {category.name?.ar || category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setIsFormOpen(true);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'تعديل فئة' : 'إضافة فئة'}
      >
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default CategoriesList;
