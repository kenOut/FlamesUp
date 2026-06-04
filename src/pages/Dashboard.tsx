import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FileText, LogOut,
  User, Package, ChevronRight, Plus, Clock, CheckCircle,
  Truck, XCircle, RefreshCw, ShoppingCart, PackageCheck,
  AlertCircle, Bell, DollarSign, ThumbsUp, ThumbsDown,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Container from '../components/ui/Container';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Quote, QuoteItem, Order } from '../lib/supabase';

type Tab = 'overview' | 'quotes' | 'orders' | 'profile';

const orderStatusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: CheckCircle },
  shipped: { label: 'Shipped', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

const quoteStatusConfig: Record<string, { label: string; color: string; description: string }> = {
  pending: { label: 'Pending Review', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', description: 'Your quote is being reviewed by our team.' },
  quoted: { label: 'Price Ready', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', description: 'We have sent you a price. Please review and respond.' },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-400 border-green-500/20', description: 'You accepted this quote. Your order has been created.' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20', description: 'You declined this quote.' },
};

export default function Dashboard() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [pendingQuoteCount, setPendingQuoteCount] = useState(0);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setEditName(profile?.full_name ?? '');
    setEditPhone(profile?.phone ?? '');
    setEditCompany(profile?.company ?? '');
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setDataLoading(true);
      const [quotesRes, ordersRes] = await Promise.all([
        supabase
          .from('quotes')
          .select('*, items:quote_items(*)')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);
      if (quotesRes.data) {
        setQuotes(quotesRes.data as Quote[]);
        setPendingQuoteCount(quotesRes.data.filter(q => q.status === 'quoted').length);
      }
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      setDataLoading(false);
    }
    load();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    await supabase.from('user_profiles').upsert({
      id: user.id,
      full_name: editName,
      email: user.email ?? '',
      phone: editPhone || null,
      company: editCompany || null,
    });
    setProfileMsg('Profile updated successfully.');
    setProfileSaving(false);
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleQuoteResponse = async (quoteId: string, action: 'accepted' | 'rejected') => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote || !user) return;

    const { error } = await supabase.from('quotes').update({ status: action }).eq('id', quoteId);
    if (error) return;

    if (action === 'accepted') {
      const { data: order } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          quote_id: quoteId,
          status: 'pending',
          items: (quote.items || []).map(i => ({
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
          })),
          total_price: quote.quoted_price,
          delivery_fee: quote.delivery_fee,
        })
        .select('id')
        .single();

      if (order) {
        try {
          await supabase.functions.invoke('notify-quote', {
            body: { type: 'quote_accepted', quote_id: quoteId, order_id: order.id },
          });
        } catch { /* best-effort */ }

        setOrders(prev => [{
          id: order.id,
          user_id: user.id,
          quote_id: quoteId,
          status: 'pending',
          items: (quote.items || []).map(i => ({
            product_id: i.product_id ?? '',
            product_name: i.product_name,
            quantity: i.quantity,
          })),
          total_price: quote.quoted_price,
          delivery_fee: quote.delivery_fee,
          created_at: new Date().toISOString(),
        }, ...prev]);
        setTab('orders');
      }
    }

    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: action } : q));
    setPendingQuoteCount(prev => Math.max(0, prev - 1));
  };

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;

  const navBg = isDay ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800';
  const pageBg = isDay ? 'bg-gray-50' : 'bg-gray-950';
  const cardBg = isDay ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800';
  const textPrimary = isDay ? 'text-gray-900' : 'text-white';
  const textSecondary = isDay ? 'text-gray-500' : 'text-gray-400';
  const inputCls = isDay
    ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
    : 'bg-gray-800 border-gray-700 text-white placeholder-gray-500';

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'quotes', label: 'My Quotes', icon: FileText, badge: pendingQuoteCount },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-700 ${pageBg}`}>
      {/* Top nav */}
      <div className={`border-b sticky top-0 z-30 transition-colors duration-700 ${navBg}`}>
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src="/flame-logo-new.png" alt="Flames Up Solutions" className="h-10 object-contain" />
              </Link>
              <div className={`w-px h-6 ${isDay ? 'bg-gray-200' : 'bg-gray-700'}`} />
              <span className={`font-semibold text-sm ${textPrimary}`}>My Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              {pendingQuoteCount > 0 && (
                <button
                  onClick={() => setTab('quotes')}
                  className="relative flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium transition-colors hover:bg-blue-500/20"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Quote{pendingQuoteCount > 1 ? 's' : ''} Ready</span>
                  <span className="w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingQuoteCount}
                  </span>
                </button>
              )}
              <Link to="/products"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">
                <ShoppingCart className="h-4 w-4" /> Shop
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
                <span className={`hidden md:block text-sm font-medium ${textPrimary}`}>
                  {profile?.full_name || user?.email?.split('@')[0]}
                </span>
              </div>
              <button onClick={handleSignOut} className={`p-2 rounded-lg transition-colors ${isDay ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'}`}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex gap-6 py-6">
          {/* Sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {tabs.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                      tab === t.id
                        ? 'bg-orange-600 text-white font-medium shadow-sm'
                        : isDay
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {t.label}
                    {t.badge && t.badge > 0 ? (
                      <span className={`ml-auto w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                        tab === t.id ? 'bg-white text-orange-600' : 'bg-blue-500 text-white'
                      }`}>
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mobile tab bar */}
          <div className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex ${navBg}`}>
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors relative ${
                    tab === t.id ? 'text-orange-500' : textSecondary
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {t.label}
                  {t.badge && t.badge > 0 ? (
                    <span className="absolute top-1 right-1/4 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Main */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            {tab === 'overview' && (
              <OverviewTab
                quotes={quotes}
                orders={orders}
                loading={dataLoading}
                isDay={isDay}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                pendingQuoteCount={pendingQuoteCount}
                onNavigate={setTab}
              />
            )}
            {tab === 'quotes' && (
              <QuotesTab
                quotes={quotes}
                loading={dataLoading}
                isDay={isDay}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                onQuoteResponse={handleQuoteResponse}
              />
            )}
            {tab === 'orders' && (
              <OrdersTab
                orders={orders}
                loading={dataLoading}
                isDay={isDay}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            )}
            {tab === 'profile' && (
              <ProfileTab
                editName={editName}
                editPhone={editPhone}
                editCompany={editCompany}
                setEditName={setEditName}
                setEditPhone={setEditPhone}
                setEditCompany={setEditCompany}
                onSave={handleProfileSave}
                saving={profileSaving}
                message={profileMsg}
                email={user?.email ?? ''}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                inputCls={inputCls}
              />
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, cardBg, textPrimary, textSecondary }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>;
  color: string; cardBg: string; textPrimary: string; textSecondary: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 transition-colors duration-700 ${cardBg}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className={`text-2xl font-bold mb-0.5 ${textPrimary}`}>{value}</p>
      <p className={`text-sm ${textSecondary}`}>{label}</p>
    </div>
  );
}

function OverviewTab({ quotes, orders, loading, isDay, cardBg, textPrimary, textSecondary, pendingQuoteCount, onNavigate }: {
  quotes: Quote[]; orders: Order[]; loading: boolean; isDay: boolean;
  cardBg: string; textPrimary: string; textSecondary: string;
  pendingQuoteCount: number; onNavigate: (t: Tab) => void;
}) {
  const recentQuotes = quotes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>Overview</h2>
        <p className={`text-sm ${textSecondary}`}>A summary of your activity with Flames Up Solutions</p>
      </div>

      {pendingQuoteCount > 0 && (
        <div className={`rounded-2xl border p-4 flex items-center gap-4 ${isDay ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDay ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
            <Bell className={`h-5 w-5 ${isDay ? 'text-blue-600' : 'text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${isDay ? 'text-blue-800' : 'text-blue-300'}`}>
              {pendingQuoteCount} quote{pendingQuoteCount > 1 ? 's' : ''} ready for your review
            </p>
            <p className={`text-xs ${isDay ? 'text-blue-600' : 'text-blue-400'}`}>
              Flames Up Solutions has sent you pricing. Accept or reject to proceed.
            </p>
          </div>
          <button
            onClick={() => onNavigate('quotes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isDay ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
          >
            Review <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Quotes" value={quotes.length} icon={FileText} color="bg-orange-500/10 text-orange-500" cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary} />
        <StatCard label="Total Orders" value={orders.length} icon={Package} color="bg-blue-500/10 text-blue-400" cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary} />
        <StatCard label="Awaiting Price" value={quotes.filter(q => q.status === 'pending').length} icon={Clock} color="bg-yellow-500/10 text-yellow-500" cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary} />
        <StatCard label="Delivered" value={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle} color="bg-green-500/10 text-green-500" cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary} />
      </div>

      {/* Quick actions */}
      <div className={`rounded-2xl border p-5 transition-colors duration-700 ${cardBg}`}>
        <h3 className={`font-semibold mb-4 ${textPrimary}`}>Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/products"
            className="flex items-center gap-3 p-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-colors group">
            <ShoppingBag className="h-5 w-5" />
            <div>
              <p className="font-semibold text-sm">Browse Equipment</p>
              <p className="text-orange-100 text-xs">Add items to a new quote</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button onClick={() => onNavigate('quotes')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors group ${isDay ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-800'}`}>
            <FileText className={`h-5 w-5 ${isDay ? 'text-gray-500' : 'text-gray-400'}`} />
            <div className="text-left">
              <p className={`font-semibold text-sm ${textPrimary}`}>View Quotes</p>
              <p className={`text-xs ${textSecondary}`}>{quotes.length} quote{quotes.length !== 1 ? 's' : ''} submitted</p>
            </div>
            <ChevronRight className={`h-4 w-4 ml-auto group-hover:translate-x-0.5 transition-transform ${textSecondary}`} />
          </button>
        </div>
      </div>

      {/* Recent quotes */}
      {recentQuotes.length > 0 && (
        <div className={`rounded-2xl border p-5 transition-colors duration-700 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${textPrimary}`}>Recent Quotes</h3>
            <button onClick={() => onNavigate('quotes')} className="text-xs text-orange-500 hover:text-orange-400">View all</button>
          </div>
          <div className="space-y-2.5">
            {recentQuotes.map(q => {
              const st = quoteStatusConfig[q.status] ?? quoteStatusConfig.pending;
              return (
                <div key={q.id} className={`flex items-center justify-between p-3 rounded-xl ${isDay ? 'bg-gray-50' : 'bg-gray-800/50'}`}>
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>
                      Quote #{q.id.slice(-6).toUpperCase()}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && quotes.length === 0 && orders.length === 0 && (
        <div className={`rounded-2xl border p-10 text-center transition-colors duration-700 ${cardBg}`}>
          <ShoppingBag className={`h-12 w-12 mx-auto mb-4 ${isDay ? 'text-gray-300' : 'text-gray-700'}`} />
          <p className={`font-semibold mb-1 ${textPrimary}`}>No activity yet</p>
          <p className={`text-sm mb-5 ${textSecondary}`}>Start by browsing our equipment catalogue and requesting a quote.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors">
            <Plus className="h-4 w-4" /> Browse Equipment
          </Link>
        </div>
      )}
    </div>
  );
}

function QuotesTab({ quotes, loading, isDay, cardBg, textPrimary, textSecondary, onQuoteResponse }: {
  quotes: Quote[]; loading: boolean; isDay: boolean; cardBg: string; textPrimary: string; textSecondary: string;
  onQuoteResponse: (id: string, action: 'accepted' | 'rejected') => Promise<void>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const handleResponse = async (quoteId: string, action: 'accepted' | 'rejected') => {
    setRespondingId(quoteId);
    await onQuoteResponse(quoteId, action);
    setRespondingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>My Quotes</h2>
          <p className={`text-sm ${textSecondary}`}>{quotes.length} quote request{quotes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/products" className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Quote
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDay ? 'bg-gray-200' : 'bg-gray-800'}`} />)}
        </div>
      ) : quotes.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
          <FileText className={`h-10 w-10 mx-auto mb-3 ${isDay ? 'text-gray-300' : 'text-gray-700'}`} />
          <p className={`font-medium mb-4 ${textPrimary}`}>No quotes yet</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors">
            <ShoppingBag className="h-4 w-4" /> Browse & Request Quote
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => {
            const st = quoteStatusConfig[q.status] ?? quoteStatusConfig.pending;
            const isExpanded = expandedId === q.id;
            const items = q.items || [];
            const isQuoted = q.status === 'quoted';
            const isResponding = respondingId === q.id;

            return (
              <div key={q.id} className={`rounded-2xl border overflow-hidden transition-all ${
                isQuoted
                  ? isDay ? 'border-blue-300 bg-white' : 'border-blue-500/30 bg-gray-900'
                  : cardBg
              }`}>
                {/* Attention banner for quoted status */}
                {isQuoted && (
                  <div className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium ${isDay ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-300 border-b border-blue-500/20'}`}>
                    <Bell className="h-4 w-4 flex-shrink-0" />
                    Price received — please review and respond
                  </div>
                )}

                <div
                  className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${isDay ? 'hover:bg-gray-50' : 'hover:bg-gray-800/30'}`}
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${textPrimary}`}>
                        Quote #{q.id.slice(-6).toUpperCase()}
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${st.color}`}>{st.label}</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>
                      {items.length} item{items.length !== 1 ? 's' : ''} · {new Date(q.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {q.quoted_price && (
                      <span className={`font-bold text-sm hidden sm:block ${isDay ? 'text-blue-700' : 'text-blue-300'}`}>
                        {q.quoted_price}
                      </span>
                    )}
                    {isExpanded
                      ? <ChevronUp className={`h-4 w-4 ${textSecondary}`} />
                      : <ChevronDown className={`h-4 w-4 ${textSecondary}`} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t px-5 py-5 space-y-5 ${isDay ? 'border-gray-100' : 'border-gray-800'}`}>
                    {/* Items */}
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textSecondary}`}>
                        Requested Items
                      </p>
                      <div className={`rounded-xl border overflow-hidden ${isDay ? 'border-gray-200' : 'border-gray-700'}`}>
                        <table className="w-full text-sm">
                          <thead className={`text-xs ${isDay ? 'bg-gray-50 text-gray-500' : 'bg-gray-800 text-gray-400'}`}>
                            <tr>
                              <th className="text-left px-4 py-2.5 font-medium">Product</th>
                              <th className="text-center px-4 py-2.5 font-medium">Qty</th>
                              {q.status === 'quoted' || q.status === 'accepted' ? (
                                <th className="text-right px-4 py-2.5 font-medium">Unit Price</th>
                              ) : null}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDay ? 'divide-gray-100' : 'divide-gray-800'}`}>
                            {items.map((item: QuoteItem, idx: number) => (
                              <tr key={idx}>
                                <td className={`px-4 py-3 ${textPrimary}`}>{item.product_name}</td>
                                <td className={`px-4 py-3 text-center font-semibold text-orange-500`}>
                                  ×{item.quantity}
                                </td>
                                {(q.status === 'quoted' || q.status === 'accepted') && (
                                  <td className={`px-4 py-3 text-right font-medium ${isDay ? 'text-blue-700' : 'text-blue-300'}`}>
                                    {item.unit_price || '—'}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Client notes */}
                    {q.message && (
                      <div className={`rounded-xl p-3.5 ${isDay ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
                        <p className={`text-xs font-medium mb-1 ${textSecondary}`}>Your Notes</p>
                        <p className={`text-sm italic ${textPrimary}`}>{q.message}</p>
                      </div>
                    )}

                    {/* Quoted price panel */}
                    {q.quoted_price && (
                      <div className={`rounded-xl p-4 border ${isDay ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5 ${isDay ? 'text-blue-600' : 'text-blue-400'}`}>
                          <DollarSign className="h-3.5 w-3.5" /> Price from Flames Up Solutions
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDay ? 'text-blue-600' : 'text-blue-300'}`}>Equipment Total</span>
                            <span className={`font-bold text-lg ${isDay ? 'text-blue-800' : 'text-blue-200'}`}>{q.quoted_price}</span>
                          </div>
                          {q.delivery_fee && (
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${isDay ? 'text-blue-600' : 'text-blue-300'}`}>Delivery Fee</span>
                              <span className={`font-semibold ${isDay ? 'text-blue-700' : 'text-blue-200'}`}>{q.delivery_fee}</span>
                            </div>
                          )}
                        </div>
                        {q.admin_notes && (
                          <p className={`text-xs mt-3 pt-3 border-t leading-relaxed ${isDay ? 'border-blue-200 text-blue-600' : 'border-blue-500/20 text-blue-400'}`}>
                            {q.admin_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action buttons for QUOTED status */}
                    {isQuoted && (
                      <div className="space-y-3">
                        <p className={`text-sm ${textSecondary}`}>
                          Please review the price above and confirm whether you'd like to proceed with your order.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResponse(q.id, 'accepted')}
                            disabled={isResponding}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
                          >
                            {isResponding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                            Accept & Order
                          </button>
                          <button
                            onClick={() => handleResponse(q.id, 'rejected')}
                            disabled={isResponding}
                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors border disabled:opacity-60 ${
                              isDay
                                ? 'border-red-300 text-red-600 hover:bg-red-50'
                                : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Accepted state */}
                    {q.status === 'accepted' && (
                      <div className={`flex items-center gap-3 p-3.5 rounded-xl ${isDay ? 'bg-green-50 border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                        <PackageCheck className={`h-5 w-5 flex-shrink-0 ${isDay ? 'text-green-600' : 'text-green-400'}`} />
                        <p className={`text-sm ${isDay ? 'text-green-700' : 'text-green-400'}`}>
                          You accepted this quote. An order has been created — check My Orders for tracking.
                        </p>
                      </div>
                    )}

                    {/* Rejected state */}
                    {q.status === 'rejected' && (
                      <div className={`flex items-center gap-3 p-3.5 rounded-xl ${isDay ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <AlertCircle className={`h-5 w-5 flex-shrink-0 ${isDay ? 'text-red-500' : 'text-red-400'}`} />
                        <p className={`text-sm ${isDay ? 'text-red-600' : 'text-red-400'}`}>
                          You declined this quote. Feel free to contact us to discuss further or submit a new request.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrdersTab({ orders, loading, isDay, cardBg, textPrimary, textSecondary }: {
  orders: Order[]; loading: boolean; isDay: boolean; cardBg: string; textPrimary: string; textSecondary: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>My Orders</h2>
        <p className={`text-sm ${textSecondary}`}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDay ? 'bg-gray-200' : 'bg-gray-800'}`} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
          <Package className={`h-10 w-10 mx-auto mb-3 ${isDay ? 'text-gray-300' : 'text-gray-700'}`} />
          <p className={`font-medium mb-2 ${textPrimary}`}>No orders yet</p>
          <p className={`text-sm mb-5 ${textSecondary}`}>Accept a quoted price to create your first order.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors">
            <ShoppingBag className="h-4 w-4" /> Browse Equipment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const st = orderStatusConfig[order.status] ?? orderStatusConfig.pending;
            const Icon = st.icon;
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div
                  className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${isDay ? 'hover:bg-gray-50' : 'hover:bg-gray-800/30'}`}
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${textPrimary}`}>
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${st.color}`}>
                        <Icon className="h-3 w-3" /> {st.label}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {order.total_price && (
                      <span className={`font-bold text-sm hidden sm:block ${textPrimary}`}>{order.total_price}</span>
                    )}
                    {isExpanded
                      ? <ChevronUp className={`h-4 w-4 ${textSecondary}`} />
                      : <ChevronDown className={`h-4 w-4 ${textSecondary}`} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t px-5 py-5 space-y-4 ${isDay ? 'border-gray-100' : 'border-gray-800'}`}>
                    <div className={`rounded-xl border overflow-hidden ${isDay ? 'border-gray-200' : 'border-gray-700'}`}>
                      <table className="w-full text-sm">
                        <thead className={`text-xs ${isDay ? 'bg-gray-50 text-gray-500' : 'bg-gray-800 text-gray-400'}`}>
                          <tr>
                            <th className="text-left px-4 py-2.5 font-medium">Item</th>
                            <th className="text-center px-4 py-2.5 font-medium">Qty</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDay ? 'divide-gray-100' : 'divide-gray-800'}`}>
                          {Array.isArray(order.items) && order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className={`px-4 py-3 ${textPrimary}`}>{item.product_name}</td>
                              <td className="px-4 py-3 text-center text-orange-500 font-semibold">×{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {(order.total_price || order.delivery_fee) && (
                      <div className={`rounded-xl p-3.5 border ${isDay ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                        {order.total_price && (
                          <div className="flex justify-between text-sm mb-1">
                            <span className={textSecondary}>Equipment Total</span>
                            <span className={`font-semibold ${textPrimary}`}>{order.total_price}</span>
                          </div>
                        )}
                        {order.delivery_fee && (
                          <div className="flex justify-between text-sm">
                            <span className={textSecondary}>Delivery Fee</span>
                            <span className={`font-semibold ${textPrimary}`}>{order.delivery_fee}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {order.admin_notes && (
                      <div className={`rounded-xl p-3.5 border ${isDay ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
                        <p className={`text-xs font-medium mb-1 ${isDay ? 'text-blue-600' : 'text-blue-400'}`}>Update from Flames Up Solutions</p>
                        <p className={`text-sm ${isDay ? 'text-blue-700' : 'text-blue-300'}`}>{order.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ editName, editPhone, editCompany, setEditName, setEditPhone, setEditCompany, onSave, saving, message, email, cardBg, textPrimary, textSecondary, inputCls }: {
  editName: string; editPhone: string; editCompany: string;
  setEditName: (v: string) => void; setEditPhone: (v: string) => void; setEditCompany: (v: string) => void;
  onSave: (e: React.FormEvent) => void; saving: boolean; message: string; email: string;
  cardBg: string; textPrimary: string; textSecondary: string; inputCls: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>My Profile</h2>
        <p className={`text-sm ${textSecondary}`}>Update your account details</p>
      </div>

      <div className={`rounded-2xl border p-6 transition-colors duration-700 ${cardBg}`}>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textSecondary}`}>Full Name</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your full name"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${inputCls}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textSecondary}`}>Email Address</label>
              <input
                value={email}
                disabled
                className={`w-full px-4 py-3 rounded-xl border text-sm opacity-60 cursor-not-allowed ${inputCls}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textSecondary}`}>Phone Number</label>
              <input
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                placeholder="+233 xx xxx xxxx"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${inputCls}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${textSecondary}`}>Company / Business</label>
              <input
                value={editCompany}
                onChange={e => setEditCompany(e.target.value)}
                placeholder="Your business name"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${inputCls}`}
              />
            </div>
          </div>

          {message && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
