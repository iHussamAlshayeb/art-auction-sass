import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const tokenInStorage = localStorage.getItem('token');
      if (tokenInStorage) {
        const decodedUser = jwtDecode(tokenInStorage);
        // يمكنك إضافة فحص لصلاحية التوكن هنا إذا أردت
        setUser({ id: decodedUser.userId, role: decodedUser.role });
        setToken(tokenInStorage);
      }
    } catch (error) {
      // التعامل مع التوكن التالف
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      // 3. أخبر التطبيق بأن عملية التحقق الأولية قد انتهت
      setIsInitializing(false);
    }
  }, []);

  const login = (newToken) => {
    const decodedUser = jwtDecode(newToken);
    localStorage.setItem('token', newToken);
    setUser({ id: decodedUser.userId, role: decodedUser.role });
    setToken(newToken);
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