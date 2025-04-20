
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const TEST_ACCOUNTS = {
    'admin@admin.com': { password: 'admin123', id: '1', username: 'admin', role: 'admin' },
    'user1@test.com': { password: 'test123', id: '2', username: 'user1', role: 'user' },
    'user2@test.com': { password: 'test123', id: '3', username: 'user2', role: 'user' },
  };

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call
    // Mocking test accounts for demonstration
    const account = TEST_ACCOUNTS[email];
    
    if (account && account.password === password) {
      setUser({ id: account.id, username: account.username, role: account.role });
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
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
