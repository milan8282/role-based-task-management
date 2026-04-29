import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    setUser(res.data.data.user);
    toast.success("Logged in successfully");
    return res.data.data.user;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    setUser(res.data.data.user);
    toast.success("Registered successfully");
    return res.data.data.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, authLoading, login, register, logout, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);