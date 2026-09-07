import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Trash2, Search, ArrowUpDown, Filter, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminProductManagerProps {
  products: Product[];
  onOpenCreateModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const AdminProductManager: React.FC<AdminProductManagerProps> = ({
  products,
  onOpenCreateModal,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'title' | 'price' | 'stock'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filtered = products
    .filter((p) => {
      if (filterCategory !== 'all' && p.category.toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          String(p.id).includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'stock') {
        comparison = a.stock_quantity - b.stock_quantity;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: 'title' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-stone-600 block">
            Inventory Management (Level 4 CRUD)
          </span>
          <h1 className="font-serif text-2xl text-stone-900 font-normal mt-0.5">
            Products Catalog Operations
          </h1>
          <p className="text-xs text-stone-600 font-light mt-1">
            Perform Create, Read, Update, and Delete operations on products with immediate database persistence.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-stone-200 px-3 py-2">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by title, description, or ID..."
            className="w-full text-xs text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-stone-200 bg-white text-xs text-stone-800 px-2 py-1.5 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="objects">Objects</option>
              <option value="apparel">Apparel</option>
              <option value="stationery">Stationery</option>
              <option value="living">Living</option>
            </select>
          </div>

          <span className="text-xs font-mono text-stone-600">
            {filtered.length} of {products.length} entries
          </span>
        </div>
      </div>

      {/* Minimalist Data Table */}
      <div className="border border-stone-200 bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 font-mono text-[11px] uppercase tracking-wider text-stone-600">
              <th className="py-3 px-4 w-12 text-center">ID</th>
              <th className="py-3 px-4 w-16">Image</th>
              <th
                onClick={() => toggleSort('title')}
                className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Product Title</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th
                onClick={() => toggleSort('price')}
                className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('stock')}
                className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Stock</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions (CRUD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-light text-stone-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-600 font-mono">
                  No products matching current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isOutOfStock = item.stock_quantity <= 0;
                return (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-stone-600">
                      #{item.id}
                    </td>
                    <td className="py-2 px-4">
                      <div className="w-10 h-10 border border-stone-200 bg-stone-100 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-serif text-stone-900 text-sm font-normal">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-stone-600 line-clamp-1 max-w-xs font-light">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-900 font-medium">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={
                          item.stock_quantity <= 3
                            ? 'text-amber-800 font-semibold'
                            : 'text-stone-700'
                        }
                      >
                        {item.stock_quantity} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-red-800 bg-red-50 border border-red-200 px-2 py-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Depleted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProduct(item)}
                          title="Preview"
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditProduct(item)}
                          title="Edit (Update)"
                          className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(item)}
                          title="Delete (Remove)"
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
