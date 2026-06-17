import { Link, useLocation } from 'react-router';
import { ShoppingCart, Search, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Logo } from './Logo';

export function Header() {
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full flex flex-col">
      {/* Trust-building Top Bar */}
      <div className="w-full bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-medium tracking-wide">
        Carefully Selected Products | منتجات مختارة بعناية فائقة
      </div>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Vita Shop Home">
              <Logo className="h-12 w-auto text-primary transition-transform duration-300 group-hover:scale-105" />
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-xl font-brand font-semibold text-primary">Vita</span>
                <span className="text-xs font-brand font-medium text-primary/75 tracking-[0.2em] uppercase">Shop</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 font-medium">
              <Link
                to="/"
                className={`relative py-1 transition-colors duration-200 group/link ${isActive('/') ? 'text-primary' : 'text-foreground/80 hover:text-primary'
                  }`}
              >
                الرئيسية
                <span className={`absolute bottom-0 right-0 h-[2px] bg-primary transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover/link:w-full'
                  }`}></span>
              </Link>
              <Link
                to="/categories"
                className={`relative py-1 transition-colors duration-200 group/link ${isActive('/categories') ? 'text-primary' : 'text-foreground/80 hover:text-primary'
                  }`}
              >
                الأقسام
                <span className={`absolute bottom-0 right-0 h-[2px] bg-primary transition-all duration-300 ${isActive('/categories') ? 'w-full' : 'w-0 group-hover/link:w-full'
                  }`}></span>
              </Link>
              <Link
                to="/products"
                className={`relative py-1 transition-colors duration-200 group/link ${isActive('/products') ? 'text-primary' : 'text-foreground/80 hover:text-primary'
                  }`}
              >
                المنتجات
                <span className={`absolute bottom-0 right-0 h-[2px] bg-primary transition-all duration-300 ${isActive('/products') ? 'w-full' : 'w-0 group-hover/link:w-full'
                  }`}></span>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Link to="/search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                asChild
              >
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md border-2 border-background">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${isActive('/')
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }`}
                >
                  الرئيسية
                </Link>
                <Link
                  to="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${isActive('/categories')
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }`}
                >
                  الأقسام
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${isActive('/products')
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }`}
                >
                  المنتجات
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    </div>
  );
}
