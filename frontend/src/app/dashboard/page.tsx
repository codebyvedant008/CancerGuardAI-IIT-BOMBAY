"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api, ScanHistoryItem } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Activity, 
  Upload, 
  FileText, 
  Clock, 
  ArrowRight, 
  ShieldAlert,
  Brain,
  Fingerprint,
  Wind,
  Heart
} from "lucide-react";

export default function UserDashboard() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const data = await api.get<ScanHistoryItem[]>("/scans/history");
        setScans(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const totalScans = scans.length;
  const recentScans = scans.slice(0, 3);
  
  // Count reports (any scan with a completed prediction has an on-demand report)
  const reportsGenerated = scans.filter(s => s.prediction).length;
  
  // Risk Counts
  const riskCounts = scans.reduce(
    (acc, item) => {
      if (item.prediction) {
        const label = item.prediction.prediction_label;
        if (label === "Low Risk") acc.low += 1;
        else if (label === "Medium Risk") acc.medium += 1;
        else if (label === "High Risk") acc.high += 1;
      }
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Dashboard</h1>
            <p className="text-slate-500 mt-1">Review your cancer screening stats, recent assessments, and generated clinical reports.</p>
          </div>
          
          <Link
            href="/upload"
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            <Upload className="h-5 w-5" />
            <span>Upload New Scan</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
            {error}
          </div>
        ) : (
          <>
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Total Scans */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Total Scans</span>
                  <span className="block text-2xl font-black text-slate-800">{totalScans}</span>
                </div>
              </div>

              {/* Card 2: Reports */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Reports Generated</span>
                  <span className="block text-2xl font-black text-slate-800">{reportsGenerated}</span>
                </div>
              </div>

              {/* Card 3: Active Modules */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Screening Modules</span>
                  <span className="block text-2xl font-black text-slate-800">4 Active</span>
                </div>
              </div>

              {/* Card 4: Last Activity */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm text-slate-500 font-medium">Last Scan Date</span>
                  <span className="block text-sm font-bold text-slate-800 truncate max-w-[150px]">
                    {scans.length > 0 
                      ? new Date(scans[0].created_at).toLocaleDateString()
                      : "No uploads yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Analytics & Recent Predictions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Recent Predictions */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Recent Predictions</h2>
                    {scans.length > 3 && (
                      <Link href="/history" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
                        <span>View History</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {recentScans.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-3">
                      <Upload className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="text-sm">You haven&apos;t uploaded any scan images yet.</p>
                      <Link href="/upload" className="text-xs font-bold text-teal-600 hover:underline">Upload First Scan</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentScans.map((scan) => {
                        const Icon = getCancerIcon(scan.cancer_type);
                        return (
                          <div 
                            key={scan.id}
                            className="p-4 border border-slate-100 rounded-2xl hover:border-teal-100 bg-slate-50/50 hover:bg-teal-50/10 transition flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center space-x-3 truncate">
                              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="truncate">
                                <span className="block font-bold text-slate-800 text-sm truncate capitalize">
                                  {scan.cancer_type.replace("_", " ")}
                                </span>
                                <span className="block text-xs text-slate-400">
                                  {new Date(scan.created_at).toLocaleDateString()} at {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {scan.prediction ? (
                                <>
                                  <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${getRiskBadgeClass(scan.prediction.prediction_label)}`}>
                                    {scan.prediction.prediction_label}
                                  </span>
                                  <Link 
                                    href={`/result/${scan.id}`}
                                    className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                                  >
                                    Details
                                  </Link>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-slate-400 animate-pulse">Processing...</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Risk Distribution Chart */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Risk History Summary</h2>
                  
                  {totalScans === 0 ? (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <p className="text-sm">No analysis history available.</p>
                      <p className="text-xs text-slate-300">Submit a medical scan image to view the risk distribution.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Custom SVG Bar Chart */}
                      <div className="h-44 w-full flex items-end justify-around pb-2 border-b border-slate-200">
                        {/* Low Risk Bar */}
                        <div className="flex flex-col items-center group w-16">
                          <span className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{riskCounts.low}</span>
                          <div 
                            style={{ height: `${totalScans ? (riskCounts.low / totalScans) * 120 : 0}px` }}
                            className="w-full bg-emerald-500 rounded-t-lg min-h-[4px] shadow-sm group-hover:bg-emerald-400 transition-all duration-500" 
                          />
                          <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 mt-2">Low Risk</span>
                        </div>

                        {/* Medium Risk Bar */}
                        <div className="flex flex-col items-center group w-16">
                          <span className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{riskCounts.medium}</span>
                          <div 
                            style={{ height: `${totalScans ? (riskCounts.medium / totalScans) * 120 : 0}px` }}
                            className="w-full bg-amber-500 rounded-t-lg min-h-[4px] shadow-sm group-hover:bg-amber-400 transition-all duration-500" 
                          />
                          <span className="text-[10px] sm:text-xs font-semibold text-amber-700 mt-2">Medium</span>
                        </div>

                        {/* High Risk Bar */}
                        <div className="flex flex-col items-center group w-16">
                          <span className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{riskCounts.high}</span>
                          <div 
                            style={{ height: `${totalScans ? (riskCounts.high / totalScans) * 120 : 0}px` }}
                            className="w-full bg-rose-500 rounded-t-lg min-h-[4px] shadow-sm group-hover:bg-rose-400 transition-all duration-500" 
                          />
                          <span className="text-[10px] sm:text-xs font-semibold text-rose-700 mt-2">High Risk</span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                          <span className="block font-black text-emerald-800">{riskCounts.low}</span>
                          <span className="text-emerald-600 font-medium">Safe</span>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-xl">
                          <span className="block font-black text-amber-800">{riskCounts.medium}</span>
                          <span className="text-amber-600 font-medium">Observe</span>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-xl">
                          <span className="block font-black text-rose-800">{riskCounts.high}</span>
                          <span className="text-rose-600 font-medium">Urgent</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
