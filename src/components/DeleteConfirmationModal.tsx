import React from 'react';
import { Product } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  product,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white border border-stone-300 w-full max-w-md shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-stone-900 font-medium">Delete Product</h3>
              <p className="text-xs text-stone-500 font-mono">ID #{product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-light">
          Are you sure you want to permanently delete{' '}
          <strong className="text-stone-900 font-medium">"{product.title}"</strong>?
          This action will execute a <code className="bg-stone-100 px-1 py-0.5 font-mono text-[11px]">DELETE</code> query on the database.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-red-700 text-white hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
