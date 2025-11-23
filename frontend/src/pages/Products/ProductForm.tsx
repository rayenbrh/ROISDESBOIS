import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useProduct, useCreateProduct, useUpdateProduct, useProducts } from '../../services/queries/productQueries';
import { useCategories } from '../../services/queries/categoryQueries';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { ProductFormData } from '../../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: product, isLoading: productLoading } = useProduct(id!);
  const { data: categories } = useCategories();
  const { data: productsData } = useProducts({}, 1, 1000); // Get all products for component selection
  const availableProducts = productsData?.data || [];
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // Track selected component products for special products
  const [componentProducts, setComponentProducts] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: isEdit && product
      ? {
          title: product.title?.ar || product.title || '',
          description: product.description?.ar || product.description || '',
          SKU: product.sku || product.SKU || '',
          retailPrice: product.price?.retail || product.retailPrice || 0,
          costPrice: product.cost || product.costPrice || 0,
          bulkPrices: product.price?.bulkPrices || [],
          stock: product.stock || 0,
          stockPolicy: product.stockPolicy || 'track',
          categories: (product.categories as any[])?.map((c: any) => c._id || c) || [],
          images: [],
          isSpecial: product.isSpecial || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
        }
      : {
          bulkPrices: [],
          stockPolicy: 'track',
          categories: [],
          images: [],
          isSpecial: false,
          isActive: true,
        },
  });

  const { fields: bulkPriceFields, append: appendBulkPrice, remove: removeBulkPrice } = useFieldArray({
    control,
    name: 'bulkPrices',
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('تم إضافة المنتج بنجاح');
      }
      navigate('/admin/products');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'تعديل منتج' : 'إضافة منتج'}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {isEdit ? 'تحديث معلومات المنتج' : 'إضافة منتج جديد'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card header={<h2 className="font-semibold">المعلومات الأساسية</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم المنتج"
              error={errors.title?.message}
              {...register('title', { required: 'اسم المنتج مطلوب' })}
            />

            <Input
              label="رمز SKU"
              error={errors.SKU?.message}
              {...register('SKU', { required: 'رمز SKU مطلوب' })}
            />
          </div>

          <Textarea
            label="الوصف"
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />

          <MultiSelect
            label="الفئات"
            options={(categories || []).map((c) => ({
              value: c._id,
              label: c.name?.ar || c.name
            }))}
            value={watch('categories') || []}
            onChange={(value) => setValue('categories', value)}
          />
        </Card>

        {/* Pricing */}
        <Card header={<h2 className="font-semibold">التسعير</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="سعر البيع"
              type="number"
              step="0.01"
              error={errors.retailPrice?.message}
              {...register('retailPrice', {
                required: 'سعر البيع مطلوب',
                valueAsNumber: true,
                min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكثر' }
              })}
            />

            <Input
              label="سعر التكلفة"
              type="number"
              step="0.01"
              error={errors.costPrice?.message}
              {...register('costPrice', {
                valueAsNumber: true,
                min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكثر' }
              })}
            />
          </div>

          {/* Bulk Prices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                أسعار الجملة
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<PlusIcon className="h-4 w-4" />}
                onClick={() => appendBulkPrice({ minQty: 1, price: 0 })}
              >
                إضافة سعر
              </Button>
            </div>

            {bulkPriceFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  label="الكمية الأدنى"
                  type="number"
                  {...register(`bulkPrices.${index}.minQty` as const, {
                    valueAsNumber: true,
                    min: { value: 1, message: 'الكمية يجب أن تكون 1 أو أكثر' }
                  })}
                />
                <Input
                  label="السعر"
                  type="number"
                  step="0.01"
                  {...register(`bulkPrices.${index}.price` as const, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكثر' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => removeBulkPrice(index)}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Stock */}
        <Card header={<h2 className="font-semibold">المخزون</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الكمية المتاحة"
              type="number"
              error={errors.stock?.message}
              {...register('stock', {
                valueAsNumber: true,
                min: { value: 0, message: 'الكمية يجب أن تكون 0 أو أكثر' }
              })}
            />

            <Select
              label="سياسة المخزون"
              options={[
                { value: 'track', label: 'تتبع المخزون' },
                { value: 'unlimited', label: 'غير محدود' },
                { value: 'backorder', label: 'السماح بالطلب المسبق' },
              ]}
              value={watch('stockPolicy')}
              onChange={(value) => setValue('stockPolicy', value as any)}
            />
          </div>
        </Card>

        {/* Images */}
        <Card header={<h2 className="font-semibold">الصور</h2>}>
          <FileUpload
            label="صور المنتج"
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            multiple={true}
            value={watch('images') || []}
            onChange={(files) => setValue('images', files)}
          />
        </Card>

        {/* Status */}
        <Card header={<h2 className="font-semibold">الحالة</h2>}>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                منتج نشط
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isSpecial')}
                className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                منتج خاص (مكون من منتجات أخرى)
              </span>
            </label>
          </div>
        </Card>

        {/* Component Products - Only shown for special products */}
        {watch('isSpecial') && (
          <Card header={<h2 className="font-semibold">مكونات المنتج الخاص</h2>}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                اختر المنتجات التي يتكون منها هذا المنتج الخاص
              </p>
              <MultiSelect
                label="المنتجات المكونة"
                options={availableProducts
                  .filter(p => p._id !== id) // Exclude current product when editing
                  .map((p) => ({
                    value: p._id,
                    label: (p.title as any)?.ar || p.title || p.SKU || 'منتج بدون اسم'
                  }))}
                value={componentProducts}
                onChange={setComponentProducts}
              />
              {componentProducts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المنتجات المحددة ({componentProducts.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {componentProducts.map((productId) => {
                      const product = availableProducts.find(p => p._id === productId);
                      return (
                        <span
                          key={productId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37] bg-opacity-10 text-[#D4AF37] rounded-full text-sm"
                        >
                          {(product?.title as any)?.ar || product?.title || product?.SKU}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/products')}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'تحديث المنتج' : 'إضافة المنتج'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
