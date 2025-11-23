import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateSubProduct, useUpdateSubProduct } from '../../services/queries/subProductQueries';
import Input from '../../components/common/Input';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import { SubProduct, SubProductFormData } from '../../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';

interface SubProductFormProps {
  subProduct?: SubProduct | null;
  onClose: () => void;
}

const SubProductForm: React.FC<SubProductFormProps> = ({ subProduct, onClose }) => {
  const createMutation = useCreateSubProduct();
  const updateMutation = useUpdateSubProduct();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubProductFormData>({
    defaultValues: subProduct
      ? {
          title: subProduct.title?.ar || subProduct.title,
          SKU: subProduct.sku || subProduct.SKU,
          extraPrice: subProduct.extraPrice,
          stock: subProduct.stock,
          images: [],
        }
      : {
          extraPrice: 0,
          stock: 0,
          images: [],
        },
  });

  const onSubmit = async (data: SubProductFormData) => {
    try {
      if (subProduct) {
        await updateMutation.mutateAsync({ id: subProduct._id, data });
        toast.success('تم تحديث المكون بنجاح');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('تم إضافة المكون بنجاح');
      }
      onClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="اسم المكون"
        error={errors.title?.message}
        {...register('title', { required: 'اسم المكون مطلوب' })}
      />

      <Input
        label="رمز SKU"
        error={errors.SKU?.message}
        {...register('SKU')}
      />

      <Input
        label="السعر الإضافي"
        type="number"
        step="0.01"
        error={errors.extraPrice?.message}
        {...register('extraPrice', {
          required: 'السعر الإضافي مطلوب',
          valueAsNumber: true,
          min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكثر' }
        })}
      />

      <Input
        label="المخزون"
        type="number"
        error={errors.stock?.message}
        {...register('stock', {
          required: 'المخزون مطلوب',
          valueAsNumber: true,
          min: { value: 0, message: 'المخزون يجب أن يكون 0 أو أكثر' }
        })}
      />

      <FileUpload
        label="صور المكون"
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
        multiple={true}
        value={watch('images') || []}
        onChange={(files) => setValue('images', files)}
      />

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {subProduct ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
};

export default SubProductForm;
