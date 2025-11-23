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
    watch,
    setValue,
    reset,
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get form values
    const firstName = watch('firstName');
    const lastName = watch('lastName');
    const email = watch('email');
    const password = watch('password');
    const currentRole = watch('role');
    const assignedCommercial = watch('assignedCommercial');
    const isActive = watch('isActive');

    // Validate required fields
    if (!firstName || !firstName.trim()) {
      toast.error('الاسم الأول مطلوب');
      return;
    }
    if (!lastName || !lastName.trim()) {
      toast.error('الاسم الأخير مطلوب');
      return;
    }
    if (!email || !email.trim()) {
      toast.error('البريد الإلكتروني مطلوب');
      return;
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      toast.error('البريد الإلكتروني غير صحيح');
      return;
    }

    // Validate password for new users
    if (!user && (!password || password.length < 6)) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    // Validate that client role must have assigned commercial
    if (currentRole === 'client' && !assignedCommercial) {
      toast.error('يجب اختيار تجاري للعميل');
      return;
    }

    const data: UserFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role: currentRole,
      assignedCommercial,
      isActive: isActive ?? true,
      ...(password && { password }),
    };

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
    <form key={user?._id || 'new'} onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="الاسم الأول"
          placeholder="أدخل الاسم الأول"
          value={watch('firstName') || ''}
          onChange={(e) => setValue('firstName', e.target.value)}
        />
        <Input
          label="الاسم الأخير"
          placeholder="أدخل الاسم الأخير"
          value={watch('lastName') || ''}
          onChange={(e) => setValue('lastName', e.target.value)}
        />
      </div>

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="أدخل البريد الإلكتروني"
        value={watch('email') || ''}
        onChange={(e) => setValue('email', e.target.value)}
      />

      {!user && (
        <Input
          label="كلمة المرور"
          type="password"
          placeholder="أدخل كلمة المرور"
          {...register('password')}
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
