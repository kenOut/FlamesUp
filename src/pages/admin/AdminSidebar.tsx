import { LayoutDashboard, FileText, Package, ShoppingBag, LogOut, Flame, Grid3X3 } from 'lucide-react';
import { AdminTab } from './AdminDashboard';

interface Props {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  adminName: string;
  quotesCount: number;
  ordersCount: number;
  onSignOut: () => void;
}

const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'quotes', label: 'Quotes', icon: FileText },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
];

export default function AdminSidebar({ tab, setTab, adminName, quotesCount, ordersCount, onSignOut }: Props) {
  const badges: Partial<Record<AdminTab, number>> = { quotes: quotesCount, orders: ordersCount };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-gray-900 border-r border-gray-800 min-h-screen">
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">Admin Panel</span>
          </div>
          <p className="text-xs text-gray-500 pl-10">Flames Up Solutions</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badges[id] != null && badges[id]! > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400'}`}>
                  {badges[id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-gray-800 pt-4">
          <div className="px-4 py-3 rounded-xl bg-gray-800 mb-3">
            <p className="text-white text-sm font-semibold truncate">{adminName}</p>
            <p className="text-xs text-orange-400 font-medium">Administrator</p>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-gray-900 border-t border-gray-800">
        <div className="flex">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative ${
                tab === id ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              {badges[id] != null && badges[id]! > 0 && (
                <span className="absolute top-2 right-1/4 w-4 h-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                  {badges[id]}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={onSignOut}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Out
          </button>
        </div>
      </div>
    </>
  );
}
