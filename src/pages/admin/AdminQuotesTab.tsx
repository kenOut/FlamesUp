import { useState } from 'react';
import {
  ChevronDown, ChevronUp, Send, FileText, Check, X,
  Pencil, Plus, Trash2, DollarSign, Truck, RefreshCw,
  Bell, User, Mail, Phone, Building2, MessageSquare,
  Clock, CheckCircle, AlertCircle, Eye, Calculator
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QuoteItem {
  id?: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price?: string;
}

export interface AdminQuote {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected';
  quoted_price?: string | null;
  delivery_fee?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: QuoteItem[];
}

interface Props {
  quotes: AdminQuote[];
  loading: boolean;
  onQuoteUpdated: (q: AdminQuote) => void;
}

interface EditState {
  delivery_fee: string;
  notes: string;
  items: QuoteItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending Review', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: Clock },
  quoted: { label: 'Quote Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Bell },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertCircle },
};

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function formatCurrency(amount: number): string {
  if (amount === 0) return '';
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeTotal(items: QuoteItem[], deliveryFee: string): { itemsTotal: number; delivery: number; grand: number } {
  const itemsTotal = items.reduce((sum, item) => {
    const price = parseAmount(item.unit_price || '');
    return sum + price * item.quantity;
  }, 0);
  const delivery = parseAmount(deliveryFee);
  return { itemsTotal, delivery, grand: itemsTotal + delivery };
}

export default function AdminQuotesTab({ quotes, loading, onQuoteUpdated }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ delivery_fee: '', notes: '', items: [] });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sendError, setSendError] = useState<string | null>(null);

  const filtered = filterStatus === 'all' ? quotes : quotes.filter(q => q.status === filterStatus);
  const pendingCount = quotes.filter(q => q.status === 'pending').length;
  const quotedCount = quotes.filter(q => q.status === 'quoted').length;

  const startEdit = (q: AdminQuote) => {
    setEditingId(q.id);
    setSendError(null);
    setEditState({
      delivery_fee: q.delivery_fee || '',
      notes: q.admin_notes || '',
      items: (q.items || []).map(i => ({ ...i, unit_price: i.unit_price || '' })),
    });
    setExpanded(q.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSendError(null);
  };

  const updateItem = (idx: number, field: keyof QuoteItem, value: string | number) => {
    setEditState(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setEditState(prev => ({
      ...prev,
      items: [...prev.items, { product_id: null, product_name: '', quantity: 1, unit_price: '' }],
    }));
  };

  const removeItem = (idx: number) => {
    setEditState(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const saveQuote = async (q: AdminQuote, send = false) => {
    setSaving(true);
    setSendError(null);

    const validItems = editState.items.filter(i => i.product_name.trim());
    const { delivery, grand } = computeTotal(validItems, editState.delivery_fee);
    const totalStr = grand > 0 ? formatCurrency(grand) : null;
    const deliveryStr = delivery > 0 ? formatCurrency(delivery) : null;

    const quoteUpdates: Record<string, unknown> = {
      quoted_price: totalStr,
      delivery_fee: deliveryStr,
      admin_notes: editState.notes.trim() || null,
    };
    if (send) quoteUpdates.status = 'quoted';

    const { data: updatedQuote, error: quoteError } = await supabase
      .from('quotes')
      .update(quoteUpdates)
      .eq('id', q.id)
      .select()
      .single();

    if (quoteError) {
      setSaving(false);
      setSendError('Failed to save quote. Please try again.');
      return;
    }

    for (const item of validItems) {
      if (item.id) {
        await supabase
          .from('quote_items')
          .update({
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price?.trim() || null,
          })
          .eq('id', item.id);
      } else {
        await supabase
          .from('quote_items')
          .insert({
            quote_id: q.id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price?.trim() || null,
          });
      }
    }

    const { data: freshItems } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', q.id);

    if (send) {
      try {
        await supabase.functions.invoke('notify-quote', {
          body: {
            type: 'quote_ready',
            quote_id: q.id,
            name: q.name,
            email: q.email,
            quoted_price: totalStr,
            delivery_fee: deliveryStr || undefined,
            admin_notes: editState.notes.trim() || undefined,
            items: validItems.map(i => ({
              product_name: i.product_name,
              quantity: i.quantity,
              unit_price: i.unit_price?.trim() || undefined,
            })),
          },
        });
      } catch {
        /* best-effort email */
      }
    }

    onQuoteUpdated({ ...updatedQuote as AdminQuote, items: freshItems || [] });
    setSaving(false);
    setEditingId(null);
  };

  const changeStatus = async (q: AdminQuote, status: string) => {
    setSaving(true);
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', q.id)
      .select()
      .single();
    if (!error && data) {
      onQuoteUpdated({ ...data as AdminQuote, items: q.items });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Client Quotes</h1>
          <p className="text-gray-400 text-sm">
            {quotes.length} total
            {pendingCount > 0 && <span className="ml-2 text-orange-400 font-medium">· {pendingCount} awaiting review</span>}
            {quotedCount > 0 && <span className="ml-2 text-blue-400">· {quotedCount} sent to client</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'quoted', 'accepted', 'rejected'] as const).map(s => {
            const count = s === 'all' ? quotes.length : quotes.filter(q => q.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
                  filterStatus === s
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
                {count > 0 && (
                  <span className={`w-4 h-4 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                    filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-14 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-700" />
          <p className="text-gray-300 font-semibold mb-1">No quotes found</p>
          <p className="text-gray-500 text-sm">
            {filterStatus === 'all' ? 'Submitted quotes will appear here.' : `No ${STATUS_CONFIG[filterStatus]?.label ?? filterStatus} quotes.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => {
            const isOpen = expanded === q.id;
            const isEditing = editingId === q.id;
            const st = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = st.icon;
            const items = q.items || [];
            const isGuest = !q.user_id;

            return (
              <div
                key={q.id}
                className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all duration-200 ${
                  q.status === 'pending' ? 'border-orange-500/40' :
                  q.status === 'quoted' ? 'border-blue-500/30' :
                  'border-gray-800'
                }`}
              >
                {/* Status strip for pending */}
                {q.status === 'pending' && (
                  <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-400" />
                )}

                {/* Header row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-800/40 transition-colors"
                  onClick={() => !isEditing && setExpanded(isOpen ? null : q.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      q.status === 'pending' ? 'bg-orange-500/15' :
                      q.status === 'quoted' ? 'bg-blue-500/15' :
                      q.status === 'accepted' ? 'bg-green-500/15' :
                      'bg-gray-800'
                    }`}>
                      <StatusIcon className={`h-4 w-4 ${
                        q.status === 'pending' ? 'text-orange-400' :
                        q.status === 'quoted' ? 'text-blue-400' :
                        q.status === 'accepted' ? 'text-green-400' :
                        'text-gray-500'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{q.name}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs border font-medium ${st.color}`}>{st.label}</span>
                        {isGuest && (
                          <span className="px-2 py-0.5 rounded-full text-xs border border-gray-600 text-gray-400 bg-gray-800/50">
                            Guest
                          </span>
                        )}
                        {q.quoted_price && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                            {q.quoted_price}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {q.email}
                        {q.company && <span className="text-gray-600"> · {q.company}</span>}
                        <span className="text-gray-700"> · {new Date(q.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-gray-600 text-xs hidden sm:block">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-600" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
                  </div>
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div className="border-t border-gray-800">
                    {isEditing ? (
                      <EditForm
                        q={q}
                        editState={editState}
                        saving={saving}
                        sendError={sendError}
                        onUpdateItem={updateItem}
                        onAddItem={addItem}
                        onRemoveItem={removeItem}
                        onDeliveryFeeChange={v => setEditState(p => ({ ...p, delivery_fee: v }))}
                        onNotesChange={v => setEditState(p => ({ ...p, notes: v }))}
                        onSaveDraft={() => saveQuote(q, false)}
                        onSendQuote={() => saveQuote(q, true)}
                        onCancel={cancelEdit}
                      />
                    ) : (
                      <ViewPanel
                        q={q}
                        saving={saving}
                        onEdit={() => startEdit(q)}
                        onReject={() => changeStatus(q, 'rejected')}
                        onReset={() => changeStatus(q, 'pending')}
                      />
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

function ViewPanel({ q, saving, onEdit, onReject, onReset }: {
  q: AdminQuote;
  saving: boolean;
  onEdit: () => void;
  onReject: () => void;
  onReset: () => void;
}) {
  const items = q.items || [];

  return (
    <div className="p-5 space-y-5">
      {/* Two-column: client info + items */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Client info */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Client Information</p>
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-200">{q.name}</span>
              {!q.user_id && <span className="text-xs text-gray-600 ml-auto">Guest</span>}
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <a href={`mailto:${q.email}`} className="text-sm text-orange-400 hover:underline">{q.email}</a>
            </div>
            {q.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-200">{q.phone}</span>
              </div>
            )}
            {q.company && (
              <div className="flex items-center gap-2.5">
                <Building2 className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-200">{q.company}</span>
              </div>
            )}
            {q.message && (
              <div className="flex items-start gap-2.5 pt-1 border-t border-gray-700/50">
                <MessageSquare className="h-3.5 w-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400 italic leading-relaxed">{q.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Requested items */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Requested Items
          </p>
          <div className="rounded-xl border border-gray-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400 text-xs">
                <tr>
                  <th className="text-left px-3 py-2.5 font-medium">Product</th>
                  <th className="text-center px-3 py-2.5 font-medium">Qty</th>
                  {q.status !== 'pending' && <th className="text-right px-3 py-2.5 font-medium">Unit Price</th>}
                  {q.status !== 'pending' && <th className="text-right px-3 py-2.5 font-medium">Subtotal</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {items.map((item, idx) => {
                  const unitAmt = parseAmount(item.unit_price || '');
                  const subtotal = unitAmt * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-3 py-2.5 text-gray-300 text-xs leading-snug">{item.product_name}</td>
                      <td className="px-3 py-2.5 text-center text-orange-400 font-semibold">×{item.quantity}</td>
                      {q.status !== 'pending' && (
                        <td className="px-3 py-2.5 text-right text-blue-300 font-medium text-xs">
                          {item.unit_price || '—'}
                        </td>
                      )}
                      {q.status !== 'pending' && (
                        <td className="px-3 py-2.5 text-right text-gray-400 text-xs">
                          {subtotal > 0 ? formatCurrency(subtotal) : '—'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quote summary (if sent) */}
      {q.quoted_price && (
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Quote Sent to Client
          </p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total (incl. delivery)</p>
              <p className="text-blue-300 font-bold text-xl">{q.quoted_price}</p>
            </div>
            {q.delivery_fee && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Delivery Fee</p>
                <p className="text-blue-400 font-semibold">{q.delivery_fee}</p>
              </div>
            )}
          </div>
          {q.admin_notes && (
            <p className="text-blue-400/70 text-xs leading-relaxed mt-3 pt-3 border-t border-blue-500/15">
              {q.admin_notes}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {(q.status === 'pending' || q.status === 'quoted') && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Pencil className="h-4 w-4" />
            {q.quoted_price ? 'Edit & Resend Quote' : 'Review & Price Quote'}
          </button>
        )}
        {q.status === 'pending' && (
          <button
            onClick={onReject}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-red-700 text-gray-400 hover:text-white border border-gray-700 hover:border-red-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <X className="h-4 w-4" /> Reject Request
          </button>
        )}
        {q.status === 'accepted' && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium">
            <Check className="h-4 w-4" />
            Client accepted — order placed
          </div>
        )}
        {q.status === 'rejected' && (
          <button
            onClick={onReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" /> Reopen Quote
          </button>
        )}
        {q.status === 'quoted' && (
          <div className="flex items-center gap-1.5 text-xs text-blue-400 ml-auto">
            <Eye className="h-3.5 w-3.5" />
            Awaiting client response
          </div>
        )}
      </div>
    </div>
  );
}

function EditForm({ q, editState, saving, sendError, onUpdateItem, onAddItem, onRemoveItem, onDeliveryFeeChange, onNotesChange, onSaveDraft, onSendQuote, onCancel }: {
  q: AdminQuote;
  editState: EditState;
  saving: boolean;
  sendError: string | null;
  onUpdateItem: (idx: number, field: keyof QuoteItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onDeliveryFeeChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSaveDraft: () => void;
  onSendQuote: () => void;
  onCancel: () => void;
}) {
  const { itemsTotal, delivery, grand } = computeTotal(editState.items, editState.delivery_fee);
  const hasAllPrices = editState.items.filter(i => i.product_name.trim()).every(i => i.unit_price && parseAmount(i.unit_price) > 0);
  const canSend = grand > 0;

  return (
    <div className="p-5 space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
        <Calculator className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-semibold text-white">Set Prices & Finalize Quote</span>
        <span className="ml-auto text-xs text-gray-500">for {q.name}</span>
      </div>

      {/* Items pricing table */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Quote Items — Enter Unit Prices</p>
        <div className="rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 text-xs">
              <tr>
                <th className="text-left px-3 py-2.5 font-medium">Product / Item</th>
                <th className="text-center px-3 py-2.5 font-medium w-16">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium w-36">Unit Price</th>
                <th className="text-right px-3 py-2.5 font-medium w-32">Subtotal</th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {editState.items.map((item, idx) => {
                const unitAmt = parseAmount(item.unit_price || '');
                const subtotal = unitAmt * item.quantity;
                return (
                  <tr key={idx}>
                    <td className="px-3 py-2">
                      <input
                        value={item.product_name}
                        onChange={e => onUpdateItem(idx, 'product_name', e.target.value)}
                        placeholder="Product name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => onUpdateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.unit_price || ''}
                        onChange={e => onUpdateItem(idx, 'unit_price', e.target.value)}
                        placeholder="e.g. 1200"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm text-right focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-sm font-medium ${subtotal > 0 ? 'text-blue-300' : 'text-gray-600'}`}>
                        {subtotal > 0 ? formatCurrency(subtotal) : '—'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors py-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add line item
        </button>
      </div>

      {/* Delivery + total summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium">
            <Truck className="h-3.5 w-3.5 text-blue-400" />
            Delivery Fee <span className="text-gray-600">(optional)</span>
          </label>
          <input
            value={editState.delivery_fee}
            onChange={e => onDeliveryFeeChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
            placeholder="e.g. 500"
          />
          <p className="text-xs text-gray-600 mt-1">Enter a number (GHS assumed)</p>
        </div>

        {/* Live totals */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Quote Summary</p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Equipment Total</span>
            <span className={`font-semibold ${itemsTotal > 0 ? 'text-white' : 'text-gray-600'}`}>
              {itemsTotal > 0 ? formatCurrency(itemsTotal) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Delivery</span>
            <span className={`font-semibold ${delivery > 0 ? 'text-blue-300' : 'text-gray-600'}`}>
              {delivery > 0 ? formatCurrency(delivery) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
            <span className="text-white font-semibold text-sm">Grand Total</span>
            <span className={`font-bold text-lg ${grand > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
              {grand > 0 ? formatCurrency(grand) : '—'}
            </span>
          </div>
          {!hasAllPrices && editState.items.filter(i => i.product_name.trim()).length > 0 && (
            <p className="text-xs text-yellow-500/80 pt-1">Enter unit prices for all items</p>
          )}
        </div>
      </div>

      {/* Notes to client */}
      <div>
        <label className="block text-xs text-gray-400 mb-2 font-medium">
          Notes to Client <span className="text-gray-600">(payment terms, delivery info, conditions)</span>
        </label>
        <textarea
          value={editState.notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder-gray-600"
          placeholder="e.g. 50% deposit required upfront. Delivery within 5–7 business days to Accra. Final 50% on delivery..."
        />
      </div>

      {/* Error */}
      {sendError && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {sendError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap pt-1 border-t border-gray-800">
        <button
          onClick={onSendQuote}
          disabled={saving || !canSend}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {saving ? 'Sending...' : 'Finalize & Send Quote to Client'}
        </button>
        <button
          onClick={onSaveDraft}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm font-medium transition-colors"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>

      {!canSend && (
        <p className="text-xs text-gray-600 -mt-4">
          Add at least one item with a unit price to enable sending the quote.
        </p>
      )}
    </div>
  );
}

export function QuoteStatusBadge({ status }: { status: string }) {
  const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = st.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${st.color}`}>
      <Icon className="h-3 w-3" />
      {st.label}
    </span>
  );
}
