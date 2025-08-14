import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
console.log("API_BASE:", API_BASE);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios baseURL immediately
  useEffect(() => {
    axios.defaults.baseURL = API_BASE;
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    async function bootstrap() {
      try {
        if (!token) return;
        const { data } = await axios.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        console.error("Auth bootstrap error:", error);
        setToken(null);
        localStorage.removeItem("jwt");
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      bootstrap();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function login({ email, password, role }) {
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      localStorage.setItem("jwt", data.token);
      setToken(data.token);
      setUser(data.user);
      return redirectForRole(data.user.role);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async function signup({ name, email, password, role }) {
    try {
      const { data } = await axios.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem("jwt", data.token);
      setToken(data.token);
      setUser(data.user);
      return redirectForRole(data.user.role);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
  }

  function redirectForRole(role) {
    switch (role) {
      case "Citizen":
        return "/citizen/report";
      case "Enforcement":
        return "/enforce-dashboard";
      case "Admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      redirectForRole,
      isAuthenticated: !!token,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
