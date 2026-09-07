import React from 'react';
import { useCart } from '../context/CartContext';
import { Check, Info } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-stone-900 text-stone-100 px-4 py-3 border border-stone-700 shadow-xl flex items-center gap-3 text-xs font-mono">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{notification}</span>
      </div>
    </div>
  );
};
