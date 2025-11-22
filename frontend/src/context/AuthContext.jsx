import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch (error) {
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      setUser(data.data.user);
      toast.success('تم تسجيل الدخول بنجاح');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'فشل تسجيل الدخول';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('accessToken');
      setUser(null);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
