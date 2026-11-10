import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "bek_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check whether a saved token is still valid
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api("me", { token }).then((res) => {
      if (res && res.ok) {
        setUser(res.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      setLoading(false);
    });
  }, []);

  const requestCode = useCallback((email) => api("requestCode", { email }), []);

  const verifyCode = useCallback(async (email, code) => {
    const res = await api("verifyCode", { email, code });
    if (res && res.ok) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) await api("logout", { token });
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, requestCode, verifyCode, logout, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
