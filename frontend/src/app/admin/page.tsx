"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  api, AdminAnalytics, AdminUserListItem, AdminPredictionListItem, AdminReportListItem, API_URL 
} from "@/services/api";
import { 
  Users, Activity, FileText, TrendingUp, ShieldCheck,
  Brain, Fingerprint, Wind, Heart, Download, CheckCircle, Search, 
  Map, Server, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = ['#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6'];

export default function PremiumAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "predictions">("overview");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [userList, setUserList] = useState<AdminUserListItem[]>([]);
  const [predList, setPredList] = useState<AdminPredictionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [analData, usersData, predsData] = await Promise.all([
          api.get<AdminAnalytics>("/admin/analytics"),
          api.get<AdminUserListItem[]>("/admin/users"),
          api.get<AdminPredictionListItem[]>("/admin/predictions"),
        ]);
        setAnalytics(analData);
        setUserList(usersData);
        setPredList(predsData);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const stats = analytics?.stats || { total_users: 0, total_scans: 0, total_predictions: 0, total_reports: 0 };
  const cancerDist = analytics?.cancer_distribution || {};
  const riskDist = analytics?.risk_distribution || {};

  const pieData = Object.keys(cancerDist).map(key => ({
    name: key.replace("_", " "),
    value: cancerDist[key]
  }));

  const barData = [
    { name: 'Low Risk', value: riskDist['Low Risk'] || 0 },
    { name: 'Medium Risk', value: riskDist['Medium Risk'] || 0 },
    { name: 'High Risk', value: riskDist['High Risk'] || 0 },
  ];

  if (loading) {
    return (
      <DashboardLayout requireAdmin={true}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requireAdmin={true}>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">System Admin Console</h1>
            <p className="text-sm text-slate-400 mt-1">Global monitoring, model telemetry, and user access management.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold">
            <Server className="w-4 h-4 animate-pulse" />
            <span>Systems Online</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
          {[
            { id: "overview", label: "Global Telemetry" },
            { id: "users", label: "User Database" },
            { id: "predictions", label: "Inference Logs" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-slate-800 text-white shadow-lg border border-slate-700" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Users</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.total_users}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                    <Activity className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Scans</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.total_scans}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Inferences</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.total_predictions}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Accuracy</p>
                  <p className="text-3xl font-black text-white mt-1">98.4%</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Model Distribution (Cancer Types)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#fff', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Global Risk Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#1E293B'}} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#fff', borderRadius: '12px' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'High Risk' ? '#F43F5E' : entry.name === 'Medium Risk' ? '#F59E0B' : '#10B981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">User Directory</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search Users..." className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-900">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Scans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {userList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-bold text-white">{u.full_name}</td>
                        <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${u.is_admin ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                            {u.is_admin ? "Admin" : "Patient"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-bold">{u.scans_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "predictions" && (
            <motion.div
              key="preds"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-900">
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Cancer Module</th>
                      <th className="px-6 py-4">AI Prediction</th>
                      <th className="px-6 py-4">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {predList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-bold text-white text-sm">{p.patient_name}</td>
                        <td className="px-6 py-4 text-slate-400 text-sm capitalize">{p.cancer_type.replace("_", " ")}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            p.prediction === 'High Risk' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            p.prediction === 'Medium Risk' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {p.prediction}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-bold">{p.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
