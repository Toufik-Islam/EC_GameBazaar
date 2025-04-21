import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistGame {
  _id: string;
  title: string;
  price: number;
  discountPrice?: number;
  images: string[];
  releaseDate: string;
  developer: string;
  publisher: string;
  genre: string[];
  platform: string[];
}

interface Wishlist {
  _id?: string;
  games: WishlistGame[];
}

interface WishlistContextType {
  wishlist: Wishlist;
  loading: boolean;
  error: string | null;
  isInWishlist: (gameId: string) => boolean;
  addToWishlist: (gameId: string) => Promise<void>;
  removeFromWishlist: (gameId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist>({ games: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wishlist on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlist({ games: [] });
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.data);
      } else {
        setError(data.message || 'Failed to fetch wishlist');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (gameId: string) => {
    return wishlist.games.some(game => game._id === gameId);
  };

  const addToWishlist = async (gameId: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameId })
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.data);
      } else {
        setError(data.message || 'Failed to add game to wishlist');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error adding to wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (gameId: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/wishlist/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.data);
      } else {
        setError(data.message || 'Failed to remove game from wishlist');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error removing from wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.data);
      } else {
        setError(data.message || 'Failed to clear wishlist');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error clearing wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      error, 
      isInWishlist,
      addToWishlist, 
      removeFromWishlist, 
      clearWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};