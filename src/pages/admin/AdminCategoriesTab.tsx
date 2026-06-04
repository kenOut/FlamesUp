import { useState, useRef } from 'react';
import { Grid3X3, Pencil, X, Check, Upload, Link, ImageOff, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminCategory } from './AdminDashboard';

const imageMap: { [key: string]: string } = {
  flame: '/commercial_gas_range.jpg',
  snowflake: '/commercial_walk_in_cooler.png',
  utensils: '/commercial_mixer.jpg',
  droplet: '/commercial_deep_fryer.png',
  archive: '/commercial_reach_refrigerator.png',
  store: '/pizza_oven.jpg',
};

const fallbackImage = '/commercial_gas_range.jpg';

interface Props {
  categories: AdminCategory[];
  loading: boolean;
  onCategoryUpdated: (c: AdminCategory) => void;
}

type ImageMode = 'url' | 'upload';

export default function AdminCategoriesTab({ categories, loading, onCategoryUpdated }: Props) {
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [imageMode, setImageMode] = useState<ImageMode>('url');
  const [urlInput, setUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveImage = (c: AdminCategory) =>
    c.image_url || imageMap[c.icon || ''] || fallbackImage;

  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setImageMode('url');
    setUrlInput(c.image_url || '');
    setImagePreview(c.image_url || effectiveImage(c));
    setUploadFile(null);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUrlInput('');
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!uploadFile) return urlInput || null;
    setUploading(true);
    const ext = uploadFile.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error: upErr } = await supabase.storage
      .from('product-images')
      .upload(`categories/${filename}`, uploadFile, { upsert: false });
    setUploading(false);
    if (upErr) {
      setError(`Upload failed: ${upErr.message}`);
      return null;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');

    const finalImageUrl = await uploadImage();
    if (uploadFile && finalImageUrl === null) {
      setSaving(false);
      return;
    }

    const { data, error: saveErr } = await supabase
      .from('categories')
      .update({ image_url: finalImageUrl })
      .eq('id', editing.id)
      .select()
      .single();

    setSaving(false);
    if (saveErr) {
      setError(saveErr.message);
      return;
    }
    if (data) onCategoryUpdated(data as AdminCategory);
    setEditing(null);
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Category Image</h1>
            <p className="text-gray-400 text-sm mt-0.5">{editing.name}</p>
          </div>
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        </div>

        <div className="max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Category Image</p>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImageMode('url')}
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
              onClick={() => setImageMode('upload')}
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
                value={urlInput}
                onChange={e => {
                  setUrlInput(e.target.value);
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
                onChange={handleFileChange}
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
                    setUrlInput('');
                    setUploadFile(null);
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {saving || uploading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> {uploading ? 'Uploading...' : 'Saving...'}</>
              ) : (
                <><Check className="h-4 w-4" /> Save Image</>
              )}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Categories</h1>
        <p className="text-gray-400 text-sm">Manage category images shown on the home page</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 rounded-2xl bg-gray-900 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <Grid3X3 className="h-10 w-10 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400">No categories found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => (
            <div
              key={c.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all"
            >
              <div className="relative group h-40">
                <img
                  src={effectiveImage(c)}
                  alt={c.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                />
                {c.image_url && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-600/90 text-white">
                    Custom
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Edit Image
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{c.name}</p>
                  {c.description && (
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{c.description}</p>
                  )}
                </div>
                <button
                  onClick={() => openEdit(c)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
