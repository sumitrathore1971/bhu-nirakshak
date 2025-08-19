import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
console.log("API_BASE:", API_BASE);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || null);
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState(null);

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
        setUser(normalizeUser(data.user));
        localStorage.setItem("user", JSON.stringify(normalizeUser(data.user)));
      } catch (error) {
        console.error("Auth bootstrap error:", error);
        setToken(null);
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      bootstrap();
    } else {
      setLoading(false);
      localStorage.removeItem("user");
    }
  }, [token]);

  const showFlashMessage = (message, type = "success") => {
    setFlashMessage({ message, type });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setFlashMessage(null);
    }, 5000);
  };

  async function login({ email, password, role }) {
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      localStorage.setItem("jwt", data.token);
      setToken(data.token);
      setUser(normalizeUser(data.user));
      localStorage.setItem("user", JSON.stringify(normalizeUser(data.user)));
      showFlashMessage(
        `Welcome back, ${data.user.name}! Login successful.`,
        "success"
      );
      return redirectForRole(data.user.role);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      showFlashMessage(errorMessage, "error");
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
      setUser(normalizeUser(data.user));
      localStorage.setItem("user", JSON.stringify(normalizeUser(data.user)));
      showFlashMessage(
        `Welcome, ${data.user.name}! Account created successfully.`,
        "success"
      );
      return redirectForRole(data.user.role);
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Signup failed. Please try again with different credentials.";
      showFlashMessage(errorMessage, "error");
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    showFlashMessage("You have been logged out successfully.", "success");
  }

  function redirectForRole(role) {
    switch (role) {
      case "Citizen":
        return "/citizen/report";
      case "Enforcement":
        return "/enforce-dashboard";
      case "Admin":
        return "/admin-dashboard";
      case "UrbanDevelopment":
        return "/department";
      case "Revenue":
        return "/revenue-dashboard";
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
      flashMessage,
      showFlashMessage,
      setUser,
    }),
    [user, token, loading, flashMessage]
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

// In setUser and localStorage, always ensure user.id is present
function normalizeUser(u) {
  if (!u) return u;
  if (u.id) return u;
  if (u._id) return { ...u, id: u._id };
  return u;
}
