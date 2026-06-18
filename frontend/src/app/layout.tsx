import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CancerGuard AI - AI-Assisted Cancer Risk Assessment",
  description: "A secure, modern, AI-assisted platform for screening and clinical risk assessment of skin, brain, lung, and breast cancer scans.",
  keywords: ["cancer detection", "AI risk assessment", "medical imaging", "skin cancer", "brain tumor", "lung cancer", "breast cancer"],
  authors: [{ name: "CancerGuard AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

