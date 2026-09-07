/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Product, CategorySlug } from './types';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProductsToDatabase,
} from './services/productService';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AdminProductManager } from './components/AdminProductManager';
import { NotificationToast } from './components/NotificationToast';
import { Plus, SlidersHorizontal, Database, Sparkles, RefreshCw, Layers, ArrowRight } from 'lucide-react';

function StoreApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<CategorySlug>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { showNotification, setIsCartOpen } = useCart();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchProducts(category, searchQuery);
      setProducts(res.data);
      setDataSource(res.source);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // CRUD: Create or Update Product
  const handleSaveProduct = async (
    productData: Omit<Product, 'id'>,
    editId?: string | number
  ) => {
    setIsSaving(true);
    try {
      if (editId) {
        // Update (U in CRUD)
        const result = await updateProduct(editId, productData);
        setProducts((prev) =>
          prev.map((item) => (String(item.id) === String(editId) ? result.product : item))
        );
        showNotification(`Updated "${result.product.title}"`);
      } else {
        // Create (C in CRUD)
        const result = await createProduct(productData);
        setProducts((prev) => [result.product, ...prev]);
        showNotification(`Created "${result.product.title}"`);
      }
      setIsFormModalOpen(false);
      setProductToEdit(null);
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  // CRUD: Delete Product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((item) => String(item.id) !== String(productToDelete.id)));
      showNotification(`Deleted "${productToDelete.title}"`);
      setProductToDelete(null);
      if (selectedProduct && String(selectedProduct.id) === String(productToDelete.id)) {
        setSelectedProduct(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal
  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  // Open Create Modal
  const handleCreateClick = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  // Sync / Seed curated products
  const handleSyncProducts = async () => {
    setIsSyncing(true);
    try {
      const res = await seedProductsToDatabase();
      if (res.success) {
        showNotification(`Synced ${res.count} curated items into the catalog.`);
        await loadProducts();
      } else {
        alert(res.error || 'Failed to sync products');
      }
    } catch (err: any) {
      alert(err.message || 'Error syncing items');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentCategory={category}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setViewMode('store');
        }}
        onOpenNewProductModal={handleCreateClick}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalProductsCount={products.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {viewMode === 'admin' ? (
          /* ADMIN CRUD INVENTORY VIEW */
          <AdminProductManager
            products={products}
            onOpenCreateModal={handleCreateClick}
            onEditProduct={handleEditClick}
            onDeleteProduct={(p) => setProductToDelete(p)}
            onViewProduct={(p) => setSelectedProduct(p)}
            onSyncProducts={handleSyncProducts}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            isSyncing={isSyncing}
          />
        ) : (
          /* STOREFRONT VIEW */
          <div className="space-y-10">
            {/* Minimal Hero / Archetype Intro */}
            <div className="border-b border-stone-200/90 pb-8 sm:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-600 block mb-2">
                  Permanent Collection / Edition 2026
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 font-normal tracking-tight leading-[1.15]">
                  Utilitarian tools designed for deliberate living.
                </h1>
                <p className="text-sm text-stone-600 font-light mt-3 leading-relaxed max-w-xl">
                  Each piece balances honest industrial materials—heavy linen, cold brass, high-fire stoneware, and unbleached cotton—with functional longevity.
                </p>
              </div>

              {/* Quick Filter & Add Pill */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateClick}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Category & Status Bar */}
            <div className="flex items-center justify-between gap-4 text-xs font-mono text-stone-500">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider text-stone-800 font-medium">
                  {category === 'all' ? 'Entire Archive' : `Category: ${category}`}
                </span>
                <span>•</span>
                <span>{products.length} {products.length === 1 ? 'object' : 'objects'}</span>
                {searchQuery && (
                  <>
                    <span>•</span>
                    <span className="text-stone-800">matching "{searchQuery}"</span>
                  </>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="py-24 text-center space-y-3 font-mono text-xs text-stone-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-400" />
                <p>Retrieving catalog records...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center space-y-4 border border-dashed border-stone-300 p-8">
                <div className="font-serif text-xl text-stone-700">No objects found</div>
                <p className="text-xs text-stone-500 max-w-sm mx-auto font-light leading-relaxed">
                  There are no products currently matching the selected criteria. You can create a new product item or reset the archive.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleCreateClick}
                    className="px-4 py-2 bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors"
                  >
                    Add First Item
                  </button>
                  <button
                    onClick={() => {
                      setCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-mono uppercase tracking-wider hover:border-stone-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={(p) => setSelectedProduct(p)}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Minimalist Store Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-stone-100/50 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <span className="font-serif text-lg text-stone-900 tracking-wider">
                ATELIER
              </span>
              <span className="hidden sm:inline text-stone-300">|</span>
              <span className="text-stone-500 text-xs font-light">
                Everyday objects, refined apparel & considered living.
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-stone-500 font-light">
              <span>Complimentary worldwide shipping on orders over $100</span>
              <span className="text-stone-300">•</span>
              <span>© {new Date().getFullYear()} Atelier. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleSaveProduct}
        productToEdit={productToEdit}
        isSaving={isSaving}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={(p) => {
          setSelectedProduct(null);
          handleEditClick(p);
        }}
        onDelete={(p) => {
          setSelectedProduct(null);
          setProductToDelete(p);
        }}
      />

      <DeleteConfirmationModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <CartDrawer
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={() => {
          loadProducts();
          showNotification('Order placed! Inventory updated.');
        }}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onResetProducts={loadProducts}
      />

      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <StoreApp />
    </CartProvider>
  );
}
