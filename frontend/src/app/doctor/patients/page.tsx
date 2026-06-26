"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, User, Activity, Clock, FileText, ChevronRight, Filter, AlertCircle, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock data until backend assignment is fully complete
const MOCK_PATIENTS = [
  { id: "P-104", name: "James Bond", age: 45, email: "jbond@mi6.gov", scans: 3, risk: "Low Risk", last_active: "2h ago" },
  { id: "P-092", name: "Sarah Connor", age: 32, email: "sarah@skynet.net", scans: 1, risk: "High Risk", last_active: "5h ago" },
  { id: "P-118", name: "John Wick", age: 52, email: "john@continental.com", scans: 2, risk: "Medium Risk", last_active: "1d ago" },
  { id: "P-142", name: "Bruce Wayne", age: 35, email: "bruce@wayneent.com", scans: 5, risk: "Low Risk", last_active: "3d ago" },
];

export default function DoctorPatientsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filtered = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Patient Registry</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your assigned patients, review clinical history, and track AI scan diagnostics.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 min-w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Patient Identity</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Clinical Status</th>
                  <th className="px-6 py-4">Total Scans</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-white">{p.name}</span>
                          <span className="block text-[10px] font-semibold text-slate-500">ID: {p.id} • {p.age} yrs</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{p.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        p.risk === 'High Risk' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        p.risk === 'Medium Risk' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {p.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold text-sm">
                        <Activity className="w-4 h-4 text-teal-400" />
                        {p.scans} Scans
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/doctor`} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-teal-500/20 group-hover:text-teal-400 border border-slate-700 group-hover:border-teal-500/30 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No patients match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
      </div>
    </DashboardLayout>
  );
}
