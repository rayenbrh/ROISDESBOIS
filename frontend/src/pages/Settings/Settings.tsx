import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSettings, useUpdateSettings } from '../../services/queries/settingsQueries';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { SettingsFormData } from '../../types';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'invoice'>('company');
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    values: settings,
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success('تم تحديث الإعدادات بنجاح');
    } catch (error) {
      toast.error('فشل تحديث الإعدادات');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">الإعدادات</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة إعدادات النظام</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'company'
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          معلومات الشركة
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'invoice'
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          إعدادات الفاتورة
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab === 'company' && (
          <Card>
            <div className="space-y-4">
              <Input
                label="اسم الشركة"
                error={errors.companyName?.message}
                {...register('companyName', { required: 'اسم الشركة مطلوب' })}
              />
              <Input
                label="الهاتف"
                error={errors.phone?.message}
                {...register('phone', { required: 'رقم الهاتف مطلوب' })}
              />
              <Textarea
                label="العنوان"
                error={errors.address?.message}
                {...register('address', { required: 'العنوان مطلوب' })}
                rows={3}
              />
              <Input
                label="الرقم الضريبي"
                error={errors.taxNumber?.message}
                {...register('taxNumber')}
              />
              <Input
                label="نسبة الضريبة (%)"
                type="number"
                step="0.01"
                error={errors.taxPercent?.message}
                {...register('taxPercent', {
                  required: 'نسبة الضريبة مطلوبة',
                  valueAsNumber: true,
                })}
              />
              <Input
                label="العملة"
                error={errors.currency?.message}
                {...register('currency', { required: 'العملة مطلوبة' })}
              />
              <FileUpload
                label="شعار الشركة"
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                multiple={false}
                value={watch('logo') ? [watch('logo')!] : []}
                onChange={(files) => setValue('logo', files[0])}
              />
            </div>
          </Card>
        )}

        {activeTab === 'invoice' && (
          <Card>
            <div className="space-y-4">
              <Textarea
                label="تذييل الفاتورة"
                placeholder="نص يظهر في أسفل الفاتورة..."
                {...register('invoiceFooter')}
                rows={5}
              />
            </div>
          </Card>
        )}

        <div className="mt-6">
          <Button type="submit" loading={updateMutation.isPending}>
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
