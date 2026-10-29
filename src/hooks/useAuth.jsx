import { useState, useEffect, createContext, useContext } from 'react';
import { login as loginApi, getProfile, register as registerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('campuspadi_token');
    if (token) {
      getProfile()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('campuspadi_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, password) => {
    const res = await loginApi({ phone, password });
    const { user, token } = res.data.data;
    localStorage.setItem('campuspadi_token', token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    const { user, token } = res.data.data;
    localStorage.setItem('campuspadi_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('campuspadi_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);