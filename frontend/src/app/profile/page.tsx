"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [age, setAge] = useState<number | "">(user?.age ?? "");
  const [gender, setGender] = useState(user?.gender || "");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError(null);
    setLoadingProfile(true);

    try {
      await updateProfile({
        fullName,
        age: age === "" ? null : Number(age),
        gender: gender || null,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile details.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setLoadingPassword(true);

    try {
      await updateProfile({
        password,
      });
      setPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your public credentials, clinical profile details, and system security password.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Profile Details Form */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Clinical Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">These demographic details are printed on clinical screening report PDFs.</p>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm opacity-60">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <span className="block text-[10px] text-slate-400 mt-1">To change your primary email, please contact platform administrators.</span>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-800 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="age"
                      type="number"
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gender" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-800 transition appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loadingProfile ? "Saving Details..." : "Update Clinical Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Update Password</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ensure your account uses a secure passkey to encrypt medical records access.</p>
            </div>

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-800 placeholder-slate-300 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 text-slate-800 placeholder-slate-300 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loadingPassword ? "Changing..." : "Change Account Password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
