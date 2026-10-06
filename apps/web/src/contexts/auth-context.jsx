import { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshSession() {
    try {
      const res = await api.post("/auth/refresh");
      setUser(res.data.user);
      setToken(res.data.accessToken);
      setAccessToken(res.data.accessToken);
    } catch {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(credentials) {
    const res = await api.post("/auth/login", credentials);
    setUser(res.data.user);
    setToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
    return res;
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    setUser(res.data.user);
    setToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
    return res;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    }
  }

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
