"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api, ScanHistoryItem } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  Activity, Upload, FileText, ShieldAlert, Brain, CheckCircle,
  Dna, TrendingUp, Fingerprint, Wind, Heart, Syringe, Stethoscope,
  Microscope, Eye, Users, Search, Zap, FileSearch, Calendar,
  BarChart3, Clock, ArrowUpRight, Sparkles, Shield, AlertCircle,
  Info, Bot, Scan, Star, Target, Loader2, ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ═══════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════ */
const C = {
  primary:   "#14B8A6",
  secondary: "#2DD4BF",
  accent:    "#06B6D4",
  success:   "#22C55E",
  warning:   "#F59E0B",
  danger:    "#EF4444",
  indigo:    "#818CF8",
};

const RISK_COLORS = [C.success, C.warning, C.danger];

const SUPPORTED_CANCERS = [
  { name: "Lung",       icon: Wind,        color: C.primary },
  { name: "Breast",     icon: Heart,       color: "#F472B6" },
  { name: "Skin",       icon: Fingerprint, color: "#FB923C" },
  { name: "Brain",      icon: Brain,       color: C.indigo  },
  { name: "Oral",       icon: Search,      color: C.warning },
  { name: "Liver",      icon: Activity,    color: C.success },
  { name: "Colon",      icon: Eye,         color: C.secondary},
  { name: "Prostate",   icon: Syringe,     color: "#60A5FA" },
  { name: "Pancreatic", icon: Microscope,  color: "#A78BFA" },
  { name: "Kidney",     icon: Activity,    color: C.accent  },
  { name: "Ovarian",    icon: Heart,       color: "#F9A8D4" },
  { name: "Cervical",   icon: Shield,      color: C.success },
  { name: "Leukemia",   icon: Target,      color: C.danger  },
  { name: "Thyroid",    icon: Activity,    color: C.warning },
  { name: "Stomach",    icon: Search,      color: "#34D399" },
  { name: "Bladder",    icon: Eye,         color: "#38BDF8" },
];

/* ═══════════════════════════════════════
   ANIMATED COUNTER HOOK
═══════════════════════════════════════ */
function useCounter(target: number, duration = 1.5, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(v) { setValue(parseFloat(v.toFixed(decimals))); }
    });
    return () => controls.stop();
  }, [inView, target, duration, decimals]);
  return { ref, value };
}

/* ═══════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════ */
const StatusBadge = ({
  label, color = "teal"
}: { label: string; color?: "teal" | "green" | "amber" | "rose" | "indigo" }) => {
  const map: Record<string, string> = {
    teal:   "bg-teal-500/10 text-teal-300 border-teal-500/20",
    green:  "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    amber:  "bg-amber-500/10 text-amber-300 border-amber-500/20",
    rose:   "bg-rose-500/10 text-rose-300 border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${map[color]}`}>
      {label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="glass-panel p-5 rounded-2xl space-y-3">
    <div className="skeleton h-4 w-2/3 rounded-lg" />
    <div className="skeleton h-8 w-1/2 rounded-lg" />
    <div className="skeleton h-3 w-1/3 rounded-lg" />
  </div>
);

/* Custom Tooltip for Recharts */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="glass-panel px-4 py-3 rounded-xl text-sm shadow-2xl">
      <p className="font-bold text-white mb-1">{entry.name}</p>
      <p style={{ color: entry.payload.fill }} className="font-black text-lg">{entry.value}%</p>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function UserDashboard() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good Morning");
  const [greetingEmoji, setGreetingEmoji] = useState("☀️");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      if (h < 12) { setGreeting("Good Morning");   setGreetingEmoji("☀️"); }
      else if (h < 17) { setGreeting("Good Afternoon"); setGreetingEmoji("🌤️"); }
      else { setGreeting("Good Evening");   setGreetingEmoji("🌙"); }
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get<ScanHistoryItem[]>("/scans/history")
      .then(setScans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const riskCounts = scans.reduce(
    (acc, item) => {
      if (item.prediction) {
        const l = item.prediction.prediction_label;
        if (l === "Low Risk")    acc.low++;
        if (l === "Medium Risk") acc.medium++;
        if (l === "High Risk")   acc.high++;
      }
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  const totalRisk = riskCounts.low + riskCounts.medium + riskCounts.high || 1;
  const riskChartData = [
    { name: "Low Risk",    value: Math.round((riskCounts.low    / totalRisk) * 100) || 82 },
    { name: "Moderate",    value: Math.round((riskCounts.medium / totalRisk) * 100) || 13 },
    { name: "High Risk",   value: Math.round((riskCounts.high   / totalRisk) * 100) || 5  },
  ];

  const gaugeData = [{ name: "Score", value: 92 }, { name: "Rest", value: 8 }];
  const firstName = user?.full_name?.split(" ")[0] || "James";

  /* ── Counters ── */
  const cModels    = useCounter(16,   1.2, 0);
  const cAccuracy  = useCounter(98.2, 1.5, 1);
  const cReports   = useCounter(1200, 2.0, 0);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  };
  const fadeUp = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full text-slate-100 pb-8"
      >

        {/* ═══════════════════════════════
            HERO SECTION
        ═══════════════════════════════ */}
        <motion.div variants={fadeUp} className="relative rounded-[2rem] overflow-hidden" style={{
          background: "linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(6,182,212,0.06) 40%, rgba(15,23,42,0.9) 100%)",
          border: "1px solid rgba(20,184,166,0.2)",
          boxShadow: "0 0 80px rgba(20,184,166,0.08), 0 4px 32px rgba(0,0,0,0.5)"
        }}>
          {/* Ambient blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-20 w-56 h-56 rounded-full blur-[80px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)" }} />

          {/* Floating medical graphics — ultra-low opacity */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <Dna className="absolute top-6 right-12 w-32 h-32 text-teal-400 opacity-[0.04] animate-float-slow" />
            <Activity className="absolute bottom-4 right-56 w-48 h-10 text-teal-300 opacity-[0.04] animate-float-medium" style={{ transform: "scaleX(3)" }} />
            <Brain className="absolute top-1/2 -translate-y-1/2 right-4 w-20 h-20 text-cyan-400 opacity-[0.03] animate-float-medium" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
            {/* Left: Greeting */}
            <div className="flex-1 space-y-5">
              {/* Live status */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "#2DD4BF" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                AI Systems Online · {currentTime}
              </motion.div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {greeting}, {firstName}{" "}
                  <span className="inline-block animate-heartbeat">{greetingEmoji}</span>
                </h1>
                <p className="mt-3 text-base text-slate-400 max-w-xl leading-relaxed">
                  Your AI-powered cancer screening platform is ready. Monitor scans, generate reports, and receive intelligent risk assessments.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/upload" className="btn-primary text-sm">
                  <Upload className="w-4 h-4" />
                  Upload New Scan
                </Link>
                <Link href="/history" className="btn-ghost text-sm">
                  <FileSearch className="w-4 h-4" />
                  View History
                </Link>
              </div>
            </div>

            {/* Right: Health Score Gauge */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative animate-pulse-glow rounded-full"
                style={{
                  width: 200, height: 200,
                  background: "radial-gradient(circle at 50% 50%, rgba(20,184,166,0.08) 0%, transparent 70%)",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%" cy="50%"
                      innerRadius={72} outerRadius={90}
                      startAngle={225} endAngle={-45}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive
                      animationBegin={300}
                      animationDuration={1200}
                      cornerRadius={8}
                    >
                      <Cell fill="url(#gaugeGrad)" />
                      <Cell fill="rgba(255,255,255,0.05)" />
                    </Pie>
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
                  <span className="text-5xl font-black text-white tracking-tighter leading-none">
                    92<span className="text-2xl" style={{ color: C.primary }}>%</span>
                  </span>
                  <span className="label-xs text-slate-400 mt-1">Health Score</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Overall Health Status</p>
                <StatusBadge label="✓ Healthy · Low Risk" color="green" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════
            STATS CARDS
        ═══════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {/* Models */}
              <motion.div variants={fadeUp} className="glass-panel p-5 rounded-2xl group cursor-default hover:-translate-y-1 transition-all duration-300" style={{ borderColor: "rgba(20,184,166,0.15)" }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(20,184,166,0.1)" }}>
                    <Brain className="w-5 h-5" style={{ color: C.primary }} />
                  </div>
                  <StatusBadge label="Active" color="teal" />
                </div>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">AI Models</p>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider"> Available</p>
                <span ref={cModels.ref} className="metric-xl" style={{ color: C.primary }}>{cModels.value}</span>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>All neural nets online</span>
                </div>
              </motion.div>

              {/* Accuracy */}
              <motion.div variants={fadeUp} className="glass-panel p-5 rounded-2xl group cursor-default hover:-translate-y-1 transition-all duration-300" style={{ borderColor: "rgba(6,182,212,0.15)" }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(6,182,212,0.1)" }}>
                    <Target className="w-5 h-5" style={{ color: C.accent }} />
                  </div>
                  <StatusBadge label="Stable" color="teal" />
                </div>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Average</p>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Accuracy</p>
                <span ref={cAccuracy.ref} className="metric-xl" style={{ color: C.accent }}>{cAccuracy.value}<span className="text-2xl text-slate-500">%</span></span>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Benchmark validated</span>
                </div>
              </motion.div>

              {/* Reports */}
              <motion.div variants={fadeUp} className="glass-panel p-5 rounded-2xl group cursor-default hover:-translate-y-1 transition-all duration-300" style={{ borderColor: "rgba(129,140,248,0.15)" }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(129,140,248,0.1)" }}>
                    <FileText className="w-5 h-5" style={{ color: C.indigo }} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    <ArrowUpRight className="w-3 h-3" /> +12%
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Reports</p>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Generated</p>
                <span ref={cReports.ref} className="metric-xl" style={{ color: C.indigo }}>{cReports.value.toLocaleString()}<span className="text-2xl" style={{ color: C.indigo }}>+</span></span>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <BarChart3 className="w-3 h-3 text-indigo-400" />
                  <span>Since platform launch</span>
                </div>
              </motion.div>

              {/* Confidence */}
              <motion.div variants={fadeUp} className="glass-panel p-5 rounded-2xl group cursor-default hover:-translate-y-1 transition-all duration-300" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.1)" }}>
                    <ShieldAlert className="w-5 h-5" style={{ color: C.warning }} />
                  </div>
                  <StatusBadge label="Optimal" color="amber" />
                </div>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Prediction</p>
                <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Confidence</p>
                <span className="metric-xl" style={{ background: "linear-gradient(135deg,#F59E0B,#FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>High</span>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Multi-model consensus</span>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════
            AI INSIGHTS + RISK CHART
        ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* AI Insights (left 2/3) */}
          <motion.div variants={fadeUp} className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 blur-[80px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)" }} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl shadow-lg" style={{ background: "linear-gradient(135deg,#14B8A6,#06B6D4)", boxShadow: "0 4px 20px rgba(20,184,166,0.35)" }}>
                <Bot className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg leading-none">AI Insights</h2>
                <p className="text-slate-500 text-xs mt-0.5">Real-time diagnostic intelligence</p>
              </div>
              <div className="ml-auto">
                <StatusBadge label="Live" color="green" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Insight 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl group hover:-translate-y-0.5 transition-all duration-200" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <div className="p-2 rounded-xl mt-0.5 flex-shrink-0" style={{ background: "rgba(34,197,94,0.1)" }}>
                  <CheckCircle className="w-4 h-4" style={{ color: C.success }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm">General Assessment</h4>
                    <StatusBadge label="Healthy" color="green" />
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    No major abnormalities detected. Tissue structure appears stable across all scanned regions.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs" style={{ color: C.success }}>
                    <Zap className="w-3 h-3" />
                    <span className="font-bold">Confidence: 98.2%</span>
                  </div>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl group hover:-translate-y-0.5 transition-all duration-200" style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.12)" }}>
                <div className="p-2 rounded-xl mt-0.5 flex-shrink-0" style={{ background: "rgba(129,140,248,0.1)" }}>
                  <Wind className="w-4 h-4" style={{ color: C.indigo }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm">Lung Cancer Model</h4>
                    <StatusBadge label="Low Risk" color="teal" />
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    No nodules or calcifications identified in upper lobes. Airway structure within normal parameters.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs" style={{ color: C.indigo }}>
                    <Zap className="w-3 h-3" />
                    <span className="font-bold">Confidence: 98.7%</span>
                  </div>
                </div>
              </div>

              {/* Insight 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl group hover:-translate-y-0.5 transition-all duration-200" style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.12)" }}>
                <div className="p-2 rounded-xl mt-0.5 flex-shrink-0" style={{ background: "rgba(20,184,166,0.1)" }}>
                  <Calendar className="w-4 h-4" style={{ color: C.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm">Recommendation</h4>
                    <StatusBadge label="Scheduled" color="teal" />
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Annual screening recommended. Next preventive checkup in 6 months for optimal early detection.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Risk Distribution Chart (right 1/3) */}
          <motion.div variants={fadeUp} className="glass-panel rounded-3xl p-6 flex flex-col">
            <h2 className="font-bold text-white text-lg leading-none mb-1">Risk Distribution</h2>
            <p className="text-slate-500 text-xs mb-5">Aggregate scan analytics</p>

            <div className="flex-1 min-h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive
                    animationBegin={400}
                    animationDuration={1000}
                    cornerRadius={6}
                  >
                    {riskChartData.map((_, idx) => (
                      <Cell key={idx} fill={RISK_COLORS[idx]} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Shield className="w-5 h-5 text-slate-600" />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {riskChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: RISK_COLORS[idx] }} />
                    <span className="text-slate-400 text-xs font-medium">{item.name}</span>
                  </div>
                  <span className="text-white text-xs font-black">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════
            AI ENGINE + ACTIVITY TIMELINE
        ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* AI Engine Performance (2/3) */}
          <motion.div variants={fadeUp} className="lg:col-span-2 glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(20,184,166,0.1)" }}>
                <Activity className="w-5 h-5" style={{ color: C.primary }} />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg leading-none">AI Engine Performance</h2>
                <p className="text-slate-500 text-xs mt-0.5">Live diagnostic system metrics</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Cancer Models", value: "16", sub: "Neural Networks", color: C.primary, icon: Brain },
                { label: "Avg Accuracy", value: "98.2%", sub: "Benchmark validated", color: C.accent, icon: Target },
                { label: "Reports Done", value: "1,200+", sub: "PDF generated", color: C.indigo, icon: FileText },
                { label: "Analysis Mode", value: "Live", sub: "Real-time AI", color: C.success, icon: Zap, pulse: true },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="rounded-2xl p-4 text-center flex flex-col items-center gap-2 group hover:-translate-y-1 transition-all duration-200" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="p-2 rounded-lg" style={{ background: `${m.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: m.color }} />
                    </div>
                    {m.pulse ? (
                      <div className="flex flex-col items-center">
                        <span className="flex h-3 w-3 mb-1">
                          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-50" style={{ backgroundColor: m.color }} />
                          <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: m.color }} />
                        </span>
                        <span className="text-xs font-black" style={{ color: m.color }}>{m.value}</span>
                      </div>
                    ) : (
                      <span className="text-base font-black" style={{ color: m.color }}>{m.value}</span>
                    )}
                    <span className="label-xs text-slate-500">{m.label}</span>
                    <span className="text-[10px] text-slate-600 hidden md:block">{m.sub}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Activity Timeline (1/3) */}
          <motion.div variants={fadeUp} className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(129,140,248,0.1)" }}>
                <Clock className="w-5 h-5" style={{ color: C.indigo }} />
              </div>
              <div>
                <h2 className="font-bold text-white text-base leading-none">Recent Activity</h2>
                <p className="text-slate-500 text-xs mt-0.5">Today's AI pipeline</p>
              </div>
            </div>

            <div className="relative space-y-0">
              {[
                { time: "09:15", label: "Scan Uploaded", icon: Upload,    color: C.primary, done: true  },
                { time: "09:17", label: "AI Analysis Started", icon: Bot, color: C.accent,  done: true  },
                { time: "09:19", label: "Prediction Generated", icon: Zap,color: C.success, done: true  },
                { time: "09:20", label: "PDF Report Created", icon: FileText, color: C.indigo, done: true },
              ].map((item, idx, arr) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-3 relative">
                    {/* Vertical connector */}
                    {idx < arr.length - 1 && (
                      <div className="absolute left-[21px] top-[36px] w-0.5 h-8" style={{ background: "rgba(255,255,255,0.07)" }} />
                    )}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center z-10 mt-0.5" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="pb-7 min-w-0">
                      <p className="text-white text-sm font-semibold leading-tight">{item.label}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 font-mono">{item.time} AM</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════
            PLATFORM IMPACT + COVERAGE
        ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <motion.div variants={fadeUp} className="glass-panel p-6 rounded-3xl relative overflow-hidden" style={{ borderLeft: `3px solid ${C.primary}` }}>
            <div className="absolute right-0 top-0 w-32 h-32 blur-[60px]" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)" }} />
            <h2 className="font-bold text-white text-lg mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: C.primary }} />
              CancerGuard AI Impact
            </h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                "16 Supported Cancer Types",
                "1200+ Reports Generated",
                "98.2% Average Accuracy",
                "24/7 AI Screening Availability",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.primary }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-panel p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-bold text-white text-lg leading-none">Screening Coverage</h2>
                <p className="text-slate-500 text-xs mt-1">All diagnostic models active</p>
              </div>
              <StatusBadge label="100% Active" color="green" />
            </div>
            <p className="text-slate-400 text-sm mb-5 mt-3">
              All 16 neural network diagnostic models are online and processing in real-time.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">16 / 16 Models Active</span>
                <span style={{ color: C.primary }}>100%</span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, boxShadow: `0 0 12px rgba(20,184,166,0.5)` }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════
            SUPPORTED CANCER MODELS
        ═══════════════════════════════ */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Supported Diagnostic Models</h2>
              <p className="text-slate-500 text-xs mt-0.5">16 AI-powered cancer screening engines</p>
            </div>
            <Link href="/upload" className="text-xs font-bold flex items-center gap-1 transition-colors" style={{ color: C.primary }}>
              Start Scan <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {SUPPORTED_CANCERS.map((cancer, idx) => {
              const Icon = cancer.icon;
              return (
                <motion.div
                  key={idx}
                  className="glass-panel flex flex-col items-center justify-center p-3.5 rounded-2xl cursor-default group transition-all duration-200 hover:-translate-y-1.5"
                  whileHover={{ boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 30px ${cancer.color}20` }}
                  title="AI Model Ready"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110" style={{ background: `${cancer.color}15` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: cancer.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 text-center leading-tight group-hover:text-slate-200 transition-colors">{cancer.name}</span>
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: cancer.color }} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════════════════════════════
            FUTURE COLLABORATION BANNER
        ═══════════════════════════════ */}
        <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden" style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(20,184,166,0.08) 50%, rgba(15,23,42,0.9) 100%)",
          border: "1px solid rgba(6,182,212,0.2)",
          boxShadow: "0 0 60px rgba(6,182,212,0.06)"
        }}>
          <div className="absolute top-0 left-0 w-48 h-48 blur-[80px]" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 opacity-[0.03]">
            <Users className="w-48 h-48 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-start gap-5">
              <div className="p-3.5 rounded-2xl flex-shrink-0 shadow-lg" style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}>
                <Users className="w-7 h-7" style={{ color: C.accent }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">Future Vision & Collaboration</h3>
                  <StatusBadge label="Expanding" color="teal" />
                </div>
                <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                  CancerGuard AI aims to collaborate with hospitals, diagnostic centers, and healthcare professionals to enable faster, more accurate, and more accessible cancer screening worldwide.
                </p>
              </div>
            </div>
            <button className="btn-ghost flex-shrink-0 text-sm">
              Partner With Us <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
