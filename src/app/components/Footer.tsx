import { Link } from 'react-router';
import { Instagram, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.17 8.17 0 0 0 4.77 1.52V6.79a4.84 4.84 0 0 1-1-.1z" />
  </svg>
);

export function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        email: email.trim(),
        message: message.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      setEmail('');
      setMessage('');
    } catch {
      toast.error('تعذر إرسال الرسالة. حاولي مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-bold text-lg mb-3">Vita</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              متجر موثوق للعناية بالبشرة والمكياج والإكسسوارات. دفع عند الاستلام وتوصيل لجميع المناطق.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://instagram.com/vitashop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@vitashop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">الأقسام</Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">المنتجات</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            {submitted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-primary font-medium">
                تم إرسال رسالتك. سنرد عليك قريباً.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg bg-background border border-border text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="رسالتك..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg bg-background border border-border text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 Vita. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
