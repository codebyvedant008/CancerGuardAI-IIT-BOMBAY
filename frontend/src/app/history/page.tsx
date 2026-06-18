"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, ScanHistoryItem, API_URL } from "@/services/api";
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Eye, 
  Brain, 
  Fingerprint, 
  Wind, 
  Heart,
  Activity,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export default function PredictionHistoryPage() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.get<ScanHistoryItem[]>("/scans/history");
        setScans(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch scan history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
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
      alert("Failed to download report PDF. Please try again.");
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

  // Filter logic
  const filteredScans = scans.filter((scan) => {
    const matchesSearch = 
      scan.cancer_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (scan.prediction?.prediction_label || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = selectedType === "" || scan.cancer_type === selectedType;
    const matchesRisk = selectedRisk === "" || scan.prediction?.prediction_label === selectedRisk;
    
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessment History</h1>
          <p className="text-slate-500 mt-1">Browse, search, and filter your previous scan assessments and clinical reports.</p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <Filter className="h-5 w-5 text-teal-600" />
            <span className="font-bold text-sm">Search Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Text Search */}
            <div className="md:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans or classification..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* Select Type */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition appearance-none cursor-pointer"
              >
                <option value="">All Cancer Modules</option>
                <option value="skin_cancer">Skin Cancer</option>
                <option value="brain_tumor">Brain Tumor</option>
                <option value="lung_cancer">Lung Cancer</option>
                <option value="breast_cancer">Breast Cancer</option>
              </select>
            </div>

            {/* Select Risk */}
            <div className="md:col-span-3">
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition appearance-none cursor-pointer"
              >
                <option value="">All Risk Levels</option>
                <option value="Low Risk">Low Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>

          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
            {error}
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl text-slate-400 space-y-3 shadow-sm">
            <Activity className="h-12 w-12 mx-auto text-slate-300 animate-pulse" />
            <p className="font-semibold text-slate-700">No matching scan records found.</p>
            <p className="text-xs max-w-sm mx-auto">Try adjusting your filters or search keywords, or run a new scan evaluation.</p>
            <Link 
              href="/upload" 
              className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:underline"
            >
              <span>Upload new scan</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Scan Date</th>
                    <th className="px-6 py-4">Cancer Module</th>
                    <th className="px-6 py-4">AI Risk Classification</th>
                    <th className="px-6 py-4">Model Confidence</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredScans.map((scan) => {
                    const Icon = getCancerIcon(scan.cancer_type);
                    return (
                      <tr key={scan.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center space-x-2 text-slate-500">
                            <Calendar className="h-4.5 w-4.5 text-slate-400" />
                            <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center space-x-2 font-bold text-slate-800 capitalize">
                            <Icon className="h-4 w-4 text-teal-600" />
                            <span>{scan.cancer_type.replace("_", " ")}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {scan.prediction ? (
                            <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${getRiskBadgeClass(scan.prediction.prediction_label)}`}>
                              {scan.prediction.prediction_label}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-600">
                          {scan.prediction ? `${scan.prediction.confidence}%` : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Link 
                            href={`/result/${scan.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </Link>
                          {scan.prediction && (
                            <button
                              onClick={() => handleDownloadPDF(scan.prediction!.id, scan.cancer_type, scan.prediction!.prediction_label)}
                              disabled={downloadingId === scan.prediction.id}
                              className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>{downloadingId === scan.prediction.id ? "..." : "Report"}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredScans.map((scan) => {
                const Icon = getCancerIcon(scan.cancer_type);
                return (
                  <div key={scan.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-1.5 font-bold text-slate-800 capitalize text-sm">
                        <Icon className="h-4.5 w-4.5 text-teal-600" />
                        <span>{scan.cancer_type.replace("_", " ")}</span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        {scan.prediction ? (
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-0.5 font-semibold border rounded-full ${getRiskBadgeClass(scan.prediction.prediction_label)}`}>
                              {scan.prediction.prediction_label}
                            </span>
                            <span className="font-semibold text-slate-500">({scan.prediction.confidence}%)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Processing</span>
                        )}
                      </div>
                      
                      <div className="space-x-1.5">
                        <Link 
                          href={`/result/${scan.id}`}
                          className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                        {scan.prediction && (
                          <button
                            onClick={() => handleDownloadPDF(scan.prediction!.id, scan.cancer_type, scan.prediction!.prediction_label)}
                            disabled={downloadingId === scan.prediction.id}
                            className="inline-flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{downloadingId === scan.prediction.id ? "Loading" : "PDF"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
