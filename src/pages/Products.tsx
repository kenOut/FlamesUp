import { useEffect, useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Check, ChevronRight, X, SlidersHorizontal, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import CartDrawer from '../components/shop/CartDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase, Product, Category, SubCategory } from '../lib/supabase';

function isDaytime(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

type Theme = 'light' | 'dark';

interface ThemeClasses {
  page: string;
  header: string;
  headerBorder: string;
  input: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  categoryBtn: string;
  sidebarOverlay: string;
  sidebarPanel: string;
  sidebarTitle: string;
  sidebarLabel: string;
  categoryActive: string;
  categoryInactive: string;
  breadcrumb: string;
  breadcrumbLink: string;
  breadcrumbCurrent: string;
  subActive: string;
  subInactive: string;
  skeletonCard: string;
  skeletonBlock: string;
  emptyIcon: string;
  emptyText: string;
  emptySubtext: string;
  countText: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardOverlay: string;
  cardTitle: string;
  cardDesc: string;
  cardFeature: string;
  titleText: string;
  subtitleText: string;
  filterBtnBg: string;
  filterBtnText: string;
  filterBtnBorder: string;
}

const darkTheme: ThemeClasses = {
  page: 'bg-gray-950',
  header: 'bg-black',
  headerBorder: 'border-gray-800',
  input: 'bg-gray-900',
  inputBorder: 'border-gray-700',
  inputText: 'text-white',
  inputPlaceholder: 'placeholder-gray-500',
  categoryBtn: 'bg-gray-900 border-gray-700 text-gray-300',
  sidebarOverlay: 'bg-black/60',
  sidebarPanel: 'bg-gray-950 border-gray-800',
  sidebarTitle: 'text-white',
  sidebarLabel: 'text-gray-500',
  categoryActive: 'bg-orange-600/20 text-orange-400 font-medium',
  categoryInactive: 'text-gray-400 hover:text-white hover:bg-gray-900',
  breadcrumb: 'text-gray-500',
  breadcrumbLink: 'hover:text-orange-400',
  breadcrumbCurrent: 'text-gray-300',
  subActive: 'bg-orange-600 text-white',
  subInactive: 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white',
  skeletonCard: 'bg-gray-900',
  skeletonBlock: 'bg-gray-800',
  emptyIcon: 'text-gray-700',
  emptyText: 'text-gray-400',
  emptySubtext: 'text-gray-600',
  countText: 'text-gray-500',
  cardBg: 'bg-gray-900',
  cardBorder: 'border-gray-800',
  cardHoverBorder: 'hover:border-orange-500/40',
  cardOverlay: 'from-gray-900/60',
  cardTitle: 'text-white',
  cardDesc: 'text-gray-500',
  cardFeature: 'text-gray-400',
  titleText: 'text-white',
  subtitleText: 'text-gray-400',
  filterBtnBg: 'bg-gray-900',
  filterBtnText: 'text-gray-300',
  filterBtnBorder: 'border-gray-700',
};

const lightTheme: ThemeClasses = {
  page: 'bg-gray-50',
  header: 'bg-white',
  headerBorder: 'border-gray-200',
  input: 'bg-gray-100',
  inputBorder: 'border-gray-300',
  inputText: 'text-gray-900',
  inputPlaceholder: 'placeholder-gray-400',
  categoryBtn: 'bg-white border-gray-300 text-gray-600',
  sidebarOverlay: 'bg-black/40',
  sidebarPanel: 'bg-white border-gray-200',
  sidebarTitle: 'text-gray-900',
  sidebarLabel: 'text-gray-400',
  categoryActive: 'bg-orange-50 text-orange-600 font-medium',
  categoryInactive: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  breadcrumb: 'text-gray-400',
  breadcrumbLink: 'hover:text-orange-500',
  breadcrumbCurrent: 'text-gray-700',
  subActive: 'bg-orange-600 text-white',
  subInactive: 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-800',
  skeletonCard: 'bg-white border border-gray-200',
  skeletonBlock: 'bg-gray-200',
  emptyIcon: 'text-gray-300',
  emptyText: 'text-gray-500',
  emptySubtext: 'text-gray-400',
  countText: 'text-gray-400',
  cardBg: 'bg-white',
  cardBorder: 'border-gray-200',
  cardHoverBorder: 'hover:border-orange-400/60',
  cardOverlay: 'from-black/30',
  cardTitle: 'text-gray-900',
  cardDesc: 'text-gray-500',
  cardFeature: 'text-gray-500',
  titleText: 'text-gray-900',
  subtitleText: 'text-gray-500',
  filterBtnBg: 'bg-white',
  filterBtnText: 'text-gray-600',
  filterBtnBorder: 'border-gray-300',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(isDaytime() ? 'light' : 'dark');

  const t = theme === 'light' ? lightTheme : darkTheme;
  const { addToCart, totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const checkTime = () => setTheme(isDaytime() ? 'light' : 'dark');
    const interval = setInterval(checkTime, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [catRes, subRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('sub_categories').select('*').order('sort_order'),
        supabase.from('products').select('*').order('name')
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (subRes.data) setSubCategories(subRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const activeSubs = useMemo(() =>
    subCategories.filter(sc => sc.category_id === selectedCategory),
    [subCategories, selectedCategory]
  );

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchesSub = selectedSubCategory === 'all' || p.sub_category_id === selectedSubCategory;
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSub && matchesSearch;
    });
  }, [products, selectedCategory, selectedSubCategory, searchTerm]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
    setSidebarOpen(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className={`min-h-screen transition-colors duration-700 ${t.page}`}>
      <CartDrawer />

      {/* Header */}
      <div className={`${t.header} border-b ${t.headerBorder} sticky top-0 z-30 transition-colors duration-700`}>
        <Container>
          <div className="flex items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-4">
              {user && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${t.filterBtnBg} ${t.filterBtnBorder} ${t.filterBtnText} hover:border-orange-500`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-700 ${t.titleText}`}>Equipment Catalogue</h1>
                <p className={`text-sm hidden sm:block transition-colors duration-700 ${t.subtitleText}`}>Browse & request quotes for commercial kitchen equipment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme indicator */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${t.filterBtnBg} ${t.filterBtnBorder} ${t.filterBtnText}`}>
                {theme === 'light' ? <Sun className="h-3.5 w-3.5 text-orange-500" /> : <Moon className="h-3.5 w-3.5 text-blue-400" />}
                {theme === 'light' ? 'Day mode' : 'Evening mode'}
              </div>
              <div className={`relative hidden md:block`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${t.subtitleText}`} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 ${t.input} border ${t.inputBorder} rounded-lg ${t.inputText} text-sm ${t.inputPlaceholder} focus:outline-none focus:border-orange-500 transition-colors w-60`}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.subtitleText} hover:text-orange-500`}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden flex items-center gap-2 px-3 py-2 ${t.filterBtnBg} border ${t.filterBtnBorder} rounded-lg ${t.filterBtnText} text-sm hover:border-orange-500 transition-colors`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Categories
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Quote Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
          {/* Mobile search */}
          <div className="pb-3 md:hidden">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${t.subtitleText}`} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${t.input} border ${t.inputBorder} rounded-lg ${t.inputText} text-sm ${t.inputPlaceholder} focus:outline-none focus:border-orange-500 transition-colors`}
              />
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex gap-6 py-6">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className={`fixed inset-0 ${t.sidebarOverlay}`} onClick={() => setSidebarOpen(false)} />
              <div className={`fixed left-0 top-0 h-full w-72 ${t.sidebarPanel} border-r overflow-y-auto p-4 z-50 transition-colors duration-700`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${t.sidebarTitle}`}>Categories</h3>
                  <button onClick={() => setSidebarOpen(false)} className={`${t.subtitleText} hover:text-orange-500`}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <CategoryList theme={t} categories={categories} selectedCategory={selectedCategory} onSelect={handleCategorySelect} />
              </div>
            </div>
          )}

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28 space-y-1">
              <p className={`text-xs uppercase tracking-widest font-semibold mb-3 px-2 transition-colors duration-700 ${t.sidebarLabel}`}>Categories</p>
              <CategoryList theme={t} categories={categories} selectedCategory={selectedCategory} onSelect={handleCategorySelect} />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="mb-5">
              <div className={`flex items-center gap-2 text-sm mb-3 transition-colors duration-700 ${t.breadcrumb}`}>
                <button onClick={() => handleCategorySelect('all')} className={`transition-colors ${t.breadcrumbLink}`}>All</button>
                {currentCategory && (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <span className={`transition-colors duration-700 ${t.breadcrumbCurrent}`}>{currentCategory.name}</span>
                  </>
                )}
              </div>

              {selectedCategory !== 'all' && activeSubs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubCategory('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedSubCategory === 'all' ? t.subActive : t.subInactive
                    }`}
                  >
                    All
                  </button>
                  {activeSubs.map(sc => (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedSubCategory(sc.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedSubCategory === sc.id ? t.subActive : t.subInactive
                      }`}
                    >
                      {sc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`${t.skeletonCard} rounded-2xl overflow-hidden animate-pulse`}>
                    <div className={`h-48 ${t.skeletonBlock}`} />
                    <div className="p-4 space-y-2">
                      <div className={`h-4 ${t.skeletonBlock} rounded w-3/4`} />
                      <div className={`h-3 ${t.skeletonBlock} rounded w-full`} />
                      <div className={`h-3 ${t.skeletonBlock} rounded w-2/3`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Search className={`h-12 w-12 mx-auto mb-4 transition-colors duration-700 ${t.emptyIcon}`} />
                <p className={`text-lg transition-colors duration-700 ${t.emptyText}`}>No products found</p>
                <p className={`text-sm mt-1 transition-colors duration-700 ${t.emptySubtext}`}>Try a different search or category</p>
              </div>
            ) : (
              <>
                <p className={`text-sm mb-4 transition-colors duration-700 ${t.countText}`}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      theme={t}
                      product={product}
                      added={addedIds.has(product.id)}
                      onAdd={() => handleAddToCart(product)}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

function CategoryList({ categories, selectedCategory, onSelect, theme: t }: {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
  theme: ThemeClasses;
}) {
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => onSelect('all')}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
          selectedCategory === 'all' ? t.categoryActive : t.categoryInactive
        }`}
      >
        All Products
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
            selectedCategory === cat.id ? t.categoryActive : t.categoryInactive
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product, added, onAdd, theme: t }: { product: Product; added: boolean; onAdd: () => void; theme: ThemeClasses }) {
  return (
    <div className={`group ${t.cardBg} rounded-2xl overflow-hidden border ${t.cardBorder} ${t.cardHoverBorder} transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col`}>
      <div className="relative overflow-hidden h-48 bg-gray-100 dark:bg-gray-800">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:object-contain group-hover:scale-100 transition-all duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${t.cardOverlay} to-transparent`} />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className={`font-semibold text-sm leading-tight mb-1.5 transition-colors duration-700 ${t.cardTitle}`}>{product.name}</h3>
        {product.description && (
          <p className={`text-xs line-clamp-2 mb-3 flex-1 transition-colors duration-700 ${t.cardDesc}`}>{product.description}</p>
        )}
        {product.features && product.features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {product.features.slice(0, 2).map((f, i) => (
              <li key={i} className={`flex items-center gap-1.5 text-xs transition-colors duration-700 ${t.cardFeature}`}>
                <span className="w-1 h-1 rounded-full bg-orange-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onAdd}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            added ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'
          }`}
        >
          {added ? (
            <><Check className="h-4 w-4" /> Added to Quote</>
          ) : (
            <><Plus className="h-4 w-4" /> Add to Quote</>
          )}
        </button>
      </div>
    </div>
  );
}
