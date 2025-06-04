import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: 'admin' | 'user';
  token?: string; // Add token to user object for easier access
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
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        
        // Verify token is still valid
        verifyToken(savedToken);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('gameBazaar_user');
        localStorage.removeItem('gameBazaar_token');
      }
    }
  }, []);
  
  // Verify token is valid with backend
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Id': user?.id || '' // Add user ID for development mode
        }
      });
      
      if (!response.ok) {
        // Token is invalid, log the user out
        console.warn('Stored token is invalid, logging out');
        logout();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // Don't log out on network errors to allow offline use
    }
  };
  // For development only - use these test accounts if backend auth is not working
  const TEST_ACCOUNTS: Record<string, { password: string; id: string; username: string; role: 'admin' | 'user' }> = {
    'admin@admin.com': { password: 'admin123', id: '1', username: 'admin', role: 'admin' as const },
    'user1@test.com': { password: 'test123', id: '2', username: 'user1', role: 'user' as const },
    'user2@test.com': { password: 'test123', id: '3', username: 'user2', role: 'user' as const },
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
          role: data.user.role,
          token: data.token // Store token in user object too for convenience
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
          
          // For development environment only - not for production use
          // This assumes the server is in development mode and will accept this token format
          const testToken = 'dev_token_' + Math.random().toString(36).substring(2);
          
          const userData = {
            id: account.id,
            username: account.username,
            role: account.role,
            token: testToken
          };
          
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
