import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  _id: string;
  game: {
    _id: string;
    title: string;
    price: number;
    discountPrice?: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id?: string;
  items: CartItem[];
  totalPrice: number;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  error: string | null;
  addToCart: (gameId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<Cart>({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCart = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
      } else {
        setError(data.message || 'Failed to fetch cart');
        setCart({ items: [], totalPrice: 0 });
      }
    } catch (err) {
      setError('Error connecting to server');
      setCart({ items: [], totalPrice: 0 });
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch cart on mount or when user changes
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({ items: [], totalPrice: 0 });
    }
  }, [user, token, fetchCart]);

  const addToCart = async (gameId: string, quantity: number) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameId, quantity })
      });      const data = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
      } else {
        setError(data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });      const data = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
      } else {
        setError(data.message || 'Failed to update cart item');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error updating cart item:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (itemId: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });      const data = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
      } else {
        setError(data.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error removing cart item:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });      const data = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
      } else {
        setError(data.message || 'Failed to clear cart');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      error, 
      addToCart, 
      updateCartItem, 
      removeCartItem, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};