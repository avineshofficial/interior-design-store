import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import Components and Route Protections
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';

// Import Public Pages
import HomePage from './pages/HomePage';
import ProductsListPage from './pages/ProductsListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Import Auth Pages
import SignInPage from './pages/Auth/SignInPage';
import SignUpPage from './pages/Auth/SignUpPage';

// Import Protected User Pages
import UserProfilePage from './pages/UserProfilePage';
import UserAddressesPage from './pages/UserAddressesPage';
import UserOrdersPage from './pages/UserOrdersPage';
import UserOrderDetailsPage from './pages/UserOrderDetailsPage';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import OrderHistoryPage from './pages/OrderHistoryPage';

// Import Protected Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminOrderDetails from './pages/Admin/AdminOrderDetails';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminProductEdit from './pages/Admin/AdminProductEdit';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage'; // <-- IMPORT USERS PAGE
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage'; // <-- IMPORT ANALYTICS PAGE
import { ToastProvider } from './components/Toast/Toast';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <Header />
            <main className="container">
              <Routes>
                {/* --- Public & Auth Routes --- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsListPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth/signin" element={<SignInPage />} />
                <Route path="/auth/signup" element={<SignUpPage />} />
                
                {/* --- Protected CUSTOMER Routes --- */}
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                <Route path="/addresses" element={<ProtectedRoute><UserAddressesPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><UserOrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><UserOrderDetailsPage /></ProtectedRoute>} />
                
                {/* --- Protected ADMIN Routes --- */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetails /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
                <Route path="/admin/products/new" element={<AdminRoute><AdminProductEdit /></AdminRoute>} />
                <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminProductEdit /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
                <Route path="/order-history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                {/* --- NEW ROUTES --- */}
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </Router>
          </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;