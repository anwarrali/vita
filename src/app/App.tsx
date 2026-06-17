import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Set RTL direction
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </CartProvider>
    </ThemeProvider>
  );
}
