import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, CheckCircle2, ShieldCheck, ArrowLeft, CreditCard } from 'lucide-react';
import { updateProduct } from '../services/productService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { cart, subtotal, clearCart } = useCart();
  const [name, setName] = useState('Eleanor Vance');
  const [email, setEmail] = useState('eleanor@atelier.studio');
  const [address, setAddress] = useState('742 Evergreen Terrace, Portland, OR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{ id: string; total: number } | null>(null);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 100;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate real stock deduction for each item in cart
      for (const item of cart) {
        const remainingStock = Math.max(0, item.product.stock_quantity - item.quantity);
        await updateProduct(item.product.id, {
          stock_quantity: remainingStock,
        });
      }

      const generatedId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setOrderSummary({
        id: generatedId,
        total: total,
      });

      clearCart();
      onOrderCompleted();
    } catch (err) {
      console.error('Order placement error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white border border-stone-300 w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {orderSummary ? (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-5">
            <div className="w-12 h-12 bg-stone-900 text-stone-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Order Received
              </span>
              <h2 className="font-serif text-2xl text-stone-900 mt-1">
                Thank You, {name.split(' ')[0]}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Order Reference: #{orderSummary.id}
              </p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Confirmation sent to:</span>
                <span className="text-stone-900">{email}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Address:</span>
                <span className="text-stone-900 truncate max-w-[200px]">{address}</span>
              </div>
              <div className="flex justify-between text-stone-600 pt-2 border-t border-stone-200">
                <span>Total Settled:</span>
                <span className="text-stone-900 font-bold">${orderSummary.total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Product inventory has been updated in your database and local state. A tracking number will be dispatched upon courier intake.
            </p>

            <button
              onClick={() => {
                setOrderSummary(null);
                onClose();
              }}
              className="w-full py-3 bg-stone-900 text-stone-100 text-xs font-mono uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              Return to Catalog
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="font-serif text-lg text-stone-900 font-normal">
                  Complete Your Order
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
              {/* Order Mini Breakdown */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-medium text-stone-800">
                    {cart.reduce((s, i) => s + i.quantity, 0)} Items in Order
                  </span>
                  <span className="block text-[10px] text-stone-500 font-light">
                    {shippingFee === 0 ? 'Free standard delivery' : '$12.00 flat rate shipping'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-semibold text-stone-900">
                    ${total.toFixed(2)}
                  </span>
                  <span className="block text-[10px] font-mono text-stone-400">USD incl. tax</span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1">
                  Shipping Destination *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:border-stone-800 bg-stone-50/50"
                />
              </div>

              {/* Payment Method Notice */}
              <div className="p-3 border border-stone-200 bg-stone-50/30 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-stone-700" />
                  <span>Sandbox Express Checkout (Zero Risk)</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-900 border border-stone-200"
                >
                  Back to Bag
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="px-6 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Authorizing...' : `Place Order • $${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
