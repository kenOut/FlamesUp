import { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Send, FileText, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });

  useEffect(() => {
    if (user && profile) {
      setForm(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: user.email || prev.email,
        phone: profile.phone || prev.phone,
        company: profile.company || prev.company,
      }));
    } else if (user) {
      setForm(prev => ({ ...prev, email: user.email || prev.email }));
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke('submit-quote', {
      body: {
        user_id: user?.id ?? null,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        company: form.company || null,
        message: form.message || null,
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
        })),
      },
    });

    setSubmitting(false);

    if (error || !data?.success) {
      console.error('Quote submission failed:', error || data?.error);
      return;
    }

    setSubmitted(true);
    clearCart();
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setIsCartOpen(false);
      setForm(prev => ({ ...prev, message: '' }));
    }, 4000);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="relative ml-auto w-full max-w-md bg-gray-950 border-l border-gray-800 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-base font-semibold text-white">Quote Request</h2>
              {items.length > 0 && (
                <p className="text-xs text-gray-500">{items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Quote Request Submitted!</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {user
                  ? "We'll review your request and send you a price shortly. Track it in your dashboard under My Quotes."
                  : "We'll review your request and get back to you within 24 hours with pricing details."}
              </p>
            </div>
            {user && (
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors"
                onClick={() => setIsCartOpen(false)}
              >
                <FileText className="h-4 w-4" /> View in Dashboard
              </a>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-700" />
            <div>
              <p className="text-white font-semibold mb-1">Your quote cart is empty</p>
              <p className="text-gray-500 text-sm">Browse the catalogue and add products to request a quote.</p>
            </div>
          </div>
        ) : showForm ? (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-5 space-y-4">
              {/* Items summary */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                  Items Requesting Quote For
                </p>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 truncate pr-2">{item.product.name}</span>
                      <span className="text-orange-400 font-semibold flex-shrink-0">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name <span className="text-red-400">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address <span className="text-red-400">*</span></label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  disabled={!!user}
                  className={`w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors ${user ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="+233 xx xxx xxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Company</label>
                  <input
                    value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Business name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Additional Notes</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="Delivery location, specific requirements..."
                />
              </div>
            </div>
            <div className="px-6 pb-6 space-y-3 border-t border-gray-800 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : <><Send className="h-4 w-4" /> Submit Quote Request</>}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors py-2"
              >
                Back to cart
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 bg-gray-900 rounded-xl p-3 border border-gray-800">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-800 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-tight line-clamp-2 mb-2">{item.product.name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-white font-semibold text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors self-start mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 space-y-3 border-t border-gray-800 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total items</span>
                <span className="text-white font-semibold">{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Request Quote
              </button>
              <button onClick={clearCart} className="w-full text-gray-500 hover:text-red-400 text-sm transition-colors py-1.5">
                Clear all items
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
