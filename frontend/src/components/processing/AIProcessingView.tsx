"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, CheckCircle2, ShieldAlert, Cpu, Network, FileText, 
  Dna, HeartPulse, Scan, Loader2
} from "lucide-react";

interface AIProcessingViewProps {
  progress: number;
  cancerType: string;
}

const WORKFLOW_STEPS = [
  { id: 1, label: "Scan Uploaded", threshold: 5, icon: Scan },
  { id: 2, label: "Image Validation", threshold: 15, icon: ShieldAlert },
  { id: 3, label: "AI Image Preprocessing", threshold: 30, icon: Cpu },
  { id: 4, label: "Feature Extraction", threshold: 45, icon: Network },
  { id: 5, label: "Cancer Detection Model Running", threshold: 60, icon: Activity },
  { id: 6, label: "Confidence Score Calculation", threshold: 75, icon: Loader2 },
  { id: 7, label: "Google Gemini Medical Explanation", threshold: 85, icon: Dna },
  { id: 8, label: "Report Generation", threshold: 95, icon: FileText },
  { id: 9, label: "Analysis Complete", threshold: 100, icon: CheckCircle2 },
];

export default function AIProcessingView({ progress, cancerType }: AIProcessingViewProps) {
  const [estimatedTime, setEstimatedTime] = useState(12);

  // Countdown timer for aesthetics
  useEffect(() => {
    if (progress >= 100) {
      setEstimatedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setEstimatedTime(prev => Math.max(1, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [progress]);

  // Determine current active step
  const currentStepIndex = WORKFLOW_STEPS.reduce((acc, step, idx) => {
    if (progress >= step.threshold) return idx;
    return acc;
  }, 0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
      
      {/* ═══ CENTRAL ANIMATION HUB ═══ */}
      <div className="relative mb-12 flex justify-center items-center w-full max-w-sm">
        
        {/* Outer Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-teal-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle Dashed Ring */}
        <motion.div 
          className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-500/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Center Node / Icon */}
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center z-10" style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(20,184,166,0.3)", boxShadow: "0 0 60px rgba(20,184,166,0.15)" }}>
          <AnimatePresence mode="wait">
            {progress < 40 ? (
              <motion.div key="scan" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center text-teal-400">
                <Scan className="w-10 h-10 mb-1" />
              </motion.div>
            ) : progress < 70 ? (
              <motion.div key="dna" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center text-indigo-400">
                <Dna className="w-10 h-10 mb-1 animate-pulse" />
              </motion.div>
            ) : progress < 90 ? (
              <motion.div key="network" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center text-purple-400">
                <Network className="w-10 h-10 mb-1" />
              </motion.div>
            ) : (
              <motion.div key="heart" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center text-emerald-400">
                <HeartPulse className="w-10 h-10 mb-1" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulsing center glow */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-teal-500/10 pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Orbiting particles */}
        <motion.div 
          className="absolute w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_#2DD4BF]" />
        </motion.div>
      </div>

      {/* ═══ PROGRESS TEXT & BAR ═══ */}
      <div className="w-full max-w-2xl text-center mb-10">
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          Processing {cancerType.charAt(0).toUpperCase() + cancerType.slice(1)} Scan
        </h2>
        <div className="flex items-center justify-center gap-6 text-sm font-semibold mb-6">
          <span className="text-teal-400 flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" />
            {progress}% Complete
          </span>
          <span className="text-slate-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Est. Time: {estimatedTime}s
          </span>
        </div>

        <div className="relative w-full h-2 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg, #14B8A6, #06B6D4)", boxShadow: "0 0 20px rgba(20,184,166,0.6)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ═══ WORKFLOW CHECKLIST ═══ */}
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isDone = progress >= step.threshold;
            const isActive = idx === currentStepIndex && progress < 100;
            const isPending = progress < step.threshold && !isActive;
            const Icon = step.icon;

            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-4 transition-all duration-300 ${
                  isDone ? "opacity-100" : isActive ? "opacity-100" : "opacity-30"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  isDone ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : 
                  isActive ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : 
                  "bg-slate-800 text-slate-500 border border-slate-700"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                <span className={`text-sm font-bold tracking-wide ${
                  isDone ? "text-slate-200" : isActive ? "text-indigo-300" : "text-slate-500"
                }`}>
                  {step.label}
                </span>

                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-auto text-[10px] uppercase font-black text-indigo-400 tracking-widest"
                  >
                    Processing
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
