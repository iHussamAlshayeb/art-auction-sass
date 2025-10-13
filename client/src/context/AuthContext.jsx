import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const tokenInStorage = localStorage.getItem('token');
    if (tokenInStorage) {
      try {
        const decodedUser = jwtDecode(tokenInStorage);
        setUser({ id: decodedUser.userId, role: decodedUser.role });
        setToken(tokenInStorage);
      } catch (error) {
        localStorage.removeItem('token');
      }
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// تم التعديل هنا
export function useAuth() {
  return useContext(AuthContext);
}