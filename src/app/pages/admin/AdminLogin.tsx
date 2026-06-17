import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../../components/Logo';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('vita_admin', '1');
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('كلمة المرور غير صحيحة');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center bg-[#0a0a14] p-4"
      dir="rtl"
    >
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#292b99]/20 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#292b99]/20 flex items-center justify-center mb-4 border border-[#292b99]/30">
              <Logo className="h-9 w-9 text-[#8c8eff]" />
            </div>
            <h1
              className="text-white text-3xl"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, letterSpacing: '0.06em' }}
            >
              Vita Shop
            </h1>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="أدخل كلمة المرور"
                  className="w-full pr-10 pl-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] focus:ring-2 focus:ring-[#292b99]/30 transition-colors text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#292b99] hover:bg-[#1b1d6f] text-white font-semibold transition-all duration-200 disabled:opacity-60 shadow-lg shadow-[#292b99]/30"
            >
              {loading ? '...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
