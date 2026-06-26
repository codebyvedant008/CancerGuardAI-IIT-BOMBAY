"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, ScanHistoryItem } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, Eye, Activity, Brain, Wind, Heart,
  Dna, LayoutGrid, List, Clock, ShieldAlert, ShieldCheck,
  TrendingUp, BarChart2, Plus, Star, Trash2, Share2, ChevronRight,
  Calendar, Loader2, Scan, Fingerprint
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { format, subDays, parseISO } from "date-fns";

/* ── helpers ── */
const riskMeta = (risk: string) => {
  if (!risk) return { color: "#64748B", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", label: "Unknown" };
  if (risk.includes("Low"))    return { color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)",  label: "Low Risk" };
  if (risk.includes("Medium")) return { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", label: "Med Risk" };
  return { color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", label: "High Risk" };
};

const cancerIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("brain"))  return Brain;
  if (t.includes("lung"))   return Wind;
  if (t.includes("breast")) return Heart;
  if (t.includes("skin"))   return Fingerprint;
  if (t.includes("blood") || t.includes("leuk")) return Dna;
  return Activity;
};

const cancerRegion = (type: string): string => {
  const m: Record<string, string> = {
    skin: "Epidermis", brain: "Cerebrum", lung: "Pulmonary Lobes",
    breast: "Mammary Glands", colorectal: "Colon / Rectum",
    prostate: "Prostate Gland", leukemia: "Blood / Bone Marrow",
    pancreatic: "Pancreas", ovarian: "Ovaries",
  };
  for (const k of Object.keys(m)) if ((type || "").includes(k)) return m[k];
  return "Systemic";
};

const COLORS = ["#22C55E","#F59E0B","#EF4444","#14B8A6","#6366F1","#EC4899"];
const PIE_COLORS: Record<string,string> = { "Low Risk":"#22C55E","Medium Risk":"#F59E0B","High Risk":"#EF4444" };

type ViewMode = "grid" | "list" | "timeline";

export default function PredictionHistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get<ScanHistoryItem[]>("/scans/history")
      .then(d => setScans(d))
      .catch(e => setError(e.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return scans.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        s.cancer_type.replace(/_/g,"").includes(q) ||
        (s.prediction?.prediction_label || "").toLowerCase().includes(q);
      const matchType = !filterType || s.cancer_type.includes(filterType);
      const matchRisk = !filterRisk || s.prediction?.prediction_label === filterRisk;
      return matchSearch && matchType && matchRisk;
    });
  }, [scans, search, filterType, filterRisk]);

  // Analytics
  const totalScans = scans.length;
  const avgConfidence = scans.length
    ? Math.round(scans.filter(s => s.prediction).reduce((a, s) => a + s.prediction!.confidence, 0) / (scans.filter(s => s.prediction).length || 1))
    : 0;
  const highRisk = scans.filter(s => s.prediction?.prediction_label?.includes("High")).length;
  const lowRisk  = scans.filter(s => s.prediction?.prediction_label?.includes("Low")).length;

  // Monthly chart data (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const day = format(subDays(new Date(), 6 - i), "MMM d");
    const dayScans = scans.filter(s => format(new Date(s.created_at), "MMM d") === day);
    return {
      day,
      scans: dayScans.length,
      confidence: dayScans.length
        ? Math.round(dayScans.filter(s => s.prediction).reduce((a,s) => a + s.prediction!.confidence, 0) / (dayScans.filter(s=>s.prediction).length || 1))
        : 0,
    };
  });

  // Pie data
  const riskDist = scans.reduce<Record<string,number>>((acc, s) => {
    const l = s.prediction?.prediction_label || "Unknown";
    acc[l] = (acc[l] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(riskDist).map(([name, value]) => ({ name, value }));

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
  const fadeUp  = { hidden: { opacity:0, y:20 }, visible: { opacity:1, y:0, transition:{ duration:0.45, ease:[0.16,1,0.3,1] } } };

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl mx-auto pb-12">

        {/* ── Page header ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Analytics & Records</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Prediction History</h1>
            <p className="text-sm text-slate-400 mt-1">Complete record of all your AI-powered cancer screenings.</p>
          </div>
          <button onClick={() => router.push("/upload")} className="btn-primary gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Scan
          </button>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Total Scans",   value: totalScans,   icon: Scan,         color:"#14B8A6", glow:"rgba(20,184,166,0.15)" },
            { label:"Avg Confidence",value:`${avgConfidence}%`, icon: TrendingUp,  color:"#6366F1", glow:"rgba(99,102,241,0.15)" },
            { label:"High Risk Flags",value: highRisk,   icon: ShieldAlert,  color:"#EF4444", glow:"rgba(239,68,68,0.15)" },
            { label:"Low Risk Scans", value: lowRisk,    icon: ShieldCheck,  color:"#22C55E", glow:"rgba(34,197,94,0.15)" },
          ].map(({ label, value, icon: Icon, color, glow }) => (
            <div key={label} className="glass-panel p-5 rounded-2xl border border-white/[0.06] relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: glow }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: glow, border: `1px solid ${color}30` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Charts row ── */}
        {scans.length > 0 && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Area chart — confidence trend */}
            <div className="glass-panel p-5 rounded-2xl lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1">Confidence Trend (Last 7 Days)</h3>
              <p className="text-xs text-slate-500 mb-4">Daily AI confidence scores across all scans</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#14B8A6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="day" tick={{ fontSize:10, fill:"#64748B" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:"#64748B" }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, fontSize:11, color:"#e2e8f0" }}/>
                  <Area type="monotone" dataKey="confidence" stroke="#14B8A6" strokeWidth={2} fill="url(#cg)" name="Avg Confidence"/>
                  <Area type="monotone" dataKey="scans" stroke="#6366F1" strokeWidth={2} fill="none" strokeDasharray="4 2" name="Total Scans"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — risk distribution */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-1">Risk Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">Breakdown by classification</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, fontSize:11, color:"#e2e8f0" }}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"#94A3B8" }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">No data yet</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Filter & View controls ── */}
        <motion.div variants={fadeUp} className="glass-panel rounded-2xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search scans, cancer type, risk level..."
                className="w-full pl-8 pr-3 py-2 text-xs font-medium bg-slate-800/60 border border-white/[0.08] rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition"
              />
            </div>

            {/* Type filter */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-slate-800/60 border border-white/[0.08] rounded-xl text-slate-300 focus:outline-none focus:border-teal-500/50 transition cursor-pointer">
              <option value="">All Types</option>
              {["skin","brain","lung","breast","colorectal","prostate","leukemia","pancreatic","ovarian"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>

            {/* Risk filter */}
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
              className="text-xs font-semibold py-2 px-3 bg-slate-800/60 border border-white/[0.08] rounded-xl text-slate-300 focus:outline-none focus:border-teal-500/50 transition cursor-pointer">
              <option value="">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
            </select>

            {(search || filterType || filterRisk) && (
              <button onClick={() => { setSearch(""); setFilterType(""); setFilterRisk(""); }}
                className="text-xs font-bold text-slate-400 hover:text-rose-400 transition px-3 py-2">
                Clear
              </button>
            )}

            {/* View toggle */}
            <div className="ml-auto flex items-center gap-1 bg-slate-800/60 border border-white/[0.06] rounded-xl p-1">
              {([["grid",LayoutGrid],["list",List],["timeline",Clock]] as [ViewMode, any][]).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-2 rounded-lg transition ${view === v ? "bg-teal-500/20 text-teal-400" : "text-slate-500 hover:text-slate-300"}`}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Results count ── */}
        {!loading && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            {filtered.length !== scans.length && <span className="text-xs text-slate-600">· filtered from {scans.length} total</span>}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="glass-panel rounded-2xl p-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-teal-500/20 border-t-teal-400 animate-spin" />
            <p className="text-sm text-slate-400 font-semibold">Loading scan history...</p>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-rose-400">{error}</div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="glass-panel rounded-2xl p-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Activity className="w-7 h-7 text-teal-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold">No scans found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or run a new scan.</p>
            </div>
            <button onClick={() => router.push("/upload")} className="btn-primary text-sm gap-2 mt-2">
              <Plus className="w-4 h-4" /> Start New Scan
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ═══ GRID VIEW ═══ */}
            {view === "grid" && (
              <motion.div key="grid" variants={stagger} initial="hidden" animate="visible" exit={{ opacity:0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(scan => {
                  const rm = riskMeta(scan.prediction?.prediction_label || "");
                  const Icon = cancerIcon(scan.cancer_type);
                  const isFav = favorites.has(scan.id);
                  const conf = scan.prediction?.confidence || 0;
                  const circ = 2 * Math.PI * 22;
                  return (
                    <motion.div key={scan.id} variants={fadeUp}
                      className="glass-panel rounded-2xl p-5 border border-white/[0.06] group hover:border-teal-500/20 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
                      {/* Glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                        style={{ boxShadow: `inset 0 0 30px ${rm.color}10` }} />

                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: rm.bg, border: `1px solid ${rm.border}` }}>
                          <Icon className="w-5 h-5" style={{ color: rm.color }} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleFav(scan.id)} className={`transition ${isFav ? "text-amber-400" : "text-slate-600 hover:text-slate-400"}`}>
                            <Star className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
                          </button>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: rm.color, background: rm.bg, border: `1px solid ${rm.border}` }}>
                            {rm.label}
                          </span>
                        </div>
                      </div>

                      {/* Name + region */}
                      <h3 className="text-sm font-black text-white capitalize mb-0.5">{scan.cancer_type.replace(/_/g," ")}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-4">{cancerRegion(scan.cancer_type)}</p>

                      {/* Confidence ring + date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="relative w-14 h-14">
                          <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform:"rotate(-90deg)" }}>
                            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
                            <circle cx="28" cy="28" r="22" fill="none" stroke={rm.color} strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={circ} strokeDashoffset={circ - (conf/100)*circ}/>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-black" style={{ color: rm.color }}>{conf}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Scanned</p>
                          <p className="text-xs font-bold text-slate-300">{format(new Date(scan.created_at), "MMM d, yyyy")}</p>
                          <p className="text-[10px] text-slate-500">{format(new Date(scan.created_at), "h:mm a")}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                        <button onClick={() => router.push(`/result/${scan.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition">
                          <Eye className="w-3.5 h-3.5"/> View
                        </button>
                        <button className="p-2 rounded-xl text-slate-500 hover:text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition">
                          <Share2 className="w-3.5 h-3.5"/>
                        </button>
                        <button className="p-2 rounded-xl text-slate-500 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] transition">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ═══ LIST VIEW ═══ */}
            {view === "list" && (
              <motion.div key="list" variants={stagger} initial="hidden" animate="visible" exit={{ opacity:0 }}
                className="glass-panel rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/[0.06] grid grid-cols-12 gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="col-span-3">Cancer Module</div>
                  <div className="col-span-2">Risk Level</div>
                  <div className="col-span-2">Confidence</div>
                  <div className="col-span-2">Region</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {filtered.map((scan, i) => {
                  const rm = riskMeta(scan.prediction?.prediction_label || "");
                  const Icon = cancerIcon(scan.cancer_type);
                  return (
                    <motion.div key={scan.id} variants={fadeUp}
                      className="px-6 py-4 grid grid-cols-12 gap-4 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition group">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: rm.bg }}>
                          <Icon className="w-4 h-4" style={{ color: rm.color }}/>
                        </div>
                        <span className="text-sm font-bold text-white capitalize">{scan.cancer_type.replace(/_/g," ")}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: rm.color, background: rm.bg }}>
                          {scan.prediction?.prediction_label || "Pending"}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm font-bold" style={{ color: rm.color }}>
                        {scan.prediction?.confidence || "—"}%
                      </div>
                      <div className="col-span-2 text-xs text-slate-400 font-medium">{cancerRegion(scan.cancer_type)}</div>
                      <div className="col-span-2 text-xs text-slate-400 font-medium">
                        {format(new Date(scan.created_at), "MMM d, yyyy")}
                      </div>
                      <div className="col-span-1 flex justify-end gap-1">
                        <button onClick={() => router.push(`/result/${scan.id}`)}
                          className="p-1.5 rounded-lg text-teal-400 hover:bg-teal-500/10 transition">
                          <Eye className="w-3.5 h-3.5"/>
                        </button>
                        <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition">
                          <ChevronRight className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ═══ TIMELINE VIEW ═══ */}
            {view === "timeline" && (
              <motion.div key="timeline" variants={stagger} initial="hidden" animate="visible" exit={{ opacity:0 }}
                className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-teal-500/40 via-slate-700 to-transparent"/>
                {filtered.map((scan, i) => {
                  const rm = riskMeta(scan.prediction?.prediction_label || "");
                  const Icon = cancerIcon(scan.cancer_type);
                  return (
                    <motion.div key={scan.id} variants={fadeUp} className="relative mb-6">
                      {/* Dot */}
                      <div className="absolute -left-[21px] top-5 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center"
                        style={{ background: rm.color }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/80"/>
                      </div>

                      <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] hover:border-teal-500/20 transition group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: rm.bg, border:`1px solid ${rm.border}` }}>
                              <Icon className="w-4 h-4" style={{ color: rm.color }}/>
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white capitalize">{scan.cancer_type.replace(/_/g," ")}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-500"/>
                                <span className="text-xs text-slate-500 font-medium">{format(new Date(scan.created_at), "MMMM d, yyyy · h:mm a")}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: rm.color, background: rm.bg, border:`1px solid ${rm.border}` }}>
                            {scan.prediction?.prediction_label || "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-slate-400">
                          <span>Confidence: <strong style={{ color: rm.color }}>{scan.prediction?.confidence || 0}%</strong></span>
                          <span>Region: <strong className="text-slate-300">{cancerRegion(scan.cancer_type)}</strong></span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => router.push(`/result/${scan.id}`)}
                            className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 transition">
                            <Eye className="w-3.5 h-3.5"/> View Report
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl text-slate-400 hover:text-slate-200 bg-white/[0.03] hover:bg-white/[0.06] transition">
                            <Share2 className="w-3.5 h-3.5"/> Share
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </motion.div>
    </DashboardLayout>
  );
}
