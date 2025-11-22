import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    sku: '',
    unit: 'piece',
    stock: '',
    lowStockThreshold: 10,
    isActive: true,
  });

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setFormData(data.data.product);
    } catch (error) {
      toast.error('فشل في تحميل المنتج');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/products/${id}`, formData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await api.post('/products', formData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      navigate('/products');
    } catch (error) {
      toast.error('فشل في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{id ? 'تعديل منتج' : 'إضافة منتج جديد'}</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">اسم المنتج *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">الفئة *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">السعر *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">التكلفة</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">الوحدة</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="input"
            >
              <option value="piece">قطعة</option>
              <option value="kg">كيلوجرام</option>
              <option value="meter">متر</option>
              <option value="sqm">متر مربع</option>
            </select>
          </div>
          <div>
            <label className="label">المخزون *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">حد التنبيه</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">الوصف</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={4}
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <FiSave />
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn-secondary flex items-center gap-2"
          >
            <FiX />
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
