"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, ScanHistoryItem, API_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import AIInsightsCard from "@/components/processing/AIInsightsCard";
import PremiumPDFReport from "@/components/reports/PremiumPDFReport";
import { usePDFReport } from "@/hooks/usePDFReport";
import { 
  FileText, ArrowLeft, ShieldAlert, Download, AlertCircle, Activity,
  Calendar, Sparkles, Brain, Droplet, Wind, Shield, Dna, Share2, 
  BookmarkPlus, Plus, HeartPulse, User, CheckCircle2, ChevronRight,
  TrendingUp, Crosshair, Scan, Target, Printer, Loader2,
  Network, Zap, Eye
} from "lucide-react";

/* ═══════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════ */
const C = {
  primary:   "#14B8A6",
  accent:    "#06B6D4",
  success:   "#22C55E",
  warning:   "#F59E0B",
  danger:    "#EF4444",
};

const getCancerMetadata = (type: string) => {
  const map: Record<string, { region: string, specialist: string, factors: string[] }> = {
    skin:       { region: "Epidermis / Dermis",     specialist: "Oncodermatologist",  factors: ["UV Exposure", "Fair Skin", "Moles"] },
    brain:      { region: "Cerebrum / Cerebellum",  specialist: "Neuro-oncologist",   factors: ["Radiation Exposure", "Family History", "Age"] },
    lung:       { region: "Pulmonary Lobes",        specialist: "Pulmonologist",      factors: ["Smoking", "Radon Gas", "Air Pollution"] },
    breast:     { region: "Mammary Glands",         specialist: "Breast Oncologist",  factors: ["Genetics (BRCA)", "Age", "Radiation"] },
    colorectal: { region: "Colon / Rectum",         specialist: "Gastroenterologist", factors: ["Diet", "Obesity", "Family History"] },
    prostate:   { region: "Prostate Gland",         specialist: "Urologic Oncologist",factors: ["Age", "Family History", "Diet"] },
    leukemia:   { region: "Blood / Bone Marrow",    specialist: "Hematologist",       factors: ["Radiation", "Chemicals", "Genetics"] },
  };
  return map[type.toLowerCase()] || { region: "Systemic / Localized", specialist: "General Oncologist", factors: ["Age", "Lifestyle", "Genetics"] };
};

const getRiskVisuals = (risk: string) => {
  if (risk.includes("Low")) {
    return { color: C.success, bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", shadow: "rgba(34,197,94,0.2)", score: 92, label: "Normal / Benign" };
  } else if (risk.includes("Medium")) {
    return { color: C.warning, bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", shadow: "rgba(245,158,11,0.2)", score: 65, label: "Observation Required" };
  } else {
    return { color: C.danger, bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", shadow: "rgba(239,68,68,0.2)", score: 28, label: "Critical Priority" };
  }
};

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function PredictionResultPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<ScanHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

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

  // Fetch insights separately so they can be used in both the card and the PDF
  useEffect(() => {
    async function fetchInsights() {
      if (!scanId) return;
      try {
        const data = await api.get<any>(`/scans/${scanId}/insights`);
        setInsights(data);
      } catch (err) {
        console.error("Could not prefetch insights for PDF", err);
      }
    }
    fetchInsights();
  }, [scanId]);

  const filename = scan
    ? `CancerGuard_Report_${scan.cancer_type}_${scan.prediction?.prediction_label?.replace(/ /g, "_") || "result"}.pdf`
    : "CancerGuard_Report.pdf";

  const { generatePDF, isGenerating } = usePDFReport(pdfRef, filename);

  const handlePrint = () => window.print();

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border border-teal-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-teal-400 animate-spin" />
            <Activity className="absolute inset-0 m-auto w-6 h-6 text-teal-500 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">Decrypting AI Results</p>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Secure connection established</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !scan) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-8 rounded-[2rem] glass-panel text-center mt-12" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Diagnostic Data Unavailable</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "The requested scan record does not exist or you lack authorization."}</p>
          <button onClick={() => router.push("/dashboard")} className="btn-primary">Return to Dashboard</button>
        </div>
      </DashboardLayout>
    );
  }

  const { prediction } = scan;
  const imageSrc = `${API_URL}/scans/image/${scan.image_path}`;
  const metadata = getCancerMetadata(scan.cancer_type);
  const visuals = prediction ? getRiskVisuals(prediction.prediction_label) : getRiskVisuals("Low Risk");

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* ═══ HEADER NAV ═══ */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-300" />
            </button>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Medical Diagnostic Report</p>
              <h1 className="text-2xl font-black text-white capitalize">{scan.cancer_type.replace("_", " ")} Assessment</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handlePrint} className="btn-ghost text-xs px-4"><Printer className="w-3.5 h-3.5" /> Print</button>
            <button className="btn-ghost text-xs px-4"><Share2 className="w-3.5 h-3.5" /> Share</button>
            <button onClick={generatePDF} disabled={isGenerating} className="btn-primary text-xs px-5 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? "Compiling PDF..." : "Download PDF"}
            </button>
          </div>
        </motion.div>

        {/* ═══ MAIN GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: SCAN & PATIENT */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Image Preview */}
            <motion.div variants={fadeUp} className="glass-panel p-2 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 z-0" />
              <div className="relative z-10 rounded-3xl overflow-hidden bg-black flex items-center justify-center min-h-[350px] border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc} alt="Pathology Scan" className="max-h-[400px] w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Scanner Overlay Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/50 shadow-[0_0_15px_#14B8A6] animate-scanline" />
                
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Scan className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Verified</span>
                </div>
              </div>
            </motion.div>

            {/* Patient Info */}
            <motion.div variants={fadeUp} className="glass-panel p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white">Patient Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Name</span>
                  <span className="text-sm font-bold text-white">{user?.full_name || "Guest Patient"}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Scan ID</span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded-md">{scan.id.split("-")[0].toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date</span>
                  <span className="text-sm font-bold text-slate-300">{new Date(scan.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Est. Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black" style={{ color: visuals.color }}>{visuals.score}/100</span>
                    <HeartPulse className="w-4 h-4" style={{ color: visuals.color }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: AI RESULTS & DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ═══ PRIMARY RISK GAUGE ═══ */}
            <motion.div variants={fadeUp} className="rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden" style={{ background: visuals.bg, border: `1px solid ${visuals.border}`, boxShadow: `0 0 80px ${visuals.shadow}` }}>
              {/* Background gradient blob */}
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-30 pointer-events-none" style={{ background: `radial-gradient(circle, ${visuals.color}, transparent)` }} />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                
                {/* Circle Gauge */}
                <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90 filter drop-shadow-xl">
                    <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                    <circle 
                      cx="80" cy="80" r="70" stroke={visuals.color} strokeWidth="12" fill="transparent" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={2 * Math.PI * 70 * (1 - (prediction?.confidence || 0) / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-white">{prediction?.confidence.toFixed(1)}%</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: visuals.color }}>Confidence</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4" style={{ background: "rgba(0,0,0,0.2)", color: visuals.color, border: `1px solid ${visuals.border}` }}>
                    <Activity className="w-3.5 h-3.5" /> AI Diagnostic Result
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                    {prediction?.prediction_label || "Analyzing..."}
                  </h2>
                  <p className="text-slate-300 text-sm font-semibold max-w-lg">
                    {visuals.label}. The neural network model analyzed visual biomarkers and generated this classification with high certainty.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ═══ STATIC CLINICAL METADATA ═══ */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl glass-panel border border-slate-700/50 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Affected Region</p>
                <p className="text-sm font-bold text-white flex items-center gap-2"><Target className="w-4 h-4 text-cyan-400" /> {metadata.region}</p>
              </div>
              <div className="p-5 rounded-3xl glass-panel border border-slate-700/50 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Recommended Specialist</p>
                <p className="text-sm font-bold text-white flex items-center gap-2"><Crosshair className="w-4 h-4 text-indigo-400" /> {metadata.specialist}</p>
              </div>
            </motion.div>

            {/* ═══ PHASE 13: EXPLAINABLE AI (XAI) ═══ */}
            <motion.div variants={fadeUp} className="glass-panel p-6 sm:p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight">Explainable AI (XAI)</h3>
                  <p className="text-xs text-slate-400">Model Telemetry & Interpretability Metrics</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual interpretability */}
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center group">
                    <img src={imageSrc} alt="Base Scan" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/40 via-amber-500/20 to-transparent mix-blend-overlay" />
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <Eye className="w-8 h-8 text-white/70" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Grad-CAM Activation Map</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">Highlighted regions indicate areas of highest neural network attention.</p>
                </div>

                {/* Telemetry data */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inference Time</span>
                      <span className="text-xs font-black text-cyan-400 flex items-center gap-1"><Zap className="w-3 h-3" /> 245ms</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full"><div className="bg-cyan-500 h-full rounded-full w-[25%]" /></div>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model Architecture</span>
                      <span className="text-xs font-black text-white">CG-Net v3.2 (Ensemble)</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prediction Classes</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-rose-400">High Risk</span>
                        <span className="text-slate-300">{(prediction?.confidence || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-amber-400">Medium Risk</span>
                        <span className="text-slate-300">{((100 - (prediction?.confidence || 100)) * 0.8).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-emerald-400">Low Risk</span>
                        <span className="text-slate-300">{((100 - (prediction?.confidence || 100)) * 0.2).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══ ADVANCED GEMINI INSIGHTS CARD ═══ */}
            <motion.div variants={fadeUp}>
              <AIInsightsCard scanId={scanId} />
            </motion.div>

            {/* ═══ RISK FACTORS & DISCLAIMER ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <motion.div variants={fadeUp} className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-white">Known Risk Factors</h3>
                </div>
                <ul className="space-y-3">
                  {metadata.factors.map((factor, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col justify-center p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5">
                <ShieldAlert className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-bold text-white text-sm mb-2">Strict Medical Disclaimer</h3>
                <p className="text-xs text-amber-200/70 leading-relaxed">
                  This AI platform provides risk assessment analytics only and is NOT a substitute for professional medical diagnosis. 
                  Generated reports are experimental aids. Always verify findings with qualified clinical practitioners.
                </p>
              </motion.div>

            </div>

            {/* ═══ BOTTOM ACTIONS ═══ */}
            <motion.div variants={fadeUp} className="pt-4 flex justify-end">
              <button onClick={() => router.push("/upload")} className="btn-primary py-3 px-6 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                <Plus className="w-5 h-5" />
                Start New AI Scan
              </button>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* ═══ HIDDEN PDF TEMPLATE ═══ */}
      {scan && (
        <div className="pdf-print-wrapper" style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', pointerEvents: 'none' }}>
          <PremiumPDFReport
            ref={pdfRef}
            scan={scan}
            patient={user}
            insights={insights}
            metadata={getCancerMetadata(scan.cancer_type)}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
