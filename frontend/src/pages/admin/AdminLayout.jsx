import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  RotateCcw, 
  Boxes, 
  ShoppingBag, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const NAV_ITEMS = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/rentals', label: 'Rentals', icon: Package },
    { to: '/admin/returns', label: 'Return Requests', icon: RotateCcw },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
    { to: '/admin/products', label: 'Products', icon: ShoppingBag },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/kyc', label: 'KYC Reviews', icon: ShieldCheck },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-black text-lg shadow-sm">
              R
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-[var(--text)] leading-none">RentIt</h1>
              <span className="text-[10px] font-bold text-[var(--accent)] tracking-wider uppercase">Ops Portal</span>
            </div>
          </Link>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? 'bg-[var(--accent)] text-white font-semibold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-subtle)]/50">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text)] truncate">{user?.email}</p>
              <p className="text-[10px] font-semibold text-[var(--accent)] uppercase">{user?.role || 'ADMIN'}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn-outline w-full justify-center text-xs py-2 text-[var(--danger)] border-[var(--danger-subtle)] hover:bg-[var(--danger-subtle)]"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
