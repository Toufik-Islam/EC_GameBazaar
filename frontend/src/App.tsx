import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AuthRoute } from './components/AuthRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import GameDetailsPage from './pages/GameDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import ReturnsRefundsPage from './pages/ReturnsRefundsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SupportPage from './pages/SupportPage';
import HelpCenterPage from './pages/HelpCenterPage';
import BlogPage from './pages/BlogPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5c2d91', // Purple gaming theme
    },
    secondary: {
      main: '#ff5722', // Orange for call-to-actions
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
});

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <div className="app-container">
                <Header />                <main className="main-content">
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/game/:id" element={<GameDetailsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/profile" element={
                        <AuthRoute>
                        <ProfilePage />
                      </AuthRoute>
                    } />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/order-history" element={
                      <AuthRoute>
                        <OrderHistoryPage />
                      </AuthRoute>
                    } />
                    <Route path="/admin-dashboard" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/shipping" element={<ShippingInfoPage />} />
                    <Route path="/returns" element={<ReturnsRefundsPage />} />                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/help-center" element={<HelpCenterPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogDetailsPage />} />
                  </Routes>
                  </ErrorBoundary>
                </main>
                <Footer />
              </div>
            </ThemeProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
