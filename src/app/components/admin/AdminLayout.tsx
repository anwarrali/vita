import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Logo } from '../Logo';
import {
  LayoutDashboard,
  Package,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/categories', icon: Tag, label: 'الأقسام' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard: if not logged in, redirect to /admin
  useEffect(() => {
    if (sessionStorage.getItem('vita_admin') !== '1') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem('vita_admin');
    navigate('/admin', { replace: true });
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#0f0f1b] text-white w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Logo className="h-8 w-8 text-[#8c8eff]" />
        <div>
          <p className="font-brand text-lg leading-none text-white"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.05em' }}>
            Vita Shop
          </p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
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

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a14] text-white" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f0f1b] shrink-0">
          <button
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
