import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { AuthContext } from "./auth-context";

axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.AUTH_ME);
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(API_ENDPOINTS.AUTH_LOGIN, {
        email,
        password,
      });

      setUser(res.data.user);

      return {
        success: true,
        user: res.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(API_ENDPOINTS.AUTH_LOGOUT);
      setUser(null);
    } catch {
      console.error("Logout failed");
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
