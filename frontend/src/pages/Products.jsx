import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products?page=${page}&search=${search}&limit=10`);
      setProducts(data.data.products);
      setTotalPages(data.data.pagination.pages);
    } catch (error) {
      toast.error('فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      toast.error('فشل في حذف المنتج');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">المنتجات</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة المنتجات والمخزون</p>
        </div>
        <Link to="/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus />
          إضافة منتج جديد
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute top-3 right-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pr-10"
              placeholder="البحث عن منتج..."
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <FiFilter />
            تصفية
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد منتجات</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الفئة</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-sm text-gray-500">{product.sku}</p>
                          )}
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="font-medium text-gold-600">
                        {product.price.toLocaleString()} DZD
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            product.isLowStock ? 'badge-danger' : 'badge-success'
                          }`}
                        >
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            product.isActive ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {product.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={`/products/edit/${product._id}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-all"
                            title="تعديل"
                          >
                            <FiEdit className="text-blue-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-all"
                            title="حذف"
                          >
                            <FiTrash2 className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2">
                  صفحة {page} من {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
