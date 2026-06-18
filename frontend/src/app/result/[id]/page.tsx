"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, ScanHistoryItem, API_URL } from "@/services/api";
import { 
  FileText, 
  ArrowLeft, 
  ShieldAlert, 
  Download, 
  AlertCircle, 
  Activity,
  Calendar,
  Sparkles
} from "lucide-react";

export default function PredictionResultPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<ScanHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchScanDetails() {
      if (!scanId) return;
      try {
        const data = await api.get<ScanHistoryItem>(`/scans/${scanId}`);
        setScan(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch scan results.");
      } finally {
        setLoading(false);
      }
    }
    fetchScanDetails();
  }, [scanId]);

  const handleDownloadPDF = async () => {
    if (!scan?.prediction) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/reports/download/${scan.prediction.id}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF report");
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `CancerGuard_Report_${scan.cancer_type}_${scan.prediction.prediction_label.replace(" ", "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to download report PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low Risk":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          badge: "bg-emerald-500 text-white",
          text: "text-emerald-600",
          glow: "shadow-emerald-500/10",
        };
      case "Medium Risk":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          badge: "bg-amber-500 text-white",
          text: "text-amber-600",
          glow: "shadow-amber-500/10",
        };
      case "High Risk":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          badge: "bg-rose-500 text-white",
          text: "text-rose-600",
          glow: "shadow-rose-500/10",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-800 border-slate-200",
          badge: "bg-slate-500 text-white",
          text: "text-slate-600",
          glow: "shadow-slate-500/10",
        };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Retrieving scan predictions...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !scan) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 text-sm space-y-4 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-rose-500" />
          <h2 className="text-lg font-bold">Error Loading Results</h2>
          <p>{error || "The requested scan record does not exist or you do not have permission to view it."}</p>
          <Link href="/dashboard" className="inline-flex text-teal-600 font-bold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { prediction } = scan;
  const colors = prediction ? getRiskColor(prediction.prediction_label) : null;
  const imageSrc = `${API_URL}/scans/image/${scan.image_path}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center space-x-2">
          <Link 
            href="/dashboard" 
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Assessment Output</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {scan.cancer_type.replace("_", " ")} Assessment
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Analyzed on {new Date(scan.created_at).toLocaleString()}</span>
            </p>
          </div>

          {prediction && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>{downloading ? "Generating Report..." : "Download PDF Report"}</span>
            </button>
          )}
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Submitted Scan</h2>
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageSrc} 
                  alt="Scanned pathology" 
                  className="max-h-[400px] object-contain"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              Scan Record ID: <span className="font-mono">{scan.id}</span>
            </div>
          </div>

          {/* Right Column: Risk Output details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Risk Indicator Card */}
            {prediction ? (
              <>
                <div className={`border rounded-3xl p-6 shadow-sm ${colors?.bg} ${colors?.glow} space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Classification</span>
                      <span className="block text-3xl font-black mt-1">{prediction.prediction_label}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm ${colors?.badge}`}>
                      {prediction.prediction_label}
                    </span>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="pt-4 border-t border-slate-200/50 flex flex-col sm:flex-row items-center gap-6">
                    {/* Ring gauge */}
                    <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          stroke="rgba(0,0,0,0.05)" 
                          strokeWidth="6" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          fill="transparent" 
                          className={`${colors?.text}`}
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - prediction.confidence / 100)}
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-slate-800">{prediction.confidence}%</span>
                    </div>

                    <div className="text-center sm:text-left">
                      <span className="block font-bold text-slate-800 text-sm">Model Confidence Score</span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Representing statistical matching alignment against labeled reference patient databases. 
                        A higher confidence score suggests strong visual indicator matches.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-slate-800">Suggested Action Protocol</h2>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-slate-600 text-sm italic font-medium leading-relaxed">
                      &quot;{prediction.recommendation}&quot;
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 leading-normal space-y-1.5">
                    <span className="block font-bold text-slate-500">Suggested Steps:</span>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      <li>Download the PDF assessment report.</li>
                      <li>Schedule a clinical consultation with your primary physician or oncologist.</li>
                      <li>Provide the generated report directly to your healthcare provider to expedite screening pathways.</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center py-12 text-slate-500 animate-pulse">
                Evaluating model outputs...
              </div>
            )}

            {/* Strict Medical Disclaimer Card */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider text-[10px] text-rose-700 mb-1">Strict Medical Disclaimer</span>
                This AI system provides risk assessment only and is not a substitute for professional medical diagnosis. 
                Any predictions generated are experimental screening assistance guides. Always check findings with qualified clinical practitioners.
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
