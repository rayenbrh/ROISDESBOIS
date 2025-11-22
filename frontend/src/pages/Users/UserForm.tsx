import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUser, useUpdateUser, useCommercials } from '../../services/queries/userQueries';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import { User, UserFormData } from '../../types';
import toast from 'react-hot-toast';

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
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          assignedCommercial: user.assignedCommercial as string,
          isActive: user.isActive,
        }
      : {
          role: 'client',
          isActive: true,
        },
  });

  const role = watch('role');

  const onSubmit = async (data: UserFormData) => {
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
      toast.error(user ? 'فشل تحديث المستخدم' : 'فشل إضافة المستخدم');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="الاسم الأول"
          error={errors.firstName?.message}
          {...register('firstName', { required: 'الاسم الأول مطلوب' })}
        />
        <Input
          label="الاسم الأخير"
          error={errors.lastName?.message}
          {...register('lastName', { required: 'الاسم الأخير مطلوب' })}
        />
      </div>

      <Input
        label="البريد الإلكتروني"
        type="email"
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
        options={[
          { value: 'admin', label: 'مدير' },
          { value: 'commercial', label: 'تجاري' },
          { value: 'client', label: 'عميل' },
        ]}
        value={watch('role')}
        onChange={(value) => register('role').onChange({ target: { value } })}
      />

      {role === 'client' && (
        <Select
          label="التجاري المسؤول"
          options={[
            { value: '', label: 'اختر تجاري' },
            ...(commercials?.map((c) => ({
              value: c._id,
              label: `${c.firstName} ${c.lastName}`,
            })) || []),
          ]}
          value={watch('assignedCommercial') || ''}
          onChange={(value) => register('assignedCommercial').onChange({ target: { value } })}
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
