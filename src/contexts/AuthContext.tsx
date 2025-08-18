import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axiosInstance, { setAuthToken } from "../utils/axiosInstance";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>; // <-- Added here
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("jwt") || null
  );

  // Set the auth header and fetch user if token exists
  useEffect(() => {
    setAuthToken(token);

    const loadUser = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get("/users/me");
          setUser(res.data);
        } catch (err) {
          console.error("Failed to fetch user:", err);
          logout(); // if token is invalid
        }
      }
    };

    loadUser();
  }, [token]);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      setAuthToken(null); // Clear previous token
      const res = await axiosInstance.post("/auth/local", {
        identifier,
        password,
      });

      const jwt = res.data.jwt;
      const user = res.data.user;

      localStorage.setItem("jwt", jwt);
      setUser(user);
      setToken(jwt);

      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Login error:", err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.error("Login error:", err.message);
      } else {
        console.error("Unknown login error");
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  // <-- New method to refresh user data
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axiosInstance.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to refresh user:", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
