import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 100;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 12;
  const estimatedTax = subtotal * 0.08;
  const orderTotal = subtotal + shippingFee + estimatedTax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-stone-800" />
              <h2 className="font-serif text-lg text-stone-900">Your Shopping Bag</h2>
              <span className="font-mono text-xs text-stone-400">
                ({cart.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Bar */}
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-200/70 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-stone-600 font-light">
                Add{' '}
                <span className="font-mono font-medium text-stone-900">
                  ${remainingForFreeShipping.toFixed(2)}
                </span>{' '}
                more for complimentary standard delivery.
              </p>
            ) : (
              <p className="text-stone-900 font-medium flex items-center gap-1.5 font-mono text-[11px]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                You have qualified for complimentary delivery.
              </p>
            )}
            <div className="w-full bg-stone-200 h-1 mt-2 overflow-hidden">
              <div
                className="bg-stone-900 h-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              ></div>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-3 py-16">
                <ShoppingBag className="w-10 h-10 stroke-1 text-stone-300" />
                <p className="font-serif text-lg text-stone-600">Your bag is empty</p>
                <p className="text-xs text-stone-400 max-w-xs font-light">
                  Browse our curated collection of objects, garments, and daily stationery.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 border border-stone-900 text-stone-900 text-xs uppercase font-mono tracking-wider hover:bg-stone-900 hover:text-white transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 pb-6 border-b border-stone-100 last:border-0"
                >
                  <div className="w-20 h-24 bg-stone-100 shrink-0 border border-stone-200 overflow-hidden">
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-sm text-stone-900 font-normal leading-snug">
                          {item.product.title}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mt-0.5">
                        {item.product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs text-stone-900 font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer / Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50/50 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="font-mono text-stone-900">
                    {shippingFee === 0 ? 'Complimentary' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono text-stone-900">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-medium text-sm text-stone-900">
                  <span>Total Due</span>
                  <span className="font-mono">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3 px-4 bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex justify-between items-center text-[11px] text-stone-400">
                  <span>Taxes calculated at dispatch</span>
                  <button
                    onClick={clearCart}
                    className="hover:text-stone-700 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Clear bag
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
