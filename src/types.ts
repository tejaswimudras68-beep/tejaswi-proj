export interface Product {
  id: string | number;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category: string;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CategorySlug = 'all' | 'objects' | 'apparel' | 'stationery' | 'living';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: {
    product_id: string | number;
    title: string;
    quantity: number;
    unit_price: number;
  }[];
  created_at: string;
}
