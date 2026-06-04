import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminOrder } from './AdminDashboard';
import { OrderStatusBadge } from './AdminOverviewTab';

interface Props {
  orders: AdminOrder[];
  loading: boolean;
  onOrderUpdated: (o: AdminOrder) => void;
}

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersTab({ orders, loading, onOrderUpdated }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesEdit, setNotesEdit] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const updateOrder = async (o: AdminOrder, updates: Partial<AdminOrder>) => {
    setSavingId(o.id);
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', o.id)
      .select()
      .single();
    if (!error && data) {
      onOrderUpdated({ ...o, ...data });
    }
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} total · {orders.filter(o => o.status === 'pending').length} pending</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', ...ORDER_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filterStatus === s
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <Package className="h-10 w-10 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-800/40 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">
                        Order #{o.id.slice(-6).toUpperCase()}
                      </p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {o.user_profile?.full_name || 'Unknown'} · {o.user_profile?.email || ''} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-gray-500 text-xs hidden sm:block">
                      {Array.isArray(o.items) ? o.items.length : 0} item{Array.isArray(o.items) && o.items.length !== 1 ? 's' : ''}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-800 p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Client Info</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300"><span className="text-gray-500">Name:</span> {o.user_profile?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-300"><span className="text-gray-500">Email:</span> {o.user_profile?.email || 'N/A'}</p>
                          {o.user_profile?.phone && <p className="text-sm text-gray-300"><span className="text-gray-500">Phone:</span> {o.user_profile.phone}</p>}
                          {o.user_profile?.company && <p className="text-sm text-gray-300"><span className="text-gray-500">Company:</span> {o.user_profile.company}</p>}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Order Items</p>
                        <div className="space-y-1">
                          {Array.isArray(o.items) && o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-300 truncate">{item.product_name}</span>
                              <span className="text-orange-400 font-medium ml-3">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {o.notes && (
                      <div className="bg-gray-800/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Client Notes</p>
                        <p className="text-sm text-gray-300">{o.notes}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Update Order Status</label>
                        <div className="flex gap-2 flex-wrap">
                          {ORDER_STATUSES.map(s => (
                            <button
                              key={s}
                              disabled={savingId === o.id || o.status === s}
                              onClick={() => updateOrder(o, { status: s })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                                o.status === s
                                  ? 'bg-orange-600 text-white cursor-default'
                                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-orange-500'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Admin Notes</label>
                        <div className="flex gap-2">
                          <textarea
                            value={notesEdit[o.id] ?? o.admin_notes ?? ''}
                            onChange={e => setNotesEdit(prev => ({ ...prev, [o.id]: e.target.value }))}
                            rows={2}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                            placeholder="Internal notes, tracking info..."
                          />
                          <button
                            onClick={() => updateOrder(o, { admin_notes: notesEdit[o.id] ?? o.admin_notes })}
                            disabled={savingId === o.id}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5 text-sm"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {savingId === o.id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
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
