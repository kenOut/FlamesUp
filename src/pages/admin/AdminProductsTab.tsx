import { useState, useRef } from 'react';
import {
  ShoppingBag, Pencil, Trash2, Check, X, Star, StarOff,
  Plus, Upload, Link, ImageOff, RefreshCw, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminProduct } from './AdminDashboard';

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: AdminProduct[];
  loading: boolean;
  categories: Category[];
  onProductUpdated: (p: AdminProduct) => void;
  onProductDeleted: (id: string) => void;
  onProductAdded: (p: AdminProduct) => void;
}

type ImageMode = 'url' | 'upload';

interface ProductForm {
  name: string;
  description: string;
  image_url: string;
  features: string[];
  is_featured: boolean;
  availability: 'available' | 'sold_out';
  category_id: string;
}

const blankForm = (): ProductForm => ({
  name: '',
  description: '',
  image_url: '',
  features: [],
  is_featured: false,
  availability: 'available',
  category_id: '',
});

export default function AdminProductsTab({
  products, loading, categories,
  onProductUpdated, onProductDeleted, onProductAdded,
}: Props) {
  const [mode, setMode] = useState<'list' | 'edit' | 'add'>('list');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(blankForm());
  const [imageMode, setImageMode] = useState<ImageMode>('url');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchAvail = filterAvailability === 'all' || p.availability === filterAvailability;
    const matchCat = filterCategory === 'all' || p.category_id === filterCategory;
    return matchSearch && matchAvail && matchCat;
  });

  const openEdit = (p: AdminProduct) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      image_url: p.image_url || '',
      features: p.features || [],
      is_featured: p.is_featured,
      availability: p.availability,
      category_id: p.category_id || '',
    });
    setImagePreview(p.image_url || '');
    setImageMode('url');
    setUploadFile(null);
    setFormError('');
    setMode('edit');
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(blankForm());
    setImagePreview('');
    setImageMode('url');
    setUploadFile(null);
    setFormError('');
    setMode('add');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(p => ({ ...p, image_url: '' }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!uploadFile) return form.image_url || null;
    setUploading(true);
    const ext = uploadFile.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, uploadFile, { upsert: false });
    setUploading(false);
    if (error) {
      setFormError(`Image upload failed: ${error.message}`);
      return null;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    setSaving(true);
    setFormError('');

    const finalImageUrl = await uploadImage();
    if (uploadFile && finalImageUrl === null) {
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      image_url: finalImageUrl || null,
      features: form.features.filter(f => f.trim()),
      is_featured: form.is_featured,
      availability: form.availability,
      category_id: form.category_id || null,
    };

    if (mode === 'edit' && editingProduct) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id)
        .select()
        .single();
      if (!error && data) onProductUpdated(data as AdminProduct);
      else if (error) setFormError(error.message);
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();
      if (!error && data) onProductAdded(data as AdminProduct);
      else if (error) { setFormError(error.message); setSaving(false); return; }
    }
    setSaving(false);
    setMode('list');
  };

  const toggleAvailability = async (p: AdminProduct) => {
    const newVal = p.availability === 'available' ? 'sold_out' : 'available';
    const { data, error } = await supabase
      .from('products').update({ availability: newVal }).eq('id', p.id).select().single();
    if (!error && data) onProductUpdated(data as AdminProduct);
  };

  const toggleFeatured = async (p: AdminProduct) => {
    const { data, error } = await supabase
      .from('products').update({ is_featured: !p.is_featured }).eq('id', p.id).select().single();
    if (!error && data) onProductUpdated(data as AdminProduct);
  };

  const deleteProduct = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) onProductDeleted(id);
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const categoryName = (id?: string) =>
    categories.find(c => c.id === id)?.name ?? '';

  if (mode === 'edit' || mode === 'add') {
    return (
      <ProductForm
        title={mode === 'edit' ? 'Edit Product' : 'Add New Product'}
        form={form}
        setForm={setForm}
        imageMode={imageMode}
        setImageMode={setImageMode}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        uploadFile={uploadFile}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        categories={categories}
        saving={saving}
        uploading={uploading}
        error={formError}
        onSave={handleSave}
        onCancel={() => setMode('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
          <p className="text-gray-400 text-sm">
            {products.length} total · {products.filter(p => p.availability === 'available').length} available · {products.filter(p => p.availability === 'sold_out').length} sold out
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-48 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {(['all', 'available', 'sold_out'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterAvailability(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filterAvailability === s
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {s === 'sold_out' ? 'Sold Out' : s === 'all' ? 'All' : 'Available'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-56 rounded-2xl bg-gray-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400 mb-4">No products found</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors">
            <Plus className="h-4 w-4" /> Add First Product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`bg-gray-900 border rounded-2xl overflow-hidden flex flex-col transition-all hover:border-gray-700 ${
                p.availability === 'sold_out' ? 'border-red-500/20' : 'border-gray-800'
              }`}
            >
              {/* Image */}
              <div className="relative group">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-800 flex flex-col items-center justify-center gap-2">
                    <ImageOff className="h-8 w-8 text-gray-600" />
                    <span className="text-xs text-gray-600">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    p.availability === 'available'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {p.availability === 'available' ? 'Available' : 'Sold Out'}
                  </span>
                  {p.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <p className="text-white font-semibold text-sm leading-snug mb-0.5 line-clamp-2">{p.name}</p>
                {p.category_id && (
                  <p className="text-orange-400/70 text-xs mb-1">{categoryName(p.category_id)}</p>
                )}
                {p.description && (
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3">{p.description}</p>
                )}

                <div className="mt-auto flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => toggleAvailability(p)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      p.availability === 'available'
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                        : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20'
                    }`}
                  >
                    {p.availability === 'available' ? 'Sold Out' : 'Available'}
                  </button>
                  <button
                    onClick={() => toggleFeatured(p)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-yellow-500/20"
                  >
                    {p.is_featured ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                    {p.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  {confirmDelete === p.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        {deletingId === p.id ? '...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(p.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  title, form, setForm, imageMode, setImageMode,
  imagePreview, setImagePreview, uploadFile, fileInputRef,
  onFileChange, categories, saving, uploading, error, onSave, onCancel,
}: {
  title: string;
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  imageMode: ImageMode;
  setImageMode: (m: ImageMode) => void;
  imagePreview: string;
  setImagePreview: (v: string) => void;
  uploadFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: Category[];
  saving: boolean;
  uploading: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <button onClick={onCancel} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Basic Info</p>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Product Name <span className="text-red-400">*</span></label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Commercial Gas Range 6-Burner"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-orange-500 transition-colors appearance-none pr-8"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Describe the product..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Features <span className="text-gray-600">(one per line)</span></label>
              <textarea
                value={form.features.join('\n')}
                onChange={e => setForm(p => ({ ...p, features: e.target.value.split('\n') }))}
                rows={5}
                placeholder={"Heavy-duty stainless steel body\nAdjustable temperature control\nEnergy efficient burners"}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</p>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Availability</label>
                <div className="flex gap-2">
                  {(['available', 'sold_out'] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, availability: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        form.availability === v
                          ? v === 'available'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                      }`}
                    >
                      {v === 'available' ? 'Available' : 'Sold Out'}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-300 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400" /> Featured product
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right column — Image */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Product Image</p>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setImageMode('url'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  imageMode === 'url'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                <Link className="h-3.5 w-3.5" /> Image URL
              </button>
              <button
                type="button"
                onClick={() => { setImageMode('upload'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  imageMode === 'upload'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
              </button>
            </div>

            {imageMode === 'url' ? (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={e => {
                    setForm(p => ({ ...p, image_url: e.target.value }));
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl text-sm text-gray-400 hover:text-orange-400 transition-colors"
                >
                  <Upload className="h-6 w-6" />
                  {uploadFile ? (
                    <span className="text-green-400 text-xs">{uploadFile.name}</span>
                  ) : (
                    <span>Click to select image file</span>
                  )}
                </button>
              </div>
            )}

            {/* Preview */}
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-800">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-52 object-cover"
                    onError={() => setImagePreview('')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setForm(p => ({ ...p, image_url: '' }));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-52 flex flex-col items-center justify-center gap-2 text-gray-600">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-xs">Image preview</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Save bar */}
      <div className="flex gap-3 items-center pb-6">
        <button
          onClick={onSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {(saving || uploading) ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> {uploading ? 'Uploading...' : 'Saving...'}</>
          ) : (
            <><Check className="h-4 w-4" /> Save Product</>
          )}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
