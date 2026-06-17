import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Logo } from '../Logo';
import {
  LayoutDashboard,
  Package,
  Tag,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/categories', icon: Tag, label: 'الأقسام' },
];

function AdminSidebar({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const location = useLocation();

  return (
    <aside className="flex flex-col h-full bg-[#0f0f1b] text-white w-64 shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Logo className="h-8 w-8 text-[#8c8eff]" />
        <div>
          <p
            className="font-brand text-lg leading-none text-white"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.05em' }}
          >
            Vita Shop
          </p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-[#292b99] text-white shadow-lg shadow-[#292b99]/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="h-3 w-3 mr-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('vita_admin') !== '1') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem('vita_admin');
    navigate('/admin', { replace: true });
  }

  return (
    <div className="admin-layout flex min-h-dvh md:h-dvh md:max-h-dvh md:overflow-hidden bg-[#0a0a14] text-white" dir="rtl">
      <div className="hidden md:flex">
        <AdminSidebar onLogout={logout} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64">
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} onLogout={logout} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 md:min-h-0 md:overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10 bg-[#0f0f1b] shrink-0 sticky top-0 z-10">
          <button
            type="button"
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-medium text-white/50">
            {NAV.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Admin'}
          </h1>
          <Link to="/" className="text-xs text-[#8c8eff] hover:underline">
            ← عودة للمتجر
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 md:min-h-0 md:overflow-y-auto overscroll-y-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
