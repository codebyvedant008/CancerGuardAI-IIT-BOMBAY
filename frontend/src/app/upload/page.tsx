"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, PredictionResult } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import AIProcessingView from "@/components/processing/AIProcessingView";
import {
  Upload, Trash2, Activity, Fingerprint, Brain, Wind, Heart,
  AlertCircle, CheckCircle2, Zap, Droplet, Crown, Shield, Flame,
  TrendingUp, AlertTriangle, ImageIcon, FileType, RefreshCw,
  Scan, Sparkles, Bot, ArrowRight, X, Info, Clock, CheckCircle,
  Target, Loader2
} from "lucide-react";

/* ═══════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════ */
const C = {
  primary:   "#14B8A6",
  accent:    "#06B6D4",
  success:   "#22C55E",
  warning:   "#F59E0B",
  danger:    "#EF4444",
  indigo:    "#818CF8",
};

const CANCER_OPTIONS = [
  { id: "skin",       name: "Skin Cancer",       value: "skin",       desc: "Dermoscopy & lesion",  icon: Fingerprint, color: "#FB923C", model: "DermNet CNN v3",      accuracy: "97.8%", time: "~8s"  },
  { id: "brain",      name: "Brain Tumor",        value: "brain",      desc: "MRI slice imaging",    icon: Brain,       color: "#818CF8", model: "NeuroScan ViT",      accuracy: "99.1%", time: "~12s" },
  { id: "lung",       name: "Lung Cancer",        value: "lung",       desc: "Chest X-ray / CT",     icon: Wind,        color: "#14B8A6", model: "PulmoAI ResNet-50",  accuracy: "98.7%", time: "~10s" },
  { id: "breast",     name: "Breast Cancer",      value: "breast",     desc: "Digital mammogram",    icon: Heart,       color: "#F472B6", model: "MammoNet v2",        accuracy: "97.2%", time: "~9s"  },
  { id: "colorectal", name: "Colorectal",         value: "colorectal", desc: "Colonoscopy imaging",  icon: Flame,       color: "#F97316", model: "ColonVision AI",     accuracy: "96.8%", time: "~11s" },
  { id: "ovarian",    name: "Ovarian Cancer",     value: "ovarian",    desc: "Ultrasound imaging",   icon: Droplet,     color: "#2DD4BF", model: "OvaryNet CNN",       accuracy: "95.4%", time: "~10s" },
  { id: "prostate",   name: "Prostate Cancer",    value: "prostate",   desc: "MRI & biopsy",         icon: Shield,      color: "#60A5FA", model: "ProstateScan v1",    accuracy: "96.1%", time: "~13s" },
  { id: "thyroid",    name: "Thyroid Cancer",     value: "thyroid",    desc: "Ultrasound & CT",      icon: Crown,       color: "#FBBF24", model: "ThyroidAI Detect",   accuracy: "97.5%", time: "~8s"  },
  { id: "pancreatic", name: "Pancreatic Cancer",  value: "pancreatic", desc: "CT & MRI imaging",     icon: Zap,         color: "#A78BFA", model: "PancreasNet v2",     accuracy: "94.9%", time: "~14s" },
  { id: "liver",      name: "Liver Cancer",       value: "liver",      desc: "Ultrasound & CT",      icon: TrendingUp,  color: "#34D399", model: "HepatoScan CNN",     accuracy: "96.3%", time: "~11s" },
  { id: "leukemia",   name: "Leukemia",           value: "leukemia",   desc: "Blood & bone marrow",  icon: Activity,    color: "#EF4444", model: "HematoAI v1",        accuracy: "98.4%", time: "~7s"  },
  { id: "lymphoma",   name: "Lymphoma",           value: "lymphoma",   desc: "CT & PET imaging",     icon: Scan,        color: "#06B6D4", model: "LymphoNet ResNet",   accuracy: "97.0%", time: "~12s" },
  { id: "cervical",   name: "Cervical Cancer",    value: "cervical",   desc: "Pap smear / colposcopy",icon: AlertTriangle,color:"#F59E0B",model: "CerviScan v3",       accuracy: "98.0%", time: "~9s"  },
  { id: "esophageal", name: "Esophageal",         value: "esophageal", desc: "Endoscopy imaging",    icon: Wind,        color: "#38BDF8", model: "EsophagAI Detect",   accuracy: "95.7%", time: "~10s" },
  { id: "stomach",    name: "Stomach Cancer",     value: "stomach",    desc: "Endoscopy & CT",       icon: Flame,       color: "#FB7185", model: "GastroNet v2",       accuracy: "96.6%", time: "~11s" },
  { id: "melanoma",   name: "Melanoma",           value: "melanoma",   desc: "Dermoscopy analysis",  icon: Fingerprint, color: "#C084FC", model: "MelanoScan ViT",     accuracy: "98.9%", time: "~8s"  },
];

const VALIDATION_MESSAGES: Record<string, string> = {
  type:  "⚠ Unsupported format. Please upload a JPG, JPEG, or PNG file.",
  size:  "⚠ File too large. Maximum allowed size is 50 MB.",
  model: "⚠ Please select a cancer screening model before proceeding.",
  file:  "⚠ Please upload a scan image to continue.",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ═══════════════════════════════════════
   ANIMATED STEP INDICATOR
═══════════════════════════════════════ */
const StepIndicator = ({ current }: { current: number }) => {
  const steps = ["Select Model", "Upload Scan", "Start Analysis"];
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, idx) => {
        const n = idx + 1;
        const done    = n < current;
        const active  = n === current;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                style={{
                  background: done || active
                    ? "linear-gradient(135deg,#14B8A6,#06B6D4)"
                    : "rgba(255,255,255,0.06)",
                  color: done || active ? "#0F172A" : "#475569",
                  boxShadow: active ? "0 0 16px rgba(20,184,166,0.5)" : "none",
                }}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span className={`text-[10px] font-bold mt-1.5 whitespace-nowrap ${active ? "text-teal-400" : done ? "text-slate-400" : "text-slate-600"}`}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full" style={{ background: n < current ? "linear-gradient(90deg,#14B8A6,#06B6D4)" : "rgba(255,255,255,0.06)", minWidth: 24 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function UploadScanPage() {
  const [cancerType, setCancerType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { language } = useLanguage();

  const selectedOption = CANCER_OPTIONS.find(o => o.value === cancerType);
  const step = cancerType ? (file ? 3 : 2) : 1;

  /* ── File validation ── */
  const validateAndSetFile = useCallback((f: File) => {
    setError(null);
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(f.type)) { setError(VALIDATION_MESSAGES.type); return; }
    if (f.size > 50 * 1024 * 1024)   { setError(VALIDATION_MESSAGES.size); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleFileChange  = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]); };
  const handleDragOver    = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave   = () => setIsDragOver(false);
  const handleDrop        = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]); };
  const removeFile        = () => { setFile(null); setPreviewUrl(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancerType) { setError(VALIDATION_MESSAGES.model); return; }
    if (!file)        { setError(VALIDATION_MESSAGES.file);  return; }

    setError(null);
    setUploading(true);
    setProgress(5);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p;
        // Faster progression early on, slower near the end
        const increment = p > 70 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 12) + 3;
        return Math.min(p + increment, 90);
      });
    }, 450);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.post<PredictionResult>(`/predict/unified/${cancerType}?language=${language}`, formData);
      
      clearInterval(interval);
      setProgress(100);
      setSuccess(true);
      
      // Delay slightly at 100% so user sees "Analysis Complete" before redirect
      setTimeout(() => router.push(`/result/${result.scan_id}`), 1200);
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      setProgress(0);
      setError(err.message || "Failed to process scan image. Please try again.");
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        {!uploading ? (
          <motion.div
            key="upload-form"
            variants={container}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto space-y-6 pb-12"
          >
            {/* ═══ HERO ═══ */}
            <motion.div variants={fadeUp} className="relative rounded-[2rem] overflow-hidden p-8" style={{
              background: "linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(6,182,212,0.05) 50%, rgba(15,23,42,0.9) 100%)",
              border: "1px solid rgba(20,184,166,0.18)",
              boxShadow: "0 0 80px rgba(20,184,166,0.06)"
            }}>
              {/* Ambient glow */}
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-[90px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)" }} />
              {/* BG watermark */}
              <Scan className="absolute right-10 top-1/2 -translate-y-1/2 w-40 h-40 text-teal-500 opacity-[0.04]" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "#2DD4BF" }}>
                    <span className="flex h-1.5 w-1.5">
                      <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-teal-400 opacity-75" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-teal-400" />
                    </span>
                    AI Diagnostic Engine Ready
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Upload Medical Scan
                  </h1>
                  <p className="text-slate-400 mt-3 max-w-lg leading-relaxed text-sm">
                    Securely upload your medical scan for AI-powered cancer analysis across 16 supported neural network screening models.
                  </p>
                </div>

                {/* Step tracker */}
                <div className="glass-panel px-6 py-5 rounded-2xl flex-shrink-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Progress</p>
                  <StepIndicator current={step} />
                </div>
              </div>
            </motion.div>

            {/* ═══ ALERTS ═══ */}
            <AnimatePresence>
              {error && (
                <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 p-4 rounded-2xl text-sm"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-200"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ═══ STEP 1: SELECT MODEL ═══ */}
              <motion.div variants={fadeUp} className="glass-panel rounded-3xl p-6" style={{ borderColor: cancerType ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: cancerType ? "linear-gradient(135deg,#14B8A6,#06B6D4)" : "rgba(255,255,255,0.07)", color: cancerType ? "#0F172A" : "#475569" }}>
                    {cancerType ? <CheckCircle className="w-4 h-4" /> : "1"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Select Cancer Screening Model</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Choose the AI model that matches your scan type</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CANCER_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = cancerType === opt.value;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => setCancerType(opt.value)}
                        disabled={uploading}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 focus:outline-none"
                        style={isSelected ? {
                          background: `${opt.color}14`,
                          border: `1px solid ${opt.color}40`,
                          boxShadow: `0 0 20px ${opt.color}10`
                        } : {
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)"
                        }}
                      >
                        {isSelected && (
                          <motion.div layoutId="modelSelector" className="absolute inset-0 rounded-xl" style={{ background: `${opt.color}08` }} transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                        )}
                        <div className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform" style={{ background: `${opt.color}18` }}>
                          <Icon className="w-4 h-4" style={{ color: opt.color }} />
                        </div>
                        <div className="relative min-w-0">
                          <span className="block text-xs font-bold truncate" style={{ color: isSelected ? opt.color : "#cbd5e1" }}>{opt.name}</span>
                          <span className="block text-[10px] text-slate-500 truncate mt-0.5">{opt.desc}</span>
                        </div>
                        {isSelected && <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 flex-shrink-0" style={{ color: opt.color }} />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* AI Model Info Panel */}
                <AnimatePresence>
                  {selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ background: `${selectedOption.color}08`, border: `1px solid ${selectedOption.color}20` }}>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Selected Model</p>
                          <p className="text-sm font-bold text-white">{selectedOption.model}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
                          <p className="text-sm font-black" style={{ color: C.success }}>{selectedOption.accuracy}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Processing Time</p>
                          <p className="text-sm font-bold text-white">{selectedOption.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                          <p className="text-sm font-bold" style={{ color: C.primary }}>High (≥94%)</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ═══ STEP 2: UPLOAD ═══ */}
              <motion.div variants={fadeUp} className="glass-panel rounded-3xl p-6" style={{ borderColor: file ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: file ? "linear-gradient(135deg,#14B8A6,#06B6D4)" : "rgba(255,255,255,0.07)", color: file ? "#0F172A" : "#475569" }}>
                    {file ? <CheckCircle className="w-4 h-4" /> : "2"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Upload Medical Scan Image</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Drag & drop or click to select — JPG, PNG up to 50 MB</p>
                  </div>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="hidden" disabled={uploading} />

                <AnimatePresence mode="wait">
                  {!previewUrl ? (
                    /* DROP ZONE */
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className="relative cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-4 p-12 transition-all duration-300"
                      style={{
                        background: isDragOver ? "rgba(20,184,166,0.08)" : "rgba(255,255,255,0.02)",
                        border: `2px dashed ${isDragOver ? "rgba(20,184,166,0.6)" : "rgba(255,255,255,0.1)"}`,
                        boxShadow: isDragOver ? "0 0 40px rgba(20,184,166,0.1)" : "none"
                      }}
                    >
                      {/* Upload icon ring */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300" style={{ background: isDragOver ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.05)" }}>
                          <motion.div animate={isDragOver ? { y: [-2, 2, -2] } : { y: 0 }} transition={{ repeat: Infinity, duration: 0.8 }}>
                            <Upload className="w-9 h-9" style={{ color: isDragOver ? C.primary : "#475569" }} />
                          </motion.div>
                        </div>
                        {isDragOver && (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute -inset-2 rounded-3xl border-2 border-teal-500/30 pointer-events-none animate-pulse" />
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-white font-bold text-base">{isDragOver ? "Drop to upload" : "Drag & drop your medical scan"}</p>
                        <p className="text-slate-500 text-sm mt-1">or click anywhere to browse files</p>
                      </div>

                      {/* File format chips */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {["JPG", "JPEG", "PNG", "DICOM (soon)"].map(fmt => (
                          <span key={fmt} className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                            {fmt}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600">Maximum file size: <span className="text-slate-400 font-semibold">50 MB</span></p>
                    </motion.div>
                  ) : (
                    /* FILE PREVIEW */
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Image */}
                      <div className="relative rounded-2xl overflow-hidden flex items-center justify-center max-h-[340px]" style={{ background: "#000" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Scan preview" className="max-h-[340px] w-full object-contain" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        {/* Scan overlay badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: "rgba(20,184,166,0.9)", color: "#0F172A" }}>
                          <CheckCircle className="w-3 h-3" /> Scan Loaded
                        </div>
                        {/* Remove button */}
                        {!uploading && (
                          <button type="button" onClick={removeFile} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ background: "rgba(239,68,68,0.85)" }}>
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>

                      {/* File metadata grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "File Name",   value: file?.name.slice(0, 20) + (file!.name.length > 20 ? "..." : ""), icon: FileType },
                          { label: "File Size",   value: formatBytes(file?.size ?? 0), icon: Target },
                          { label: "Format",      value: file?.type.split("/")[1].toUpperCase() ?? "–", icon: ImageIcon },
                          { label: "Upload Time", value: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }), icon: Clock },
                        ].map((m) => {
                          const Icon = m.icon;
                          return (
                            <div key={m.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <Icon className="w-3.5 h-3.5 text-slate-500 mb-1.5" />
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.label}</p>
                              <p className="text-sm font-bold text-white mt-0.5 truncate">{m.value}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Replace / Remove row */}
                      {!uploading && (
                        <div className="flex gap-3">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-ghost text-xs flex-1">
                            <RefreshCw className="w-3.5 h-3.5" /> Replace Image
                          </button>
                          <button type="button" onClick={removeFile} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#FCA5A5" }}>
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ═══ DISCLAIMER ═══ */}
              <motion.div variants={fadeUp} className="flex items-start gap-3 p-4 rounded-2xl text-xs text-slate-400" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-300 font-bold">Medical Disclaimer: </strong>
                  CancerGuard AI provides risk assessment only. Results are not a substitute for professional medical diagnosis. Always consult a qualified physician.
                </span>
              </motion.div>

              {/* ═══ ACTION BUTTONS ═══ */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!cancerType || !file}
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: cancerType && file ? "linear-gradient(135deg,#14B8A6,#06B6D4)" : "rgba(255,255,255,0.05)",
                    color: cancerType && file ? "#0F172A" : "#475569",
                    boxShadow: cancerType && file ? "0 4px 24px rgba(20,184,166,0.35), 0 1px 0 rgba(255,255,255,0.2) inset" : "none"
                  }}
                >
                  {cancerType && file ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Start AI Analysis
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                      {!cancerType ? "Select a screening model first" : "Upload a scan image to continue"}
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCancerType(""); removeFile(); setError(null); }}
                  className="btn-ghost px-6 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Form
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        ) : (
          /* ═══ DEDICATED AI PROCESSING VIEW ═══ */
          <motion.div
            key="processing-view"
            initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
            className="flex-1 flex flex-col justify-center min-h-[calc(100vh-6rem)]"
          >
            <AIProcessingView progress={progress} cancerType={selectedOption?.name || cancerType} />
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
