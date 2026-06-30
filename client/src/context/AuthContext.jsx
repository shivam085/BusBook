import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock login — will be replaced with API call in Phase 2
  const login = async (email, password) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const mockUser = {
        id: 1,
        name: email === 'admin@bus.com' ? 'Admin' : 'John Doe',
        email,
        role: email === 'admin@bus.com' ? 'admin' : 'user',
      };
      setUser(mockUser);
      localStorage.setItem('bus_user', JSON.stringify(mockUser));
      return { success: true };
    } catch {
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const mockUser = { id: 2, name, email, role: 'user' };
      setUser(mockUser);
      localStorage.setItem('bus_user', JSON.stringify(mockUser));
      return { success: true };
    } catch {
      return { success: false, message: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bus_user');
    localStorage.removeItem('bus_token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
