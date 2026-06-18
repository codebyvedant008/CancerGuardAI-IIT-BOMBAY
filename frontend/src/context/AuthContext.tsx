"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, UserProfile } from "@/services/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    age: number | null,
    gender: string | null
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    fullName?: string;
    age?: number | null;
    gender?: string | null;
    password?: string;
  }) => Promise<UserProfile>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user profile on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const userProfile = await api.get<UserProfile>("/auth/me");
          setUser(userProfile);
        } catch (err: any) {
          console.error("Failed to load user session", err);
          // Token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post<{ access_token: string; token_type: string }>(
        "/auth/login",
        formData
      );

      localStorage.setItem("token", response.access_token);
      setToken(response.access_token);
      
      const profile = await api.get<UserProfile>("/auth/me");
      setUser(profile);
      
      // Redirect based on role
      if (profile.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    age: number | null,
    gender: string | null
  ) => {
    setError(null);
    setLoading(true);
    try {
      await api.post<UserProfile>("/auth/register", {
        email,
        password,
        full_name: fullName,
        age: age ? Number(age) : null,
        gender: gender || null,
      });
      
      // Auto login after registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (data: {
    fullName?: string;
    age?: number | null;
    gender?: string | null;
    password?: string;
  }) => {
    setError(null);
    try {
      const updatedUser = await api.put<UserProfile>("/auth/profile", {
        full_name: data.fullName,
        age: data.age,
        gender: data.gender,
        password: data.password || undefined,
      });
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
