"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Sliders, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [success, setSuccess] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoReport, setAutoReport] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-1">Configure your personal scanning preferences, safety controls, and account alerts.</p>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Notifications */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Bell className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-800">Notifications & Alerts</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block font-bold text-slate-800 text-sm">Email Reports</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Receive a PDF report copy in your email inbox automatically on scan completion.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block font-bold text-slate-800 text-sm">AI Screening Logs</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Receive notifications when new assessment models are loaded into the platform.</span>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={false}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Scanning Preferences */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sliders className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-800">Diagnostic Preferences</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block font-bold text-slate-800 text-sm">Auto-Generate Reports</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Generate downloadable reports immediately after neural networks finish processing.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoReport}
                  onChange={(e) => setAutoReport(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                />
              </label>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-800 text-sm">Language Interface</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Select your primary localization dialect. (Telemedicine readiness)</span>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none focus:border-teal-500 text-slate-700"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Security */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-800">Data Security & Encryption</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block font-bold text-slate-800 text-sm">Two-Factor Authentication (2FA)</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Add an extra layer of security by requiring a code from your mobile device to log in.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                />
              </label>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="block font-bold text-slate-800 text-sm">Clinical Credentials</span>
                  <Link href="/profile" className="text-teal-600 font-semibold hover:underline mt-0.5 block">Update your clinical account details or password</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition"
            >
              Save Configuration Settings
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
