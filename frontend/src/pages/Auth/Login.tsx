import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoginForm } from '../../types';
import { useLogin } from '../../services/queries/authQueries';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getErrorMessage } from '../../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4AF37] to-[#0E0E0E] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#D4AF37]">Les Rois des Bois</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">لوحة التحكم الإدارية</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'البريد الإلكتروني مطلوب',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'البريد الإلكتروني غير صحيح',
                },
              })}
            />

            <Input
              label="كلمة المرور"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'كلمة المرور مطلوبة',
                minLength: {
                  value: 6,
                  message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                },
              })}
            />

            <Button
              type="submit"
              fullWidth
              loading={loginMutation.isPending}
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 Les Rois des Bois. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
