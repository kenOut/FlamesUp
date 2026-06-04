import { FileText, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { AdminOrder, AdminProduct, AdminTab } from './AdminDashboard';
import { AdminQuote } from './AdminQuotesTab';
import { QuoteStatusBadge } from './AdminQuotesTab';

interface Props {
  quotes: AdminQuote[];
  orders: AdminOrder[];
  products: AdminProduct[];
  loading: boolean;
  onNavigate: (t: AdminTab) => void;
}

const statCard = (label: string, value: number | string, icon: React.ComponentType<{ className?: string }>, color: string) => {
  const Icon = icon;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
};

export default function AdminOverviewTab({ quotes, orders, products, loading, onNavigate }: Props) {
  const newQuotes = quotes.filter(q => q.status === 'pending').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const availableProducts = products.filter(p => p.availability === 'available').length;
  const recentQuotes = quotes.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-900 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
        <p className="text-gray-400 text-sm">Business snapshot for Flames Up Solutions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard('New Quotes', newQuotes, FileText, 'bg-orange-500/10 text-orange-500')}
        {statCard('Pending Orders', pendingOrders, Clock, 'bg-yellow-500/10 text-yellow-500')}
        {statCard('Confirmed Orders', confirmedOrders, CheckCircle, 'bg-green-500/10 text-green-500')}
        {statCard('Active Products', availableProducts, ShoppingBag, 'bg-blue-500/10 text-blue-400')}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Quotes</h3>
            <button onClick={() => onNavigate('quotes')} className="text-orange-400 text-xs hover:text-orange-300 transition-colors">View all</button>
          </div>
          {recentQuotes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No quotes yet</p>
          ) : (
            <div className="space-y-3">
              {recentQuotes.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{q.name}</p>
                    <p className="text-gray-400 text-xs">{(q.items || []).length} item{(q.items || []).length !== 1 ? 's' : ''} · {new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                  <QuoteStatusBadge status={q.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Orders</h3>
            <button onClick={() => onNavigate('orders')} className="text-orange-400 text-xs hover:text-orange-300 transition-colors">View all</button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{o.user_profile?.full_name || 'Unknown'}</p>
                    <p className="text-gray-400 text-xs">Order #{o.id.slice(-6).toUpperCase()} · {new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const labels: Record<string, string> = {
    pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${map[status] ?? map.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}
