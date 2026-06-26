"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { 
  FileText, Activity, ShieldAlert, CheckCircle2, XCircle, FileSignature, AlertCircle, Save
} from "lucide-react";
import { motion } from "framer-motion";

export default function ClinicalReviewWorkspace({ params }: { params: { scanId: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Mock data for the workspace
  const scanDetails = {
    id: params.scanId.toUpperCase(),
    patient_name: "Sarah Connor",
    patient_id: "P-092",
    date: "2024-05-12",
    prediction: "High Risk Melanoma",
    confidence: 94.2,
    image_url: "https://via.placeholder.com/600x400/1e293b/0ea5e9?text=Dermatology+Scan+Visualizer"
  };

  const [review, setReview] = useState({
    status: "", // approved, rejected, revision
    diagnosis: "",
    treatment_plan: "",
    notes: ""
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push("/doctor/patients");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <FileSignature className="w-5 h-5 text-teal-400" />
              </div>
              <h1 className="text-2xl font-black text-white">Clinical Review Workspace</h1>
            </div>
            <p className="text-sm text-slate-400">Scan ID: <span className="font-mono text-slate-300">{scanDetails.id}</span> • Patient: <span className="text-slate-300 font-bold">{scanDetails.patient_name}</span></p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving || !review.status}
            className={`btn-primary flex items-center gap-2 ${saving || !review.status ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving Record..." : "Finalize Clinical Report"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: SCAN & AI FINDINGS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-[2rem] overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Flagged</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={scanDetails.image_url} alt="Scan Preview" className="w-full aspect-square object-cover rounded-3xl border border-slate-800/50" />
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-rose-500/20">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Primary AI Finding</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-rose-500">{scanDetails.prediction}</span>
                <span className="text-2xl font-black text-white">{scanDetails.confidence}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${scanDetails.confidence}%` }} />
              </div>
            </div>
          </div>

          {/* RIGHT: CLINICAL INPUT FORM */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8">
              
              {/* 1. Decision */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs">1</span> 
                  Clinical Decision
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setReview({...review, status: "approved"})}
                    className={`p-4 rounded-2xl border text-left transition-all ${review.status === 'approved' ? 'bg-teal-500/10 border-teal-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                  >
                    <CheckCircle2 className={`w-6 h-6 mb-2 ${review.status === 'approved' ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className={`block font-bold ${review.status === 'approved' ? 'text-white' : 'text-slate-400'}`}>Concur with AI</span>
                    <span className="text-xs text-slate-500 mt-1 block">Approve automated findings</span>
                  </button>
                  
                  <button 
                    onClick={() => setReview({...review, status: "rejected"})}
                    className={`p-4 rounded-2xl border text-left transition-all ${review.status === 'rejected' ? 'bg-rose-500/10 border-rose-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                  >
                    <XCircle className={`w-6 h-6 mb-2 ${review.status === 'rejected' ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span className={`block font-bold ${review.status === 'rejected' ? 'text-white' : 'text-slate-400'}`}>Reject AI Finding</span>
                    <span className="text-xs text-slate-500 mt-1 block">Override with manual diagnosis</span>
                  </button>
                </div>
              </div>

              {/* 2. Diagnosis */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs">2</span> 
                  Final Diagnosis (ICD-10)
                </h2>
                <input 
                  type="text"
                  value={review.diagnosis}
                  onChange={e => setReview({...review, diagnosis: e.target.value})}
                  placeholder="e.g. C43.9 Malignant melanoma of skin"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* 3. Treatment Plan */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs">3</span> 
                  Treatment & Action Plan
                </h2>
                <textarea 
                  value={review.treatment_plan}
                  onChange={e => setReview({...review, treatment_plan: e.target.value})}
                  rows={4}
                  placeholder="Outline the clinical steps required (e.g. Biopsy needed, prescribe medication, schedule surgery...)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>
              
              {/* Note Alert */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Upon finalizing, this report will become part of the patient's permanent medical record and they will be notified immediately. Ensure all ICD-10 codes and treatment pathways follow hospital guidelines.
                </p>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
