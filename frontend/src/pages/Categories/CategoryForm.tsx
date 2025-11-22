import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateCategory, useUpdateCategory, useCategories } from '../../services/queries/categoryQueries';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FileUpload from '../../components/common/FileUpload';
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
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          parentCategory: category.parentCategory as string,
        }
      : {},
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category._id, data });
        toast.success('تم تحديث الفئة بنجاح');
      } else {
        await createMutation.mutateAsync(data);
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
        error={errors.name?.message}
        {...register('name', { required: 'اسم الفئة مطلوب' })}
      />

      <Input
        label="الرمز (Slug)"
        error={errors.slug?.message}
        {...register('slug', { required: 'الرمز مطلوب' })}
      />

      <Select
        label="الفئة الأم (اختياري)"
        options={[
          { value: '', label: 'لا يوجد' },
          ...(categories
            ?.filter((c) => c._id !== category?._id)
            .map((c) => ({ value: c._id, label: c.name })) || []),
        ]}
        value={watch('parentCategory') || ''}
        onChange={(value) => setValue('parentCategory', value || undefined)}
      />

      <FileUpload
        label="أيقونة الفئة"
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
        multiple={false}
        value={watch('icon') ? [watch('icon')!] : []}
        onChange={(files) => setValue('icon', files[0])}
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
