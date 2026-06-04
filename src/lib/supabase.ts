import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url?: string;
  sort_order: number;
  created_at: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  sub_category_id: string;
  image_url: string;
  features: string[];
  is_featured: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  message: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

export interface Inquiry {
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartInquiry {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  items: { product_id: string; product_name: string; quantity: number }[];
}

export type QuoteStatus = 'pending' | 'quoted' | 'accepted' | 'rejected';

export interface Quote {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  status: QuoteStatus;
  quoted_price?: string | null;
  delivery_fee?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  quote_id?: string | null;
  status: string;
  items: { product_id: string; product_name: string; quantity: number }[];
  notes?: string | null;
  admin_notes?: string | null;
  total_price?: string | null;
  delivery_fee?: string | null;
  created_at: string;
}
