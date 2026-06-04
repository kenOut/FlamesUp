import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './AdminSidebar';
import AdminQuotesTab, { AdminQuote } from './AdminQuotesTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminProductsTab from './AdminProductsTab';
import AdminOverviewTab from './AdminOverviewTab';
import AdminCategoriesTab from './AdminCategoriesTab';

export type AdminTab = 'overview' | 'quotes' | 'orders' | 'products' | 'categories';

export interface AdminCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
}

export type { AdminQuote };

export interface AdminOrder {
  id: string;
  user_id: string;
  quote_id?: string | null;
  status: string;
  items: { product_id: string; product_name: string; quantity: number }[];
  notes?: string;
  admin_notes?: string;
  total_price?: string | null;
  delivery_fee?: string | null;
  created_at: string;
  user_profile?: { full_name: string; email: string; phone?: string; company?: string };
}

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  sub_category_id?: string;
  image_url?: string;
  features?: string[];
  is_featured: boolean;
  availability: 'available' | 'sold_out';
  created_at: string;
}

export default function AdminDashboard() {
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newQuoteAlert, setNewQuoteAlert] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    loadAll();

    channelRef.current = supabase
      .channel('admin-quotes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quotes' },
        async (payload) => {
          const newQuote = payload.new as AdminQuote;
          const { data: allItems } = await supabase.rpc('get_all_quote_items_for_admin');
          const items = allItems ? allItems.filter((i: { quote_id: string }) => i.quote_id === newQuote.id) : [];
          setQuotes(prev => [{ ...newQuote, items }, ...prev]);
          setNewQuoteAlert(true);
          setTimeout(() => setNewQuoteAlert(false), 6000);
        }
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [user]);

  const loadAll = async () => {
    setDataLoading(true);

    const [qRes, itemsRes, oRes, pRes, cRes] = await Promise.all([
      supabase.rpc('get_all_quotes_for_admin'),
      supabase.rpc('get_all_quote_items_for_admin'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (qRes.data) {
      const itemsMap = new Map<string, typeof itemsRes.data>();
      if (itemsRes.data) {
        for (const item of itemsRes.data) {
          if (!itemsMap.has(item.quote_id)) itemsMap.set(item.quote_id, []);
          itemsMap.get(item.quote_id)!.push(item);
        }
      }
      const quotesWithItems = (qRes.data as AdminQuote[]).map(q => ({
        ...q,
        items: itemsMap.get(q.id) || [],
      }));
      setQuotes(quotesWithItems);
    }

    if (pRes.data) setProducts(pRes.data as AdminProduct[]);
    if (cRes.data) setCategories(cRes.data as AdminCategory[]);

    if (oRes.data) {
      const ordersWithProfiles = await Promise.all(
        oRes.data.map(async (o) => {
          const { data: prof } = await supabase
            .from('user_profiles')
            .select('full_name, email, phone, company')
            .eq('id', o.user_id)
            .maybeSingle();
          return { ...o, user_profile: prof ?? undefined };
        })
      );
      setOrders(ordersWithProfiles as AdminOrder[]);
    }
    setDataLoading(false);
  };

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar
        tab={tab}
        setTab={setTab}
        adminName={profile?.full_name || 'Admin'}
        quotesCount={quotes.filter(q => q.status === 'pending').length}
        ordersCount={orders.filter(o => o.status === 'pending').length}
        onSignOut={signOut}
      />

      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto relative">
        {newQuoteAlert && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
            <span className="text-sm font-semibold">New quote request received!</span>
            <button
              onClick={() => { setNewQuoteAlert(false); setTab('quotes'); }}
              className="ml-1 text-white/90 hover:text-white text-sm font-medium underline leading-none"
            >
              View
            </button>
            <button onClick={() => setNewQuoteAlert(false)} className="ml-1 text-white/60 hover:text-white text-lg leading-none">×</button>
          </div>
        )}
        {tab === 'overview' && (
          <AdminOverviewTab
            quotes={quotes}
            orders={orders}
            products={products}
            loading={dataLoading}
            onNavigate={setTab}
          />
        )}
        {tab === 'quotes' && (
          <AdminQuotesTab
            quotes={quotes}
            loading={dataLoading}
            onQuoteUpdated={(updated) => {
              setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
            }}
          />
        )}
        {tab === 'orders' && (
          <AdminOrdersTab
            orders={orders}
            loading={dataLoading}
            onOrderUpdated={(updated) => {
              setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            }}
          />
        )}
        {tab === 'products' && (
          <AdminProductsTab
            products={products}
            loading={dataLoading}
            categories={categories}
            onProductUpdated={(updated) => {
              setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            }}
            onProductDeleted={(id) => {
              setProducts(prev => prev.filter(p => p.id !== id));
            }}
            onProductAdded={(added) => {
              setProducts(prev => [added, ...prev]);
            }}
          />
        )}
        {tab === 'categories' && (
          <AdminCategoriesTab
            categories={categories}
            loading={dataLoading}
            onCategoryUpdated={(updated: AdminCategory) => {
              setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
            }}
          />
        )}
      </main>
    </div>
  );
}
