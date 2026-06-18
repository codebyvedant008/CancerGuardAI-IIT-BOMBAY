"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { user, login, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Clear errors when entering the page
    clearError();
    setLocalError(null);
    
    // Redirect if already logged in
    if (user) {
      if (user.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, router, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || "Failed to log in. Please check your credentials.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLocalError("Please enter your email address first.");
      return;
    }
    
    setLocalError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${API_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: "POST"
      });
      if (res.ok) {
        setResetSent(true);
        setTimeout(() => setResetSent(false), 5000);
      } else {
        const data = await res.json();
        setLocalError(data.detail || "Forgot password failed");
      }
    } catch (err: any) {
      setLocalError("Network error. Could not request password reset.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <Activity className="h-8 w-8 text-teal-400" />
          <span className="font-extrabold text-2xl tracking-tight text-white">CancerGuard <span className="text-teal-400">AI</span></span>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{" "}
          <Link href="/register" className="font-semibold text-teal-400 hover:text-teal-300 transition">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-950/70 border border-slate-800 backdrop-blur-md py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          
          {(localError || error) && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl text-sm flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-4 bg-teal-500/10 border border-teal-500/20 text-teal-300 p-3.5 rounded-xl text-sm">
              If this email is registered, you will receive a reset link shortly.
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
