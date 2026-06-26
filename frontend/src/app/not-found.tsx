"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-8 rounded-[2rem] border border-slate-800 space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-t border-rose-500 animate-spin opacity-50" />
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        
        <div>
          <h1 className="text-4xl font-black text-white mb-2">404</h1>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Page Not Found</p>
        </div>
        
        <p className="text-slate-300 text-sm">
          The requested system module could not be located. It may have been moved, deleted, or you might not have clearance to access it.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 px-6 rounded-xl transition"
        >
          <Home className="w-4 h-4" />
          Return to Base Station
        </Link>
      </motion.div>
    </div>
  );
}
