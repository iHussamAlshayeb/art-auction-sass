import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getMyProfile } from '../services/api'; // 1. استيراد دالة جلب الملف الشخصي

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // سيحتوي على بيانات المستخدم الكاملة
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isInitializing, setIsInitializing] = useState(true);

  // 2. دالة مخصصة لجلب بيانات المستخدم من الخادم
  const fetchUser = useCallback(async () => {
    // لا تحاول الجلب إذا لم يكن هناك توكن
    if (!localStorage.getItem('token')) {
      setIsInitializing(false);
      setUser(null); // التأكد من أن المستخدم فارغ
      return;
    }
    try {
      const response = await getMyProfile();
      setUser(response.data.user); // حفظ كائن المستخدم الكامل
    } catch (error) {
      // إذا كان التوكن غير صالح أو منتهي الصلاحية، قم بتسجيل الخروج
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      console.error("Auth token is invalid, logging out.", error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // 3. جلب بيانات المستخدم عند تحميل التطبيق لأول مرة
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // 4. جلب بيانات المستخدم الكاملة فور تسجيل الدخول
    fetchUser();
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

export function useAuth() {
  return useContext(AuthContext);
};