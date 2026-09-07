import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

const LOCAL_STORAGE_KEY = 'atelier_ecommerce_products';

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length < INITIAL_PRODUCTS.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return parsed;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  }
}

export interface ProductsResponse {
  data: Product[];
  source: 'supabase' | 'local';
  error?: string;
}

export async function fetchProducts(category?: string, searchTerm?: string): Promise<ProductsResponse> {
  // If Supabase is connected, attempt remote fetch
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category.toLowerCase());
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetch failed, falling back to local store:', error.message);
      } else if (data) {
        return { data: data as Product[], source: 'supabase' };
      }
    } catch (err: any) {
      console.warn('Supabase exception, falling back to local store:', err.message);
    }
  }

  // Fallback to local storage persistence
  let products = getLocalProducts();

  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    products = products.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    );
  }

  return { data: products, source: 'local' };
}

export async function createProduct(newProduct: Omit<Product, 'id'>): Promise<{ product: Product; source: 'supabase' | 'local' }> {
  // Supabase creation
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          description: newProduct.description,
          price: Number(newProduct.price),
          stock_quantity: Number(newProduct.stock_quantity),
          image_url: newProduct.image_url,
          category: newProduct.category.toLowerCase(),
          is_featured: Boolean(newProduct.is_featured),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!error && data) {
        // Also sync local cache
        const local = getLocalProducts();
        saveLocalProducts([data as Product, ...local]);
        return { product: data as Product, source: 'supabase' };
      }
      console.warn('Supabase insert failed:', error?.message);
    } catch (err: any) {
      console.warn('Supabase insert error:', err.message);
    }
  }

  // Local creation fallback
  const local = getLocalProducts();
  const created: Product = {
    ...newProduct,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };
  saveLocalProducts([created, ...local]);
  return { product: created, source: 'local' };
}

export async function updateProduct(id: string | number, updates: Partial<Product>): Promise<{ product: Product; source: 'supabase' | 'local' }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const local = getLocalProducts().map(p => (String(p.id) === String(id) ? (data as Product) : p));
        saveLocalProducts(local);
        return { product: data as Product, source: 'supabase' };
      }
      console.warn('Supabase update failed:', error?.message);
    } catch (err: any) {
      console.warn('Supabase update error:', err.message);
    }
  }

  // Local update fallback
  const local = getLocalProducts();
  let updatedProduct: Product | undefined;
  const updatedList = local.map(item => {
    if (String(item.id) === String(id)) {
      updatedProduct = { ...item, ...updates, updated_at: new Date().toISOString() };
      return updatedProduct;
    }
    return item;
  });

  if (!updatedProduct) {
    throw new Error(`Product #${id} not found.`);
  }

  saveLocalProducts(updatedList);
  return { product: updatedProduct, source: 'local' };
}

export async function deleteProduct(id: string | number): Promise<{ success: boolean; source: 'supabase' | 'local' }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        const local = getLocalProducts().filter(p => String(p.id) !== String(id));
        saveLocalProducts(local);
        return { success: true, source: 'supabase' };
      }
      console.warn('Supabase delete failed:', error.message);
    } catch (err: any) {
      console.warn('Supabase delete error:', err.message);
    }
  }

  // Local delete fallback
  const local = getLocalProducts();
  const filtered = local.filter(p => String(p.id) !== String(id));
  saveLocalProducts(filtered);
  return { success: true, source: 'local' };
}

export function resetDemoData(): Product[] {
  saveLocalProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

export async function seedProductsToDatabase(): Promise<{ success: boolean; count: number; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = INITIAL_PRODUCTS.map(({ id, ...rest }) => ({
        title: rest.title,
        description: rest.description,
        price: Number(rest.price),
        stock_quantity: Number(rest.stock_quantity),
        image_url: rest.image_url,
        category: rest.category.toLowerCase(),
        is_featured: Boolean(rest.is_featured),
        created_at: rest.created_at || new Date().toISOString(),
      }));

      const { data, error } = await supabase.from('products').insert(payload).select();
      if (error) {
        throw error;
      }
      return { success: true, count: data?.length || payload.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  }

  saveLocalProducts(INITIAL_PRODUCTS);
  return { success: true, count: INITIAL_PRODUCTS.length };
}
