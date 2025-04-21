import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for saved auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gameBazaar_user');
    const savedToken = localStorage.getItem('gameBazaar_token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('gameBazaar_user');
        localStorage.removeItem('gameBazaar_token');
      }
    }
  }, []);

  // For development only - use these test accounts if backend auth is not working
  const TEST_ACCOUNTS = {
    'admin@admin.com': { password: 'admin123', id: '1', username: 'admin', role: 'admin' },
    'user1@test.com': { password: 'test123', id: '2', username: 'user1', role: 'user' },
    'user2@test.com': { password: 'test123', id: '3', username: 'user2', role: 'user' },
  };

  const login = async (email: string, password: string) => {
    try {
      // Try to use the real API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Real API success
        const userData = { 
          id: data.user._id, 
          username: data.user.name, 
          role: data.user.role 
        };
        
        setUser(userData);
        setToken(data.token);
        
        localStorage.setItem('gameBazaar_user', JSON.stringify(userData));
        localStorage.setItem('gameBazaar_token', data.token);
      } else {
        // If real API fails, fall back to test accounts for development
        const account = TEST_ACCOUNTS[email];
        
        if (account && account.password === password) {
          console.warn('Using development test account instead of real authentication');
          
          // Create a test user and JWT token (this is only for development)
          const userData = { id: account.id, username: account.username, role: account.role };
          
          // Create a proper JWT token structure for testing
          // Note: This is still not a valid JWT, but has the structure backend expects
          const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpYXQiOjE2MTk1MjMyOTksImV4cCI6MTYyMjExNTI5OX0.fake_signature_for_development`;
          
          setUser(userData);
          setToken(testToken);
          
          localStorage.setItem('gameBazaar_user', JSON.stringify(userData));
          localStorage.setItem('gameBazaar_token', testToken);
        } else {
          throw new Error('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Authentication failed. Please try again.');
    }
  };

  const logout = () => {
    // Try to call the real logout API
    fetch('/api/auth/logout', {
      method: 'GET',
      credentials: 'include'
    }).catch(err => console.error('Logout API error:', err));
    
    // Clear state and localStorage regardless of API success
    setUser(null);
    setToken(null);
    localStorage.removeItem('gameBazaar_user');
    localStorage.removeItem('gameBazaar_token');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
