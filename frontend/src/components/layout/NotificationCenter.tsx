"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, X, FileText, CheckCircle, AlertCircle, Clock, 
  Activity, Heart, User, ShieldAlert, Check
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "upload" | "ready" | "alert" | "reminder" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const MOCK_NOTIFS: Notification[] = [
  { id: "1", type: "alert", title: "High Risk Flag", message: "A recent scan (Skin) was flagged as High Risk. Please consult your physician.", timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false, link: "/history" },
  { id: "2", type: "ready", title: "Report Ready", message: "Your diagnostic PDF for Lung Scan is ready for download.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false, link: "/history" },
  { id: "3", type: "upload", title: "Scan Uploaded", message: "Breast MRI successfully uploaded to CancerGuard secure cloud.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
  { id: "4", type: "reminder", title: "Annual Screening", message: "It has been 11 months since your last checkup. Book an appointment.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), read: true },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFS);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case "ready": return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "upload": return <Activity className="w-5 h-5 text-cyan-400" />;
      case "reminder": return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "alert": return "bg-rose-500/10 border-rose-500/20";
      case "ready": return "bg-emerald-500/10 border-emerald-500/20";
      case "upload": return "bg-cyan-500/10 border-cyan-500/20";
      case "reminder": return "bg-amber-500/10 border-amber-500/20";
      default: return "bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{
              background: "rgba(15,23,42,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-teal-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition flex items-center gap-1">
                  <Check className="w-3 h-3"/> Mark read
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300 transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        if (n.link) {
                          setIsOpen(false);
                          router.push(n.link);
                        }
                      }}
                      className={`p-4 transition ${n.read ? 'opacity-60' : 'bg-slate-800/40'} ${n.link ? 'cursor-pointer hover:bg-slate-800' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0 ${getBg(n.type)}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</h4>
                            <span className="text-[10px] text-slate-500 font-semibold">{format(n.timestamp, "h:mm a")}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 text-center border-t border-white/10 bg-slate-900/50">
              <button className="text-xs font-bold text-slate-500 hover:text-white transition">
                View All History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
