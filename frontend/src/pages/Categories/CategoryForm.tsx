import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateCategory, useUpdateCategory } from '../../services/queries/categoryQueries';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Category, CategoryFormData } from '../../types';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: category
      ? {
          name: (category.name as any)?.ar || category.name || '',
          slug: '',
        }
      : {},
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Auto-generate slug from name
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Keep only letters, numbers, Arabic chars, spaces, and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      const categoryData = {
        ...data,
        slug: slug || data.name, // Fallback to name if slug is empty
      };

      if (category) {
        await updateMutation.mutateAsync({ id: category._id, data: categoryData });
        toast.success('تم تحديث الفئة بنجاح');
      } else {
        await createMutation.mutateAsync(categoryData);
        toast.success('تم إضافة الفئة بنجاح');
      }
      onClose();
    } catch (error) {
      toast.error(category ? 'فشل تحديث الفئة' : 'فشل إضافة الفئة');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="اسم الفئة"
        placeholder="أدخل اسم الفئة"
        error={errors.name?.message}
        {...register('name', { required: 'اسم الفئة مطلوب' })}
      />

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {category ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
