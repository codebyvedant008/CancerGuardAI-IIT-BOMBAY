"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("System Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-panel p-8 rounded-[2rem] border border-rose-900/30 bg-rose-500/5 space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border border-rose-500 animate-ping opacity-20" />
          <AlertOctagon className="w-8 h-8 text-rose-500" />
        </div>
        
        <div>
          <h1 className="text-xl font-black text-white mb-2">Critical System Failure</h1>
          <p className="text-rose-400 text-[10px] font-semibold uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full inline-block">Error 500</p>
        </div>
        
        <p className="text-slate-300 text-sm">
          A rendering error occurred in the clinical application. The system has logged the failure and administrators have been notified.
        </p>
        
        <button 
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reboot Module
        </button>
      </motion.div>
    </div>
  );
}
