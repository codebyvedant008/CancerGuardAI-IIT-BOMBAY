"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Network, Server, Key, ShieldCheck, Activity, Copy, CheckCircle2 } from "lucide-react";

export default function EnterpriseIntegrations() {
  const [copied, setCopied] = useState(false);
  const mockApiKey = "cg_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3";

  const copyKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
            <Network className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Enterprise Integrations</h1>
            <p className="text-slate-400">Configure FHIR/HL7 endpoints and manage API keys for hospital integration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* FHIR Configuration */}
            <motion.div className="glass-panel p-6 rounded-3xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-teal-400" />
                  <h2 className="text-xl font-bold text-white">FHIR Endpoints</h2>
                </div>
                <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-full border border-teal-500/20">Active</span>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white">Patient Resources (Mock)</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">GET /api/v1/integration/fhir/Patient</span>
                  </div>
                  <p className="text-xs text-slate-400">Fetch patient demographic and consent records using HL7 FHIR standards.</p>
                </div>

                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white">Diagnostic Reports (Mock)</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">GET /api/v1/integration/fhir/DiagnosticReport</span>
                  </div>
                  <p className="text-xs text-slate-400">Retrieve AI cancer risk assessments and clinical reviews as FHIR DiagnosticReports.</p>
                </div>
              </div>
            </motion.div>

            {/* HL7 Webhooks */}
            <motion.div className="glass-panel p-6 rounded-3xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-bold text-white">HL7 v2 Webhooks (Coming Soon)</h2>
                </div>
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full">Planned</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">Support for legacy ORU^R01 and ADT^A01 messages to push data directly into hospital EHR systems.</p>
              <div className="flex gap-2">
                <input disabled type="text" placeholder="https://ehr.hospital.com/webhook/hl7" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-500 cursor-not-allowed" />
                <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl font-bold cursor-not-allowed text-sm">Save</button>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div className="glass-panel p-6 rounded-3xl" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">API Keys</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">Use this key to authenticate external HIS/RIS integrations.</p>
              
              <div className="relative">
                <input 
                  type="password" 
                  value={mockApiKey} 
                  readOnly 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button onClick={copyKey} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div className="glass-panel p-6 rounded-3xl" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-bold text-white">Compliance Status</h2>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">HIPAA Compliant</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">Data Encryption At Rest</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">E2E TLS 1.3 Transit</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-400">Audit Trails Enabled</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
