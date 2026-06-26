"use client";

import React from "react";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel rounded-3xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-500" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-3">You are offline</h1>
        <p className="text-slate-400 text-sm mb-8">
          CancerGuard AI requires an active internet connection to process medical scans and sync data. 
          Your session will resume automatically when connectivity is restored.
        </p>

        <button 
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Retry Connection
        </button>
      </motion.div>
    </div>
  );
}
