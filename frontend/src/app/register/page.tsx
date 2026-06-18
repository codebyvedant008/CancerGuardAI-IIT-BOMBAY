"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, Mail, Lock, User, Calendar, Users, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { user, register, error, clearError, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    clearError();
    setLocalError(null);
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

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await register(
        email,
        password,
        fullName,
        age === "" ? null : Number(age),
        gender || null
      );
    } catch (err: any) {
      setLocalError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-4">
          <Activity className="h-8 w-8 text-teal-400" />
          <span className="font-extrabold text-2xl tracking-tight text-white">CancerGuard <span className="text-teal-400">AI</span></span>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-400 hover:text-teal-300 transition">
            Sign in
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Age
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="30"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gender
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-500" />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white transition appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Select...</option>
                    <option value="male" className="bg-slate-900 text-white">Male</option>
                    <option value="female" className="bg-slate-900 text-white">Female</option>
                    <option value="other" className="bg-slate-900 text-white">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 bg-slate-900/60 rounded-xl text-sm focus:outline-none focus:border-teal-400 text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    <span>Register</span>
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
