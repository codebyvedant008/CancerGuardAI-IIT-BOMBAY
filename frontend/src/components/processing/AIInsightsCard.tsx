"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { Sparkles, Brain, Stethoscope, Activity, Carrot, MessageCircle, ArrowRight, ShieldAlert } from "lucide-react";

interface AIInsightsCardProps {
  scanId: string;
}

interface InsightsData {
  medical_summary: string;
  patient_friendly_explanation: string;
  clinical_interpretation: string;
  preventive_advice: string;
  lifestyle_recommendations: string;
  suggested_follow_up: string;
  questions_to_discuss: string;
}

// Simple typewriter component
const Typewriter = ({ text, delay = 10, onComplete }: { text: string; delay?: number; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay, onComplete]);

  return <span>{displayed}</span>;
};

export default function AIInsightsCard({ scanId }: AIInsightsCardProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await api.get<InsightsData>(`/scans/${scanId}/insights`);
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to generate AI insights.");
      } finally {
        setLoading(false);
      }
    }
    if (scanId) {
      fetchInsights();
    }
  }, [scanId]);

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 bg-teal-500/5 blur-3xl rounded-full opacity-50 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-dashed border-teal-500/50 flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-teal-400" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-lg font-black text-white tracking-tight">Gemini AI is analyzing...</h3>
            <p className="text-sm text-slate-400 mt-1">Generating personalized medical insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] border-amber-500/20 bg-amber-500/5">
        <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
        <p className="text-amber-200 font-semibold">{error || "Unable to generate insights at this time."}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Sparkles className="w-40 h-40" />
      </div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#14B8A6,#06B6D4)" }}>
          <Sparkles className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Gemini Medical Insights</h3>
          <p className="text-xs font-semibold text-slate-400">Comprehensive AI-Generated Summary</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Medical Summary */}
        <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Executive Summary</h4>
          </div>
          <p className="text-teal-50 text-sm leading-relaxed font-medium">
            <Typewriter text={data.medical_summary} onComplete={() => setIsTyping(false)} />
            {isTyping && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity }} className="inline-block w-2 h-4 ml-1 bg-teal-400 align-middle" />}
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightSection icon={MessageCircle} title="Patient Friendly Explanation" content={data.patient_friendly_explanation} isTyping={isTyping} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
          <InsightSection icon={Stethoscope} title="Clinical Interpretation" content={data.clinical_interpretation} isTyping={isTyping} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20" />
          <InsightSection icon={ShieldAlert} title="Preventive Advice" content={data.preventive_advice} isTyping={isTyping} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
          <InsightSection icon={Carrot} title="Lifestyle Recommendations" content={data.lifestyle_recommendations} isTyping={isTyping} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        </div>

        {/* Full width bottom sections */}
        <div className="p-5 rounded-2xl border border-slate-700/50 bg-slate-800/50">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Follow-Up</h4>
          <p className="text-slate-200 text-sm leading-relaxed">
            {!isTyping ? data.suggested_follow_up : "..."}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Questions to Discuss with a Doctor</h4>
          <ul className="space-y-2">
            {!isTyping ? data.questions_to_discuss.split('\n').map((q, i) => {
              if (!q.trim()) return null;
              return (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                  <ArrowRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span>{q.replace(/^[•-]\s*/, '')}</span>
                </li>
              );
            }) : (
              <li className="text-sm text-slate-500 animate-pulse">Generating questions...</li>
            )}
          </ul>
        </div>

      </div>
    </motion.div>
  );
}

function InsightSection({ icon: Icon, title, content, isTyping, color, bg, border }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${border} ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">
        {!isTyping ? content : "..."}
      </p>
    </div>
  );
}
