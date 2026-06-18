"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  User, 
  Settings as SettingsIcon, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Activity,
  UserCheck,
  Wind
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function DashboardLayout({ children, requireAdmin = false }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (requireAdmin && !user.is_admin) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, requireAdmin]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading CancerGuard AI...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Scan", href: "/upload", icon: Upload },
    { name: "Prediction History", href: "/history", icon: History },
    { name: "Profile Details", href: "/profile", icon: User },
  ];

  if (user.is_admin) {
    menuItems.push({ name: "Admin Portal", href: "/admin", icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-700 md:hidden focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-teal-600" />
            <span className="font-bold text-lg text-slate-800 tracking-tight">CancerGuard <span className="text-teal-600">AI</span></span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700">{user.full_name}</span>
            <span className="text-xs text-slate-500">{user.is_admin ? "Administrator" : "Patient"}</span>
          </div>
          
          <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm border border-teal-200">
            {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 text-sm font-medium transition px-2 py-1.5 rounded-lg hover:bg-rose-50"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-16 left-0 z-35 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] flex flex-col justify-between
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="p-4 flex-1 flex flex-col space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                    ${isActive 
                      ? "bg-teal-50 text-teal-700 font-semibold shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <UserCheck className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block font-semibold text-slate-700 truncate">{user.email}</span>
                <span className="block truncate">{user.is_admin ? "Admin Portal Access" : "Secure Patient Account"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {/* Strict Medical Disclaimer at the top of content when on prediction paths */}
          {(pathname.startsWith("/result") || pathname.startsWith("/upload")) && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-sm text-amber-800 text-sm flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Medical Disclaimer:</span> This AI system provides risk assessment only and is not a substitute for professional medical diagnosis.
              </div>
            </div>
          )}

          {/* Render children */}
          <div className="flex-1">
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} CancerGuard AI Platform. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-600">Terms of Service</Link>
              <Link href="#" className="hover:text-slate-600 font-medium text-amber-600 hover:text-amber-700">Medical Disclaimer</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
