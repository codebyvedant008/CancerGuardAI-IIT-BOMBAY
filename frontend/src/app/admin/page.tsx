"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  api, 
  AdminAnalytics, 
  AdminUserListItem, 
  AdminPredictionListItem, 
  AdminReportListItem,
  API_URL
} from "@/services/api";
import { 
  Users as UsersIcon, 
  Activity, 
  FileText, 
  TrendingUp, 
  ShieldCheck,
  Brain,
  Fingerprint,
  Wind,
  Heart,
  Calendar,
  Download,
  Database
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "predictions" | "reports">("overview");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [userList, setUserList] = useState<AdminUserListItem[]>([]);
  const [predList, setPredList] = useState<AdminPredictionListItem[]>([]);
  const [reportList, setReportList] = useState<AdminReportListItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      setError(null);
      try {
        const [analData, usersData, predsData, repsData] = await Promise.all([
          api.get<AdminAnalytics>("/admin/analytics"),
          api.get<AdminUserListItem[]>("/admin/users"),
          api.get<AdminPredictionListItem[]>("/admin/predictions"),
          api.get<AdminReportListItem[]>("/admin/reports")
        ]);
        
        setAnalytics(analData);
        setUserList(usersData);
        setPredList(predsData);
        setReportList(repsData);
      } catch (err: any) {
        setError(err.message || "Failed to load administration records.");
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleDownloadPDF = async (predictionId: string, cancerType: string, riskLabel: string) => {
    setDownloadingId(predictionId);
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/reports/download/${predictionId}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `CancerGuard_Report_${cancerType}_${riskLabel.replace(" ", "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to download report PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getCancerIcon = (type: string) => {
    switch (type) {
      case "skin_cancer": return Fingerprint;
      case "brain_tumor": return Brain;
      case "lung_cancer": return Wind;
      case "breast_cancer": return Heart;
      default: return Activity;
    }
  };

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case "Low Risk": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium Risk": return "bg-amber-50 text-amber-700 border-amber-200";
      case "High Risk": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <DashboardLayout requireAdmin={true}>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Retrieving administration console...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requireAdmin={true}>
        <div className="max-w-xl mx-auto p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 text-sm space-y-4 text-center">
          <Activity className="h-10 w-10 mx-auto text-rose-500" />
          <h2 className="text-lg font-bold">Access Unauthorized</h2>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = analytics?.stats || { total_users: 0, total_scans: 0, total_predictions: 0, total_reports: 0 };
  const cancerDist = analytics?.cancer_distribution || {};
  const riskDist = analytics?.risk_distribution || {};
  const recentSignups = analytics?.recent_signups || [];

  return (
    <DashboardLayout requireAdmin={true}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
            <p className="text-slate-500 mt-1">Review system diagnostics, patient databases, audit trails, and platform-wide screening statistics.</p>
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-teal-50 border border-teal-200 text-teal-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Clearance Confirmed</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 -mb-px">
            {[
              { id: "overview", label: "Overview" },
              { id: "users", label: "Patients" },
              { id: "predictions", label: "Assessments" },
              { id: "reports", label: "Reports Log" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  pb-4 text-sm font-semibold transition border-b-2 focus:outline-none
                  ${activeTab === tab.id 
                    ? "border-teal-500 text-teal-600 font-bold" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Total Patients</span>
                  <span className="block text-2xl font-black text-slate-800">{stats.total_users}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Total Scans Run</span>
                  <span className="block text-2xl font-black text-slate-800">{stats.total_scans}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Predictions Made</span>
                  <span className="block text-2xl font-black text-slate-800">{stats.total_predictions}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">PDFs Downloaded</span>
                  <span className="block text-2xl font-black text-slate-800">{stats.total_reports}</span>
                </div>
              </div>
            </div>

            {/* Graphs and signups */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Cancer Breakdown Graph */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900 text-lg">Category Distribution</h3>
                {stats.total_scans === 0 ? (
                  <p className="text-xs text-slate-400">No database activity logs.</p>
                ) : (
                  <div className="space-y-4">
                    {["skin_cancer", "brain_tumor", "lung_cancer", "breast_cancer"].map((type) => {
                      const count = cancerDist[type] || 0;
                      const percentage = stats.total_scans ? (count / stats.total_scans) * 100 : 0;
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 capitalize">{type.replace("_", " ")}</span>
                            <span className="text-slate-500">{count} scans ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${percentage}%` }}
                              className="bg-teal-500 h-full rounded-full" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Risk Distribution Summary */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900 text-lg">Risk Distribution</h3>
                {stats.total_predictions === 0 ? (
                  <p className="text-xs text-slate-400">No assessment logs.</p>
                ) : (
                  <div className="space-y-4">
                    {[
                      { key: "Low Risk", color: "bg-emerald-500" },
                      { key: "Medium Risk", color: "bg-amber-500" },
                      { key: "High Risk", color: "bg-rose-500" }
                    ].map((risk) => {
                      const count = riskDist[risk.key] || 0;
                      const percentage = stats.total_predictions ? (count / stats.total_predictions) * 100 : 0;
                      return (
                        <div key={risk.key} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">{risk.key}</span>
                            <span className="text-slate-500">{count} instances ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${percentage}%` }}
                              className={`${risk.color} h-full rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Signups */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900 text-lg">Recent Signups</h3>
                {recentSignups.length === 0 ? (
                  <p className="text-xs text-slate-400">No registered patients in database.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentSignups.map((su) => (
                      <div key={su.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <span className="block font-bold text-slate-800">{su.full_name}</span>
                          <span className="block text-slate-400">{su.email}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {new Date(su.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Demographics</th>
                    <th className="px-6 py-4">Total Scans</th>
                    <th className="px-6 py-4">Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{u.full_name}</td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {u.age ?? "N/A"} yrs / {u.gender ? u.gender.toUpperCase() : "N/A"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{u.scans_count} scans</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${u.is_admin ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                          {u.is_admin ? "Admin" : "Patient"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "predictions" && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Patient Details</th>
                    <th className="px-6 py-4">Cancer Module</th>
                    <th className="px-6 py-4">AI Prediction</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Scan Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {predList.map((p) => {
                    const Icon = getCancerIcon(p.cancer_type);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="block font-bold text-slate-800">{p.patient_name}</span>
                          <span className="block text-xs text-slate-400">{p.patient_email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold capitalize flex items-center space-x-2 mt-2">
                          <Icon className="h-4.5 w-4.5 text-teal-600" />
                          <span>{p.cancer_type.replace("_", " ")}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${getRiskBadgeClass(p.prediction)}`}>
                            {p.prediction}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-600">{p.confidence}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Cancer Module</th>
                    <th className="px-6 py-4">Risk Rating</th>
                    <th className="px-6 py-4">Date Generated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {reportList.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{r.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold capitalize">{r.cancer_type.replace("_", " ")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${getRiskBadgeClass(r.prediction)}`}>
                          {r.prediction}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDownloadPDF(r.prediction_id, r.cancer_type, r.prediction)}
                          disabled={downloadingId === r.prediction_id}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition disabled:opacity-50"
                        >
                          <Download className="h-4 w-4" />
                          <span>{downloadingId === r.prediction_id ? "..." : "Download"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
