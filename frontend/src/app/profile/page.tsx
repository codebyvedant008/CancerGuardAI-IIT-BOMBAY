"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Lock, Calendar, Users, Activity, Heart, ShieldAlert,
  Droplet, Wind, Coffee, Moon, Scale, Target, Save, CheckCircle,
  AlertCircle, ChevronRight, Dna, Upload
} from "lucide-react";
import { api } from "@/services/api";

type TabType = "personal" | "medical" | "lifestyle" | "preventive";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    age: user?.age?.toString() || "",
    gender: user?.gender || "",
    bloodGroup: "",
    weight: "",
    height: "",
    
    familyHistory: false,
    smoking: false,
    alcohol: false,
    diabetes: false,
    bloodPressure: false,
    previousCancer: false,
    allergies: "",
    medication: "",

    exercise: "3",
    diet: "Balanced",
    sleep: "7",
    water: "8",
    stress: "5",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real app, we'd send all data to the backend. 
      // For now, we use the existing updateProfile which accepts fullName, age, gender.
      await updateProfile({
        fullName: formData.fullName,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
      });
      
      // Simulate saving extended profile data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100; // cm to m
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return "0.0";
  };

  const bmi = calculateBMI();

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "medical", label: "Medical History", icon: Activity },
    { id: "lifestyle", label: "Lifestyle", icon: Heart },
    { id: "preventive", label: "Preventive Care", icon: ShieldAlert },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Patient Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your health data, clinical history, and preventive care settings.</p>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
              className="bg-teal-500/10 border border-teal-500/30 text-teal-400 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">Profile updated successfully. Data synchronized securely.</span>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
              className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-panel p-5 rounded-3xl flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 p-0.5">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    <User className="w-10 h-10 text-teal-500" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-5 h-5 text-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-black text-white">{formData.fullName || "Update Name"}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-widest">{user?.email}</p>
              
              <div className="w-full h-px bg-white/5 my-4" />
              
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="bg-slate-800/50 p-2 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">BMI</p>
                  <p className="text-sm font-black text-teal-400">{bmi}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Risk Score</p>
                  <p className="text-sm font-black text-rose-400">Low</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-bold w-full text-left
                    ${activeTab === tab.id ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl relative overflow-hidden min-h-[500px]">
              
              {/* Background gradient hint based on active tab */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none transition-opacity" />

              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-xl font-black text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
                  <p className="text-xs text-slate-500 mt-1">Keep this information up to date for accurate AI predictions.</p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary py-2 px-5 text-sm gap-2">
                  {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <Save className="w-4 h-4"/>}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  
                  {activeTab === "personal" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" max="120"
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition appearance-none cursor-pointer">
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 md:col-span-2 mt-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition cursor-pointer">
                            <option value="">Select...</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                          <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 70"
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Height (cm)</label>
                          <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 175"
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "medical" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { name: "familyHistory", label: "Family History of Cancer" },
                          { name: "smoking", label: "Current/Past Smoker" },
                          { name: "alcohol", label: "Regular Alcohol Consumption" },
                          { name: "diabetes", label: "Diabetes" },
                          { name: "bloodPressure", label: "High Blood Pressure" },
                          { name: "previousCancer", label: "Previous Cancer Diagnosis" },
                        ].map(item => (
                          <label key={item.name} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-xl cursor-pointer hover:border-slate-500 transition">
                            <input type="checkbox" name={item.name} checked={(formData as any)[item.name]} onChange={handleChange}
                              className="w-4 h-4 rounded text-teal-500 bg-slate-800 border-slate-600 focus:ring-teal-500 focus:ring-offset-slate-900" />
                            <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                          </label>
                        ))}
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Known Allergies</label>
                          <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} placeholder="List any known allergies..."
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition resize-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Medication</label>
                          <textarea name="medication" value={formData.medication} onChange={handleChange} rows={2} placeholder="List current medications..."
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition resize-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "lifestyle" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Exercise (days/week)</label>
                        <input type="range" name="exercise" min="0" max="7" value={formData.exercise} onChange={handleChange}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                        <div className="text-right text-xs font-bold text-teal-400">{formData.exercise} days</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Droplet className="w-3.5 h-3.5"/> Water Intake (glasses/day)</label>
                        <input type="range" name="water" min="0" max="15" value={formData.water} onChange={handleChange}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        <div className="text-right text-xs font-bold text-cyan-400">{formData.water} glasses</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Moon className="w-3.5 h-3.5"/> Sleep (hours/night)</label>
                        <input type="range" name="sleep" min="0" max="12" value={formData.sleep} onChange={handleChange}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400" />
                        <div className="text-right text-xs font-bold text-indigo-400">{formData.sleep} hours</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Wind className="w-3.5 h-3.5"/> Stress Level (1-10)</label>
                        <input type="range" name="stress" min="1" max="10" value={formData.stress} onChange={handleChange}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                        <div className="text-right text-xs font-bold text-rose-400">Level {formData.stress}</div>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dietary Preference</label>
                        <select name="diet" value={formData.diet} onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:border-teal-500 transition cursor-pointer">
                          <option value="Balanced">Balanced / Omnivore</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Vegan">Vegan</option>
                          <option value="Keto">Keto / Low Carb</option>
                          <option value="Mediterranean">Mediterranean</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === "preventive" && (
                    <div className="space-y-6">
                      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><ShieldAlert className="w-4 h-4 text-teal-400"/> AI Health Insights</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-teal-400"/></div>
                            <div>
                              <p className="text-sm font-semibold text-slate-200">Schedule Annual Skin Screening</p>
                              <p className="text-xs text-slate-400 mt-1">Based on your age and recent activity, a routine dermatological check is recommended within 3 months.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><AlertCircle className="w-3.5 h-3.5 text-amber-400"/></div>
                            <div>
                              <p className="text-sm font-semibold text-slate-200">Increase Hydration</p>
                              <p className="text-xs text-slate-400 mt-1">Your logged water intake is slightly below optimal levels. Aim for 8+ glasses daily.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white mb-4">Upcoming Screenings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Skin Health</p>
                            <p className="text-sm font-bold text-white">Full Body Mole Check</p>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Oct 15, 2026</p>
                          </div>
                          <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl opacity-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">General</p>
                            <p className="text-sm font-bold text-slate-300">Annual Blood Work</p>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Unscheduled</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
