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
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8fa7ff',
      dark: '#3f4fb7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#a679d5',
      dark: '#4a2171',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff4757',
      light: '#ff6b7a',
      dark: '#cc0e2d',
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.95)',
    },    text: {
      primary: '#2c3e50',
      secondary: '#5a6c7d',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif',    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      color: '#2c3e50', // Dark color for better contrast
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      color: '#2c3e50',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.1)',
    '0px 4px 16px rgba(0,0,0,0.1)',
    '0px 8px 24px rgba(0,0,0,0.12)',
    '0px 12px 32px rgba(0,0,0,0.14)',
    ...Array(20).fill('0px 16px 40px rgba(0,0,0,0.16)'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.6)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            background: 'rgba(102, 126, 234, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#2c3e50',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
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
