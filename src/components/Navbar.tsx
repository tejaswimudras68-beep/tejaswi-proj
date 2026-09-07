import React from 'react';
import { ShoppingBag, Search, Database, Plus, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { CategorySlug } from '../types';

interface NavbarProps {
  currentCategory: CategorySlug;
  onSelectCategory: (category: CategorySlug) => void;
  onOpenNewProductModal: () => void;
  onOpenSupabaseModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalProductsCount: number;
  viewMode: 'store' | 'admin';
  setViewMode: (mode: 'store' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenNewProductModal,
  onOpenSupabaseModal,
  searchQuery,
  onSearchChange,
  viewMode,
  setViewMode,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const [showSearch, setShowSearch] = React.useState(false);

  const categories: { label: string; slug: CategorySlug }[] = [
    { label: 'All Works', slug: 'all' },
    { label: 'Objects', slug: 'objects' },
    { label: 'Apparel', slug: 'apparel' },
    { label: 'Stationery', slug: 'stationery' },
    { label: 'Living', slug: 'living' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      {/* Top Banner with Supabase Status */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] tracking-wide">
              {isSupabaseConfigured ? 'CONNECTED TO SUPABASE POSTGRES' : 'LOCAL ENGINE • SUPABASE READY'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-300">
            <span>Complimentary shipping on orders over $100</span>
            <button
              onClick={onOpenSupabaseModal}
              className="underline underline-offset-4 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-mono"
            >
              <Database className="w-3 h-3" />
              <span>SQL / Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-baseline gap-3">
            <button
              onClick={() => {
                onSelectCategory('all');
                setViewMode('store');
              }}
              className="text-left group cursor-pointer"
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-tight text-stone-900 font-medium group-hover:opacity-75 transition-opacity">
                ATELIER
              </span>
              <span className="block text-[9px] tracking-[0.25em] text-stone-700 font-sans uppercase font-medium">
                Objects & Living
              </span>
            </button>
          </div>

          {/* Navigation Category Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((cat) => {
              const isActive = viewMode === 'store' && currentCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setViewMode('store');
                  }}
                  className={`text-sm tracking-wide transition-all cursor-pointer py-1 relative ${
                    isActive
                      ? 'text-stone-900 font-medium'
                      : 'text-stone-700 hover:text-stone-900 font-normal'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-stone-900 transition-all"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Button / Input */}
            <div className="relative">
              {showSearch ? (
                <div className="flex items-center bg-stone-100 rounded-none border border-stone-300 px-2.5 py-1.5 w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search collection..."
                    autoFocus
                    className="bg-transparent text-xs w-full text-stone-800 placeholder-stone-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setShowSearch(false);
                    }}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  title="Search products"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Store vs Admin Dashboard */}
            <button
              onClick={() => setViewMode(viewMode === 'store' ? 'admin' : 'store')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase border transition-colors cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-stone-900 text-stone-100 border-stone-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{viewMode === 'admin' ? 'Storefront View' : 'Inventory CRUD'}</span>
            </button>

            {/* Quick Add Product Button (CRUD Create) */}
            <button
              onClick={onOpenNewProductModal}
              className="flex items-center gap-1 px-3 py-1.5 text-xs tracking-wide bg-stone-100 text-stone-800 border border-stone-300 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Add New Product (Create)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Item</span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-800 hover:text-stone-900 transition-colors cursor-pointer"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] bg-stone-900 text-white font-mono text-[10px] flex items-center justify-center rounded-full px-1">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Category Bar */}
        <div className="md:hidden flex items-center gap-4 py-2.5 overflow-x-auto border-t border-stone-200/60 no-scrollbar">
          {categories.map((cat) => {
            const isActive = viewMode === 'store' && currentCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setViewMode('store');
                }}
                className={`text-xs whitespace-nowrap cursor-pointer px-2 py-1 ${
                  isActive ? 'text-stone-900 font-semibold border-b-2 border-stone-900' : 'text-stone-500'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
          <button
            onClick={() => setViewMode(viewMode === 'store' ? 'admin' : 'store')}
            className={`text-xs whitespace-nowrap cursor-pointer px-2 py-1 ml-auto font-medium ${
              viewMode === 'admin' ? 'text-stone-900 font-bold' : 'text-stone-500'
            }`}
          >
            {viewMode === 'admin' ? '← Shop' : 'Inventory CRUD →'}
          </button>
        </div>
      </div>
    </header>
  );
};
