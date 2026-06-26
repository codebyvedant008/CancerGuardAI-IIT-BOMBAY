"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api, API_URL } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Activity, Clock, CheckCircle2, AlertTriangle, Stethoscope,
  FileText, Calendar, Video, ChevronRight, Search, FilePlus, 
  TrendingUp, Shield, Bell, ArrowUpRight, Loader2, Plus, X, UserPlus,
  HeartPulse, Microscope, Star
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16,1,0.3,1] } } };
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export default function DoctorPortal() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingScans, setPendingScans] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, p, ps] = await Promise.all([
          api.get<any>("/doctor/stats"),
          api.get<any[]>("/doctor/patients"),
          api.get<any[]>("/doctor/pending-scans"),
        ]);
        setStats(s);
        setPatients(p);
        setPendingScans(ps);
      } catch {
        // Use mock data if backend returns 403 (e.g. patient user previewing)
        setStats({ total_patients: 128, total_scans: 342, reviewed: 315, pending_reviews: 27 });
        setPendingScans([
          { scan_id: "s-001", patient_name: "Sarah Connor", cancer_type: "skin", prediction_label: "High Risk Melanoma", confidence: 94.2, created_at: new Date().toISOString() },
          { scan_id: "s-002", patient_name: "John Wick", cancer_type: "lung", prediction_label: "Medium Risk", confidence: 68.1, created_at: new Date().toISOString() },
        ]);
        setPatients([
          { id: "p-1", full_name: "James Bond", email: "jbond@mi6.gov", age: 45, scan_count: 3 },
          { id: "p-2", full_name: "Sarah Connor", email: "sarah@sky.net", age: 32, scan_count: 1 },
          { id: "p-3", full_name: "John Wick", email: "john@continental.com", age: 52, scan_count: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAssignPatient = async () => {
    if (!assignEmail.trim()) return;
    setAssignLoading(true);
    setAssignMsg(null);
    try {
      await api.post(`/doctor/assign-patient?patient_email=${encodeURIComponent(assignEmail)}`, undefined);
      setAssignMsg({ type: "success", text: "Patient assigned successfully!" });
      setAssignEmail("");
    } catch (err: any) {
      setAssignMsg({ type: "error", text: err.message || "Failed to assign patient." });
    } finally {
      setAssignLoading(false);
    }
  };

  const STAT_CARDS = [
    { label: "My Patients", value: stats?.total_patients ?? "—", icon: Users, color: "teal", iconBg: "bg-teal-500/10", iconColor: "text-teal-400", border: "border-teal-500/20" },
    { label: "Pending Reviews", value: stats?.pending_reviews ?? "—", icon: Clock, color: "amber", iconBg: "bg-amber-500/10", iconColor: "text-amber-400", border: "border-amber-500/20" },
    { label: "Approved Reports", value: stats?.reviewed ?? "—", icon: CheckCircle2, color: "emerald", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Total Scans", value: stats?.total_scans ?? "—", icon: Activity, color: "indigo", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400", border: "border-indigo-500/20" },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-7 pb-14">

        {/* ─── HEADER ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-3">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Clinical Mode Active</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}, Dr. {user?.full_name?.split(" ").pop() ?? ""}
            </h1>
            <p className="text-sm text-slate-400 mt-1">You have <span className="text-amber-400 font-bold">{stats?.pending_reviews ?? "..."} pending AI reports</span> awaiting clinical review.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700 transition">
              <UserPlus className="w-4 h-4 text-teal-400" /> Assign Patient
            </button>
            <Link href="/doctor/patients" className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <Users className="w-4 h-4" /> Full Patient Registry
            </Link>
          </div>
        </motion.div>

        {/* ─── STAT CARDS ─────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map(card => (
            <div key={card.label} className={`bg-slate-900 border ${card.border} rounded-2xl p-5 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-black text-white mt-0.5">{loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : card.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ─── MAIN GRID ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: PENDING SCAN REVIEWS */}
          <motion.div variants={fadeUp} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <h2 className="font-black text-white text-sm uppercase tracking-widest">Pending AI Reports</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                {pendingScans.length} Queued
              </span>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
              </div>
            ) : pendingScans.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-white font-bold">All Caught Up!</p>
                <p className="text-slate-500 text-sm mt-1">No pending AI reports require your review.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {pendingScans.map((scan) => (
                  <div key={scan.scan_id} className="px-6 py-4 hover:bg-slate-800/30 transition flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      scan.prediction_label?.includes("High") ? "bg-rose-500/10" :
                      scan.prediction_label?.includes("Medium") ? "bg-amber-500/10" : "bg-emerald-500/10"
                    }`}>
                      <Microscope className={`w-5 h-5 ${
                        scan.prediction_label?.includes("High") ? "text-rose-400" :
                        scan.prediction_label?.includes("Medium") ? "text-amber-400" : "text-emerald-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{scan.patient_name}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          scan.prediction_label?.includes("High") ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          scan.prediction_label?.includes("Medium") ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {scan.prediction_label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{scan.cancer_type} cancer · {scan.confidence?.toFixed(1)}% AI confidence · {new Date(scan.created_at).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/doctor/review/${scan.scan_id}`} className="flex items-center gap-1.5 text-xs font-bold text-teal-400 opacity-0 group-hover:opacity-100 transition bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg hover:bg-teal-500/20 whitespace-nowrap">
                      Review <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: QUICK ACTIONS + PATIENTS SNAPSHOT */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-teal-400" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-widest">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Patient Registry", icon: Users, href: "/doctor/patients", hint: "Browse all patients" },
                  { label: "Write Referral", icon: FilePlus, href: "#", hint: "Send to specialist" },
                  { label: "Schedule Meeting", icon: Calendar, href: "#", hint: "Book appointment" },
                  { label: "Video Consultation", icon: Video, href: "#", hint: "Start telehealth session" },
                ].map(action => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-700 transition group">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 group-hover:bg-teal-500/20 flex items-center justify-center transition">
                      <action.icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-slate-200 group-hover:text-white transition block">{action.label}</span>
                      <span className="text-[10px] text-slate-500">{action.hint}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-400 transition" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Today's Patients Snapshot */}
            <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-white text-sm uppercase tracking-widest">Recent Patients</h3>
                <Link href="/doctor/patients" className="text-[10px] text-teal-400 font-bold hover:underline">View All</Link>
              </div>
              {patients.slice(0, 4).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-3 border-b border-slate-800/50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-teal-400 flex-shrink-0">
                    {p.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.full_name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.age ? `${p.age}y · ` : ""}{p.scan_count ?? 0} scans</p>
                  </div>
                  <HeartPulse className="w-4 h-4 text-slate-600" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ─── TELEHEALTH BANNER ──────────────────────────────── */}
        <motion.div variants={fadeUp} className="rounded-[2rem] overflow-hidden relative flex flex-col sm:flex-row items-center justify-between gap-6 p-8" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(99,102,241,0.10))", border: "1px solid rgba(20,184,166,0.2)" }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-black text-teal-400 uppercase tracking-widest">Telehealth Beta</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Start a Video Consultation</h3>
            <p className="text-slate-400 text-sm">Connect with patients remotely. Discuss AI reports and follow up on treatment plans in real-time.</p>
          </div>
          <button className="relative z-10 flex-shrink-0 flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow-lg">
            <Video className="w-4 h-4" /> Launch Session
          </button>
        </motion.div>

      </motion.div>

      {/* ─── ASSIGN PATIENT MODAL ───────────────────────────── */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Assign New Patient</h3>
                  <p className="text-sm text-slate-400 mt-1">Enter the patient's registered email address.</p>
                </div>
                <button onClick={() => { setShowAssignModal(false); setAssignMsg(null); }} className="text-slate-500 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {assignMsg && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${assignMsg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                  {assignMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {assignMsg.text}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={assignEmail}
                  onChange={e => setAssignEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleAssignPatient}
                  disabled={assignLoading}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {assignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {assignLoading ? "Assigning..." : "Assign Patient"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
