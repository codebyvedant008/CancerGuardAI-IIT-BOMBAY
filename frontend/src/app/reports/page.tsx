"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, ScanHistoryItem, API_URL } from "@/services/api";
import { 
  FileText, 
  Download, 
  Eye, 
  Brain, 
  Fingerprint, 
  Wind, 
  Heart,
  Activity,
  ArrowRight
} from "lucide-react";

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await api.get<ScanHistoryItem[]>("/scans/history");
        // Only keep scans that have predictions (and therefore reports)
        setScans(data.filter(s => s.prediction));
      } catch (err: any) {
        setError(err.message || "Failed to load clinical reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
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
        throw new Error("Failed to download PDF");
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Reports</h1>
          <p className="text-slate-500 mt-1">Access and download formal clinical PDF summaries for all completed AI assessments.</p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
            {error}
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl text-slate-400 space-y-3 shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-slate-300 animate-pulse" />
            <p className="font-semibold text-slate-700">No clinical reports available yet.</p>
            <p className="text-xs max-w-sm mx-auto">Reports are generated automatically once a scan assessment is successfully run.</p>
            <Link 
              href="/upload" 
              className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:underline"
            >
              <span>Assess first scan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scans.map((scan) => {
              if (!scan.prediction) return null;
              const Icon = getCancerIcon(scan.cancer_type);
              return (
                <div 
                  key={scan.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center space-x-1.5 font-bold text-slate-800 capitalize text-sm">
                        <Icon className="h-4.5 w-4.5 text-teal-600" />
                        <span>{scan.cancer_type.replace("_", " ")} Report</span>
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md uppercase ${getRiskBadgeClass(scan.prediction.prediction_label)}`}>
                        {scan.prediction.prediction_label}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Scan Date: {new Date(scan.created_at).toLocaleDateString()} at {new Date(scan.created_at).toLocaleTimeString()}</p>
                      <p>Model Confidence: {scan.prediction.confidence}%</p>
                      <p className="text-slate-500 italic mt-2 line-clamp-2">&quot;{scan.prediction.recommendation}&quot;</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-2">
                    <Link
                      href={`/result/${scan.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Details</span>
                    </Link>
                    <button
                      onClick={() => handleDownloadPDF(scan.prediction!.id, scan.cancer_type, scan.prediction!.prediction_label)}
                      disabled={downloadingId === scan.prediction.id}
                      className="inline-flex items-center space-x-1 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>{downloadingId === scan.prediction.id ? "Downloading..." : "Download PDF"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
