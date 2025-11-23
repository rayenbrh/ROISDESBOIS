import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useSubProducts } from '../../services/queries/subProductQueries';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SubProductForm from './SubProductForm';
import { SubProduct } from '../../types';
import { formatCurrency } from '../../utils/format';

const SubProductsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubProduct, setEditingSubProduct] = useState<SubProduct | null>(null);

  const { data, isLoading } = useSubProducts(page);

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المكونات</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة مكونات المنتجات الخاصة</p>
        </div>
        <Button
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={() => {
            setEditingSubProduct(null);
            setIsFormOpen(true);
          }}
        >
          إضافة مكون
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data?.data || []).map((subProduct) => (
          <Card key={subProduct._id}>
            {subProduct.images?.[0]?.path && (
              <img
                src={subProduct.images[0].path}
                alt={subProduct.title?.ar || subProduct.title}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
            )}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {subProduct.title?.ar || subProduct.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subProduct.sku || subProduct.SKU}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                سعر إضافي: {formatCurrency(subProduct.extraPrice)}
              </span>
              <Badge variant={subProduct.stock > 10 ? 'success' : 'warning'} size="sm">
                {subProduct.stock}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubProduct(null);
        }}
        title={editingSubProduct ? 'تعديل مكون' : 'إضافة مكون'}
      >
        <SubProductForm
          subProduct={editingSubProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSubProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default SubProductsList;
