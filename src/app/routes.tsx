import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { ProductListing } from './pages/ProductListing';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Search } from './pages/Search';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminCategories } from './pages/admin/AdminCategories';

export const router = createBrowserRouter([
  // ── Public Store ──────────────────────────────────────────────────
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'categories', element: <Categories /> },
      { path: 'products', element: <ProductListing /> },
      { path: 'product/:id', element: <ProductDetails /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order-success', element: <OrderSuccess /> },
      { path: 'search', element: <Search /> },
    ],
  },
  // ── Admin ─────────────────────────────────────────────────────────
  { path: '/admin', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'products/new', element: <AdminProductForm /> },
      { path: 'products/:id/edit', element: <AdminProductForm /> },
      { path: 'categories', element: <AdminCategories /> },
    ],
  },
]);
