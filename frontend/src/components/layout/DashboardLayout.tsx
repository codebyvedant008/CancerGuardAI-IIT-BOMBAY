"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Upload, History, User, ShieldAlert, LogOut,
  Menu, X, Activity, UserCheck, Dna, ChevronRight, Zap, Shield,
  Users, FileSignature
} from "lucide-react";
import AIAssistant from "@/components/chat/AIAssistant";
import NotificationCenter from "@/components/layout/NotificationCenter";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function DashboardLayout({ children, requireAdmin = false }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading) {
      if (!user)                          router.push("/login");
      else if (requireAdmin && !user.is_admin) router.push("/dashboard");
    }
  }, [user, loading, router, requireAdmin]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
        <div className="flex flex-col items-center gap-5">
          {/* Orbital loader */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-teal-500/10" />
            <div className="absolute inset-0 rounded-full border-t-2 border-teal-400 animate-spin" style={{ borderRadius: "50%" }} />
            <div className="absolute inset-2 rounded-full border border-teal-500/10" />
            <div className="absolute inset-2 rounded-full border-t border-cyan-400 animate-spin" style={{ animationDuration: "0.7s", animationDirection: "reverse" }} />
            <Dna className="absolute inset-0 m-auto w-5 h-5 text-teal-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">CancerGuard AI</p>
            <p className="text-slate-500 text-xs mt-1 tracking-wider uppercase">Initializing systems...</p>
          </div>
        </div>
      </div>
    );
  }

  let menuItems: any[] = [];

  if (user.is_admin || user.role === "admin") {
    menuItems = [
      { name: t.adminPortal, href: "/admin", icon: ShieldAlert },
      { name: t.profile,     href: "/profile",    icon: User },
    ];
  } else if (user.role === "doctor") {
    menuItems = [
      { name: t.doctorPortal, href: "/doctor", icon: Activity },
      { name: t.myPatients, href: "/doctor/patients", icon: Users },
      { name: t.profile,     href: "/profile",    icon: User },
    ];
  } else {
    // Regular Patient
    menuItems = [
      { name: t.dashboard,   href: "/dashboard", icon: LayoutDashboard },
      { name: t.uploadScan,  href: "/upload",     icon: Upload          },
      { name: t.history,     href: "/history",    icon: History         },
      { name: t.profile,     href: "/profile",    icon: User            },
    ];
  }

  const initials = user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0F172A" }}>

      {/* ══════════════════ TOP BAR ══════════════════ */}
      <header
        className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6"
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04)"
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white md:hidden transition-colors p-1"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5" tabIndex={0}>
            {/* Logo mark */}
            <div className="relative">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#14B8A6,#06B6D4)",
                  boxShadow: "0 4px 20px rgba(20,184,166,0.35)"
                }}
              >
                <Activity className="w-4 h-4 text-slate-900" />
              </div>
              {/* Online dot */}
              <div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ backgroundColor: "#22C55E", borderColor: "#0F172A" }}
              />
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              CancerGuard <span style={{ color: "#14B8A6" }}>AI</span>
            </span>
          </Link>

          {/* Status pill — desktop only */}
          <div
            className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.18)",
              color: "#4ADE80"
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            16 Models Active
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          
          <LanguageSwitcher />
          
          <NotificationCenter />
          
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-white leading-tight">{user.full_name}</span>
            <span className="text-[11px] font-semibold" style={{ color: "#14B8A6" }}>
              {(user.role === "admin" || user.is_admin) ? "Administrator" : (user.role === "doctor" ? "Doctor" : "Patient")}
            </span>
          </div>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-slate-900 text-sm"
            style={{
              background: "linear-gradient(135deg,#14B8A6,#06B6D4)",
              boxShadow: "0 4px 16px rgba(20,184,166,0.25)"
            }}
          >
            {initials}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 text-sm font-medium px-3 py-1.5 rounded-xl transition-all hover:bg-rose-500/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </header>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="flex-1 flex relative">

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            />
          )}
        </AnimatePresence>

        {/* ══════════════════ SIDEBAR ══════════════════ */}
        <aside
          className={`
            fixed inset-y-16 left-0 z-35 w-60 flex flex-col justify-between
            transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{
            background: "rgba(15,23,42,0.96)",
            backdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "4px 0 32px rgba(0,0,0,0.4)"
          }}
        >
          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">
              Navigation
            </p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
                    transition-all duration-200 group
                    ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200"}
                  `}
                  style={isActive
                    ? {
                        background: "rgba(20,184,166,0.12)",
                        border: "1px solid rgba(20,184,166,0.22)",
                        boxShadow: "0 0 20px rgba(20,184,166,0.08)"
                      }
                    : { border: "1px solid transparent" }
                  }
                >
                  {/* Active indicator pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ backgroundColor: "#14B8A6" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`w-4.5 h-4.5 flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-teal-400"
                        : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-teal-500" />
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="mx-3 my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />
          </nav>

          {/* Action Button - Only for Patients */}
          {(user.role === "patient" || !user.role) && (
            <nav className="p-4 border-t border-slate-800">
              <Link 
                href="/upload"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl font-bold transition-all text-sm group"
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
              >
                <Zap className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                {t.quickScanUpload}
              </Link>
            </nav>
          )}

          {/* Bottom user info card */}
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-900 font-black text-xs"
                style={{ background: "linear-gradient(135deg,#14B8A6,#06B6D4)" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <UserCheck className="w-4 h-4 flex-shrink-0 text-teal-500" />
            </div>
          </div>
        </aside>

        {/* ══════════════════ MAIN CONTENT ══════════════════ */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">

          {/* Medical disclaimer for prediction paths */}
          <AnimatePresence>
            {(pathname.startsWith("/result") || pathname.startsWith("/upload")) && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#FDE68A"
                }}
              >
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold">{t.medicalDisclaimerTitle}</strong>
                  {t.medicalDisclaimerText}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">{children}</div>

          {/* Footer */}
          <footer
            className="mt-16 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#475569" }}
          >
            <p>© {new Date().getFullYear()} CancerGuard AI Platform · {t.allRightsReserved}</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-slate-400 transition-colors">{t.privacy}</Link>
              <Link href="#" className="hover:text-slate-400 transition-colors">{t.terms}</Link>
              <Link href="#" className="hover:text-amber-400 transition-colors font-semibold" style={{ color: "#D97706" }}>
                {t.medicalDisclaimerTitle.replace(':', '')}
              </Link>
            </div>
          </footer>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
