import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Edit2, Trash2, Check, Shield, Truck, RotateCcw } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white border border-stone-300 w-full max-w-4xl shadow-2xl overflow-hidden transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-xs text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Large Image Column */}
          <div className="relative aspect-square md:aspect-auto bg-stone-100 border-b md:border-b-0 md:border-r border-stone-200 overflow-hidden">
            <img
              src={product.image_url}
              alt={product.title}
              className={`w-full h-full object-cover object-center ${
                isOutOfStock ? 'grayscale opacity-75' : ''
              }`}
            />
            {product.is_featured && !isOutOfStock && (
              <span className="absolute top-4 left-4 bg-stone-900 text-stone-100 text-[10px] font-mono tracking-widest uppercase px-2.5 py-1">
                Studio Featured
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Stock */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-stone-500">
                <span>Category / {product.category}</span>
                {isOutOfStock ? (
                  <span className="text-red-700 font-semibold">Out of Stock</span>
                ) : product.stock_quantity <= 5 ? (
                  <span className="text-amber-700">Only {product.stock_quantity} remaining</span>
                ) : (
                  <span className="text-emerald-700">{product.stock_quantity} available</span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal leading-tight">
                  {product.title}
                </h1>
                <p className="font-mono text-xl text-stone-900 mt-2">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <div className="pt-3 border-t border-stone-100">
                <h2 className="text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                  Product Overview
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed font-light">
                  {product.description || 'Crafted with precision and minimal interventions to celebrate raw materials.'}
                </p>
              </div>

              {/* Minimal Specs */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-stone-600 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="text-[11px]">Archival Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="text-[11px]">Carbon Neutral</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="text-[11px]">30-Day Returns</span>
                </div>
              </div>

              {/* Quantity Selector & Add To Bag */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-3">
                  <div className="flex items-center border border-stone-300">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-medium text-stone-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-6 text-xs uppercase font-mono tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <span>Add to Bag • ${(product.price * quantity).toFixed(2)}</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Admin CRUD Quick Actions */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-stone-500">
              <span className="uppercase tracking-widest text-[10px]">Management CRUD Controls</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(product);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-400 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Product</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(product);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-red-700 hover:text-red-900 border border-red-200 hover:border-red-400 bg-red-50/50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
