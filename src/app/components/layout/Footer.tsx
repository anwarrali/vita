import React, { useState } from 'react';
import { Link } from 'react-router';
import { Instagram, Send } from 'lucide-react';

// TikTok SVG icon (not in lucide-react)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.17 8.17 0 0 0 4.77 1.52V6.79a4.84 4.84 0 0 1-1-.1z" />
  </svg>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://formspree.io/f/your_form_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail('');
        setMessage('');
      }
    } catch {
      // fail silently; user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand Column */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">Vita Shop</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              وجهتك الأولى لمنتجات التجميل والعناية بالبشرة والشعر — منتجات أصلية 100%.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com/vitashop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com/@vitashop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">الفئات</Link>
              </li>
              <li>
                <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">سلة التسوق</Link>
              </li>
            </ul>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="font-semibold mb-4">تواصل معنا</h3>
            {submitted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-primary font-medium">
                ✅ تم إرسال رسالتك! سنرد عليك قريباً.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg bg-background border border-border text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="رسالتك..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg bg-background border border-border text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
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

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Vita Shop. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};
