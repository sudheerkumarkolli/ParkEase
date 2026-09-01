"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Role } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<User>;
  sendOtp: (email: string) => Promise<{ message: string; email: string; dev_otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("parkease_access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get<User>("/users/me");
      setUser(res.data);
      localStorage.setItem("parkease_user", JSON.stringify(res.data));
    } catch (err) {
      setUser(null);
      localStorage.removeItem("parkease_access_token");
      localStorage.removeItem("parkease_refresh_token");
      localStorage.removeItem("parkease_user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const sendOtp = async (email: string) => {
    const res = await api.post("/auth/send-otp", { email });
    return res.data;
  };

  const verifyOtp = async (email: string, otp: string): Promise<User> => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    const { access_token, refresh_token, user: loggedUser } = res.data;
    localStorage.setItem("parkease_access_token", access_token);
    localStorage.setItem("parkease_refresh_token", refresh_token);
    localStorage.setItem("parkease_user", JSON.stringify(loggedUser));
    setUser(loggedUser);

    // Redirect based on role
    if (loggedUser.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (loggedUser.role === "PARKING_MANAGER") {
      router.push("/manager/dashboard");
    } else {
      router.push("/dashboard");
    }
    return loggedUser;
  };

  const login = async (email: string, password?: string): Promise<User> => {
    const res = await api.post("/auth/login", { email, password });
    const { access_token, refresh_token, user: loggedUser } = res.data;
    localStorage.setItem("parkease_access_token", access_token);
    localStorage.setItem("parkease_refresh_token", refresh_token);
    localStorage.setItem("parkease_user", JSON.stringify(loggedUser));
    setUser(loggedUser);

    // Redirect based on role
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get("redirect");

    if (loggedUser.role === "ADMIN") {
      router.push(redirectUrl || "/admin/dashboard");
    } else if (loggedUser.role === "PARKING_MANAGER") {
      router.push(redirectUrl || "/manager/dashboard");
    } else {
      router.push(redirectUrl || "/dashboard");
    }
    return loggedUser;
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post("/auth/register", data);
    const { access_token, refresh_token, user: registeredUser } = res.data;
    localStorage.setItem("parkease_access_token", access_token);
    localStorage.setItem("parkease_refresh_token", refresh_token);
    localStorage.setItem("parkease_user", JSON.stringify(registeredUser));
    setUser(registeredUser);

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get("redirect");
    router.push(redirectUrl || "/dashboard");
    return registeredUser;
  };


  const logout = () => {
    const refreshToken = localStorage.getItem("parkease_refresh_token");
    if (refreshToken) {
      api.post("/auth/logout", { refresh_token: refreshToken }).catch(() => {});
    }
    localStorage.removeItem("parkease_access_token");
    localStorage.removeItem("parkease_refresh_token");
    localStorage.removeItem("parkease_user");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        sendOtp,
        verifyOtp,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
