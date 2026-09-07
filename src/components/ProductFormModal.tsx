import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Omit<Product, 'id'>, editId?: string | number) => Promise<void>;
  productToEdit?: Product | null;
  isSaving: boolean;
}

const PRESET_IMAGES = [
  { label: 'Ceramics', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&auto=format&fit=crop&q=80' },
  { label: 'Linen Shirt', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80' },
  { label: 'Brass Vessel', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=900&auto=format&fit=crop&q=80' },
  { label: 'Notebook', url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&auto=format&fit=crop&q=80' },
  { label: 'Diffuser', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&auto=format&fit=crop&q=80' },
  { label: 'Tableware', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900&auto=format&fit=crop&q=80' },
  { label: 'Leather Goods', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&auto=format&fit=crop&q=80' },
  { label: 'Incense', url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=900&auto=format&fit=crop&q=80' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  isSaving,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [category, setCategory] = useState('objects');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(productToEdit);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price);
      setStockQuantity(productToEdit.stock_quantity);
      setCategory(productToEdit.category.toLowerCase());
      setImageUrl(productToEdit.image_url);
      setIsFeatured(Boolean(productToEdit.is_featured));
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setStockQuantity(10);
      setCategory('objects');
      setImageUrl(PRESET_IMAGES[0].url);
      setIsFeatured(false);
    }
    setError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setError('Please enter a valid non-negative price.');
      return;
    }
    if (stockQuantity === '' || Number(stockQuantity) < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Please provide an image URL or choose a preset.');
      return;
    }

    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          stock_quantity: Number(stockQuantity),
          category,
          image_url: imageUrl.trim(),
          is_featured: isFeatured,
        },
        productToEdit?.id
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white border border-stone-300 w-full max-w-xl shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-xl text-stone-900 font-medium">
              {isEdit ? 'Edit Product Item' : 'Create New Product'}
            </h2>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              {isEdit ? `Modifying ID #${productToEdit?.id}` : 'Syncs to Database & Local Store'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
              Title / Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stoneware Serving Platter"
              className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50"
            />
          </div>

          {/* Category & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50"
              >
                <option value="objects">Objects</option>
                <option value="apparel">Apparel</option>
                <option value="stationery">Stationery</option>
                <option value="living">Living</option>
              </select>
            </div>

            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono uppercase tracking-wider text-stone-700 select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-0"
                />
                <span>Curated / Featured</span>
              </label>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="48.00"
                className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="15"
                className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50 font-mono"
              />
            </div>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
              Image URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50 font-mono"
              />
              {imageUrl && (
                <div className="w-10 h-10 border border-stone-200 overflow-hidden shrink-0 bg-stone-100">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="mt-2">
              <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1.5">
                Or pick a minimalist photo preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[10px] px-2 py-0.5 border transition-colors cursor-pointer ${
                      imageUrl === preset.url
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the materials, provenance, finish, and care instructions..."
              className="w-full px-3 py-2 text-sm border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50 leading-relaxed"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase font-mono tracking-wider text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 text-xs uppercase font-mono tracking-wider bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Processing...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
