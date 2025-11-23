import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUser, useUpdateUser, useCommercials } from '../../services/queries/userQueries';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import { User, UserFormData } from '../../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: commercials } = useCommercials();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      role: 'client',
      isActive: true,
    },
  });

  const role = watch('role');

  // Reset form when user changes (for editing)
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role,
        assignedCommercial: user.assignedCommercial || undefined,
        isActive: user.isActive,
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        role: 'client',
        assignedCommercial: undefined,
        isActive: true,
      });
    }
  }, [user, reset]);

  // Clear assignedCommercial when role changes away from 'client'
  useEffect(() => {
    if (role && role !== 'client') {
      setValue('assignedCommercial', undefined);
    }
  }, [role, setValue]);

  // Memoize role options to prevent re-creation on every render
  const roleOptions = useMemo(() => [
    { value: 'admin', label: 'مدير' },
    { value: 'commercial', label: 'تجاري' },
    { value: 'cashier', label: 'كاشير' },
    { value: 'client', label: 'عميل' },
  ], []);

  // Memoize commercial options
  const commercialOptions = useMemo(() => [
    { value: '', label: 'اختر تجاري' },
    ...((commercials || []).map((c) => ({
      value: c._id,
      label: `${c.firstName} ${c.lastName}`,
    }))),
  ], [commercials]);

  const onSubmit = async (data: UserFormData) => {
    // Validate that client role must have assigned commercial
    if (data.role === 'client' && !data.assignedCommercial) {
      toast.error('يجب اختيار تجاري للعميل');
      return;
    }

    try {
      if (user) {
        await updateMutation.mutateAsync({ id: user._id, data });
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('تم إضافة المستخدم بنجاح');
      }
      onClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  return (
    <form key={user?._id || 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="الاسم الأول"
          placeholder={user?.firstName || 'أدخل الاسم الأول'}
          error={errors.firstName?.message}
          {...register('firstName', { required: 'الاسم الأول مطلوب' })}
        />
        <Input
          label="الاسم الأخير"
          placeholder={user?.lastName || 'أدخل الاسم الأخير'}
          error={errors.lastName?.message}
          {...register('lastName', { required: 'الاسم الأخير مطلوب' })}
        />
      </div>

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder={user?.email || 'أدخل البريد الإلكتروني'}
        error={errors.email?.message}
        {...register('email', {
          required: 'البريد الإلكتروني مطلوب',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'البريد الإلكتروني غير صحيح',
          },
        })}
      />

      {!user && (
        <Input
          label="كلمة المرور"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: !user ? 'كلمة المرور مطلوبة' : false,
            minLength: {
              value: 6,
              message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            },
          })}
        />
      )}

      <Select
        label="الدور"
        options={roleOptions}
        value={watch('role')}
        onChange={(value) => setValue('role', value as any)}
      />

      {role === 'client' && (
        <Select
          label="التجاري المسؤول *"
          options={commercialOptions}
          value={watch('assignedCommercial') || ''}
          onChange={(value) => setValue('assignedCommercial', value)}
        />
      )}

      <Checkbox label="نشط" {...register('isActive')} />

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {user ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
