"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Stethoscope, Activity, User, Briefcase, Building, ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/services/api";

export default function DoctorRegistration() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    specialty: "",
    license_number: "",
    hospital_affiliation: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Register as doctor
      const res = await fetch(`${API_URL}/auth/register/doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          specialty: formData.specialty,
          license_number: formData.license_number,
          hospital_affiliation: formData.hospital_affiliation || undefined
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Registration failed");
      }
      
      // 2. Login immediately
      await login(formData.email, formData.password);
      router.push("/doctor");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 mb-6 shadow-[0_0_40px_rgba(20,184,166,0.3)]">
            <Stethoscope className="w-8 h-8 text-slate-900" />
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Clinical Registration</h1>
          <p className="text-slate-400 mt-2">Join the CancerGuard AI network as a verified practitioner.</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required name="full_name" value={formData.full_name} onChange={handleChange} type="text" placeholder="Dr. John Doe" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Specialty</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select required name="specialty" value={formData.specialty} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                    <option value="" disabled>Select Specialty...</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="General Practice">General Practice</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Professional Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="doctor@hospital.com" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input required name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* License Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Medical License No.</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required name="license_number" value={formData.license_number} onChange={handleChange} type="text" placeholder="MD-123456" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>
              </div>

              {/* Hospital Affiliation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Hospital Affiliation</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name="hospital_affiliation" value={formData.hospital_affiliation} onChange={handleChange} type="text" placeholder="General Hospital" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Create Clinical Account <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>

        </div>
        
        <p className="text-center mt-6 text-sm text-slate-500">
          Already verified? <Link href="/login" className="text-teal-400 font-bold hover:underline">Sign In Here</Link>
        </p>

      </div>
    </div>
  );
}
