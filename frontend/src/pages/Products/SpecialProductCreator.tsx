import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCreateProduct } from '../../services/queries/productQueries';
import { useCategories } from '../../services/queries/categoryQueries';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import MultiSelect from '../../components/common/MultiSelect';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';
import { getErrorMessage, uploadFiles } from '../../services/api';
import { CheckIcon } from '@heroicons/react/24/outline';

interface CombinationImage {
  product1ImageIndex: number;
  product2ImageIndex: number;
  uploadedImage: File | null;
  previewUrl: string | null;
}

const SpecialProductCreator: React.FC = () => {
  const navigate = useNavigate();
  const { data: productsData } = useProducts({}, 1, 1000);
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();

  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Product selection
  const [selectedProduct1, setSelectedProduct1] = useState<string>('');
  const [selectedProduct2, setSelectedProduct2] = useState<string>('');

  // Combination images
  const [combinationImages, setCombinationImages] = useState<CombinationImage[]>([]);

  const availableProducts = (productsData?.data || []).filter(p => !p.isSpecial);

  const product1 = availableProducts.find(p => p._id === selectedProduct1);
  const product2 = availableProducts.find(p => p._id === selectedProduct2);

  // Generate all combinations when both products are selected
  React.useEffect(() => {
    if (product1 && product2) {
      const product1Images = (product1.images as any[]) || [];
      const product2Images = (product2.images as any[]) || [];

      const combinations: CombinationImage[] = [];
      for (let i = 0; i < product1Images.length; i++) {
        for (let j = 0; j < product2Images.length; j++) {
          combinations.push({
            product1ImageIndex: i,
            product2ImageIndex: j,
            uploadedImage: null,
            previewUrl: null,
          });
        }
      }
      setCombinationImages(combinations);
    } else {
      setCombinationImages([]);
    }
  }, [selectedProduct1, selectedProduct2]);

  const handleCombinationImageUpload = (comboIndex: number, file: File) => {
    const updated = [...combinationImages];
    updated[comboIndex].uploadedImage = file;
    updated[comboIndex].previewUrl = URL.createObjectURL(file);
    setCombinationImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error('اسم المنتج مطلوب');
      return;
    }
    if (!sku.trim()) {
      toast.error('رمز SKU مطلوب');
      return;
    }
    if (!selectedProduct1 || !selectedProduct2) {
      toast.error('يجب اختيار منتجين');
      return;
    }
    if (combinationImages.some(c => !c.uploadedImage)) {
      toast.error('يجب رفع صورة لكل تركيبة');
      return;
    }

    try {
      // Upload all combination images
      const imageFiles = combinationImages.map(c => c.uploadedImage!);
      const uploadedImages = await uploadFiles(imageFiles, 'image');

      // Create product with combination metadata
      const productData = {
        title,
        description,
        SKU: sku,
        retailPrice: parseFloat(retailPrice) || 0,
        costPrice: 0,
        bulkPrices: [],
        stock: parseInt(stock) || 0,
        stockPolicy: 'track' as const,
        categories: selectedCategories,
        images: imageFiles,
        isSpecial: true,
        isActive: true,
        componentGroups: [
          {
            componentKey: 'component1',
            label: (product1?.title as any)?.ar || product1?.title || 'المكون الأول',
            subProducts: [selectedProduct1],
            required: true,
          },
          {
            componentKey: 'component2',
            label: (product2?.title as any)?.ar || product2?.title || 'المكون الثاني',
            subProducts: [selectedProduct2],
            required: true,
          },
        ],
        combinationImages: combinationImages.map((combo, index) => ({
          combination: {
            component1: `${selectedProduct1}_image_${combo.product1ImageIndex}`,
            component2: `${selectedProduct2}_image_${combo.product2ImageIndex}`,
          },
          imageUrl: uploadedImages[index].path,
        })),
      };

      await createMutation.mutateAsync(productData);
      toast.success('تم إنشاء المنتج الخاص بنجاح');
      navigate('/admin/products');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const getProduct1ImageUrl = (index: number) => {
    const images = (product1?.images as any[]) || [];
    const image = images[index];
    if (!image) return '';
    return typeof image === 'string' ? image : image.path || '';
  };

  const getProduct2ImageUrl = (index: number) => {
    const images = (product2?.images as any[]) || [];
    const image = images[index];
    if (!image) return '';
    return typeof image === 'string' ? image : image.path || '';
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          إنشاء منتج خاص
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          اختر منتجين ثم قم برفع صور التركيبات المختلفة
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card header={<h2 className="font-semibold">المعلومات الأساسية</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم المنتج الخاص"
              placeholder="مثل: طاولة قابلة للتخصيص"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="رمز SKU"
              placeholder="مثل: TABLE-001"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <Textarea
            label="الوصف"
            placeholder="وصف المنتج الخاص"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="السعر"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
            />

            <Input
              label="الكمية المتاحة"
              type="number"
              placeholder="200"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <MultiSelect
              label="الفئات"
              options={(categories || []).map((c) => ({
                value: c._id,
                label: (c.name as any)?.ar || c.name
              }))}
              value={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>
        </Card>

        {/* Split Screen: Product Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Product 1 */}
          <Card header={<h2 className="font-semibold">المنتج الأول</h2>}>
            <div className="space-y-4">
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100"
                value={selectedProduct1}
                onChange={(e) => setSelectedProduct1(e.target.value)}
              >
                <option value="">اختر المنتج الأول</option>
                {availableProducts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {(p.title as any)?.ar || p.title || p.SKU}
                  </option>
                ))}
              </select>

              {product1 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الصور المتاحة ({((product1.images as any[]) || []).length}):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {((product1.images as any[]) || []).map((img: any, index: number) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={typeof img === 'string' ? img : img.path || ''}
                          alt={`خيار ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Right: Product 2 */}
          <Card header={<h2 className="font-semibold">المنتج الثاني</h2>}>
            <div className="space-y-4">
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100"
                value={selectedProduct2}
                onChange={(e) => setSelectedProduct2(e.target.value)}
              >
                <option value="">اختر المنتج الثاني</option>
                {availableProducts
                  .filter(p => p._id !== selectedProduct1)
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {(p.title as any)?.ar || p.title || p.SKU}
                    </option>
                  ))}
              </select>

              {product2 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الصور المتاحة ({((product2.images as any[]) || []).length}):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {((product2.images as any[]) || []).map((img: any, index: number) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={typeof img === 'string' ? img : img.path || ''}
                          alt={`خيار ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Combinations Matrix */}
        {combinationImages.length > 0 && (
          <Card header={
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">التركيبات الممكنة</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {combinationImages.filter(c => c.uploadedImage).length} / {combinationImages.length} مكتملة
              </span>
            </div>
          }>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 قم برفع صورة النتيجة النهائية لكل تركيبة (الجمع بين الصورتين)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {combinationImages.map((combo, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      combo.uploadedImage
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        تركيبة #{index + 1}
                      </h3>
                      {combo.uploadedImage && (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>

                    {/* Show the two component images side by side */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="aspect-square rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={getProduct1ImageUrl(combo.product1ImageIndex)}
                          alt="مكون 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={getProduct2ImageUrl(combo.product2ImageIndex)}
                          alt="مكون 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Upload or preview result image */}
                    {combo.previewUrl ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500">
                        <img
                          src={combo.previewUrl}
                          alt="النتيجة النهائية"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...combinationImages];
                            updated[index].uploadedImage = null;
                            updated[index].previewUrl = null;
                            setCombinationImages(updated);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                        >
                          تغيير
                        </button>
                      </div>
                    ) : (
                      <FileUpload
                        label="صورة النتيجة النهائية"
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                        multiple={false}
                        value={[]}
                        onChange={(files) => {
                          if (files[0]) {
                            handleCombinationImageUpload(index, files[0]);
                          }
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/products')}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={!title || !sku || !selectedProduct1 || !selectedProduct2 || combinationImages.some(c => !c.uploadedImage)}
          >
            إنشاء المنتج الخاص
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SpecialProductCreator;
