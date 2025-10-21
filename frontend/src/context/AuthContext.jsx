import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getMyProfile, getUnreadNotifCount } from '../services/api'; // 1. استيراد دالة جلب الملف الشخصي

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // سيحتوي على بيانات المستخدم الكاملة
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isInitializing, setIsInitializing] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

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


  const fetchUnreadCount = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await getUnreadNotifCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };
  // 3. جلب بيانات المستخدم عند تحميل التطبيق لأول مرة
  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUser();
      await fetchUnreadCount(); // جلب العدد عند بدء التشغيل
      setIsInitializing(false);
    };
    initializeAuth();


    // إعداد جلب دوري لعدد الإشعارات كل دقيقة
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // 60000ms = 1 دقيقة

    return () => clearInterval(interval); // تنظيف المؤقت عند إزالة المكون
  }, [fetchUser]);


  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // 4. جلب بيانات المستخدم الكاملة فور تسجيل الدخول
    fetchUser();
    fetchUnreadCount();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout, unreadCount, setUnreadCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
};