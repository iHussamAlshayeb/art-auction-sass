import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getMyProfile } from '../services/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setIsInitializing(false);
      return;
    }
    try {
      const response = await getMyProfile();
      setUser(response.data.user);
    } catch (error) {
      // إذا كان التوكن غير صالح، قم بتسجيل الخروج
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    fetchUser(); // جلب بيانات المستخدم الكاملة بعد تسجيل الدخول
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// تم التعديل هنا
export function useAuth() {
  return useContext(AuthContext);
}