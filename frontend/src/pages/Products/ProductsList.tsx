import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useProducts } from '../../services/queries/productQueries';
import { useCategories } from '../../services/queries/categoryQueries';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import MultiSelect from '../../components/common/MultiSelect';
import { formatCurrency } from '../../utils/format';
import { ProductFilters } from '../../types';

const ProductsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading } = useProducts(filters, page, 20);
  const { data: categories } = useCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المنتجات</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">إدارة المنتجات والمخزون</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products/new">
            <Button variant="secondary" icon={<PlusIcon className="h-5 w-5" />}>
              إضافة منتج عادي
            </Button>
          </Link>
          <Link to="/admin/products/special/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>
              إنشاء منتج خاص
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            label="البحث"
            placeholder="ابحث بالاسم أو SKU..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <MultiSelect
            label="الفئات"
            options={(categories || []).map((c) => ({ value: c._id, label: c.name.ar || c.name }))}
            value={filters.categories || []}
            onChange={(value) => setFilters({ ...filters, categories: value })}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200'}`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200'}`}
            >
              <ViewColumnsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
            {(data?.data || []).map((product) => (
              <Link key={product._id} to={`/admin/products/${product._id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  {product.images?.[0]?.path && (
                    <img
                      src={product.images[0].path}
                      alt={product.title?.ar || product.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {product.title?.ar || product.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku || product.SKU}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-[#D4AF37]">
                        {formatCurrency(product.price?.retail || product.retailPrice)}
                      </span>
                      <Badge variant={product.stock > 10 ? 'success' : 'warning'}>
                        {product.stock} متوفر
                      </Badge>
                    </div>
                    {product.isSpecial && (
                      <Badge variant="primary" size="sm" className="mt-2">منتج خاص</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductsList;
