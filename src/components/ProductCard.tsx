import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Edit2, Eye, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onEdit,
}) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(product);
  };

  return (
    <article
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white border border-stone-200/90 transition-all duration-300 hover:border-stone-400 hover:shadow-xs cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
        />

        {/* Featured Badge */}
        {product.is_featured && !isOutOfStock && (
          <span className="absolute top-3 left-3 bg-stone-900 text-stone-100 text-[10px] font-mono tracking-widest uppercase px-2 py-0.5">
            Curated
          </span>
        )}

        {/* Out of Stock Ribbon */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-stone-900 text-stone-100 font-mono text-xs uppercase tracking-widest px-3 py-1">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Action Overlay (Desktop) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEditClick}
            title="Edit product (CRUD)"
            className="p-2 bg-white/95 text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs transition-colors border border-stone-200"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            title="Inspect item"
            className="p-2 bg-white/95 text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs transition-colors border border-stone-200"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-stone-600 mb-1.5">
            <span>{product.category}</span>
            {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
              <span className="text-amber-700">Only {product.stock_quantity} left</span>
            )}
          </div>
          <h3 className="font-serif text-base text-stone-900 font-normal leading-snug line-clamp-1 group-hover:text-stone-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 mt-1 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <span className="font-mono text-sm text-stone-900 font-medium">
            ${Number(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100'
                : justAdded
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
