"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Activity, 
  Upload, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Brain, 
  Fingerprint, 
  Wind, 
  Heart,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  const faqs = [
    {
      q: "Is CancerGuard AI a diagnostic system?",
      a: "No, CancerGuard AI is not a medical diagnosis system. It is an AI-assisted cancer risk assessment platform. It provides screening indicators and risk assessments to aid clinical understanding, but it does not replace a professional clinical diagnosis by an oncologist or dermatologist."
    },
    {
      q: "Which cancer modules are currently supported?",
      a: "We support initial risk assessment for sixteen main categories including Skin Cancer, Brain Tumor, Lung Cancer, Breast Cancer, and twelve others covering a wide range of oncology."
    },
    {
      q: "How accurate is the risk assessment?",
      a: "Our platform uses state-of-the-art neural network architectures. The model outputs a confidence percentage representing its alignment with reference cases. However, all outputs are for risk assessment purposes only, and you should always verify findings with a medical professional."
    },
    {
      q: "Are my uploaded medical scans secure?",
      a: "Yes. All uploads are encrypted in transit and at rest. We adhere to strict data access control mechanisms. Scan data is strictly linked to your account and is never shared with third parties without your explicit permission."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-teal-600" />
          <span className="font-bold text-xl text-slate-800 tracking-tight">CancerGuard <span className="text-teal-600">AI</span></span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-teal-600 transition">Modules</Link>
          <Link href="#how-it-works" className="hover:text-teal-600 transition">How it Works</Link>
          <Link href="#faq" className="hover:text-teal-600 transition">FAQ</Link>
          <Link href="#contact" className="hover:text-teal-600 transition">Contact</Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <Link 
              href={user.is_admin ? "/admin" : "/dashboard"}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all hover:shadow-lg"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-teal-600 text-sm font-semibold transition">
                Sign In
              </Link>
              <Link 
                href="/register"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white py-20 lg:py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-full text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-ping" />
              <span>Next-Gen Risk Assessment</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              AI-Assisted Cancer <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Risk Screening</span>
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Upload medical scans and receive immediate, AI-assisted risk indicators. Empowering patients and assisting clinicians with secure, private, and rapid screening.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link 
                href={user ? "/upload" : "/register"}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-8 py-4 rounded-full text-base font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-400/35 transition flex items-center justify-center space-x-2 group"
              >
                <span>Upload Scan</span>
                <Upload className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
              </Link>
              
              <Link 
                href={user ? "/dashboard" : "/register"}
                className="bg-white/10 hover:bg-white/15 border border-white/10 px-8 py-4 rounded-full text-base font-bold transition flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="pt-6 border-t border-slate-800 text-xs text-amber-500 font-semibold max-w-lg leading-snug">
              ⚠️ Disclaimer: This AI system provides risk assessment only and is not a substitute for professional medical diagnosis.
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center relative">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 absolute blur-3xl opacity-20 -z-10 animate-pulse" />
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Live Risk Monitor</span>
                </div>
                <Activity className="h-5 w-5 text-teal-400" />
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-medium">Scan ID #829</span>
                      <span className="block text-sm font-semibold">Brain MRI</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full">Low Risk</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-medium">Scan ID #828</span>
                      <span className="block text-sm font-semibold">Skin Lesion</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full">Medium Risk</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <Wind className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-medium">Scan ID #827</span>
                      <span className="block text-sm font-semibold">Chest X-Ray</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-full">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Available Assessments</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Support For Multiple Scan Types</p>
          <p className="text-slate-500">Our platform is designed as an extensible multi-model architecture. Select from our sixteen screening modules.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-teal-500/30 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Fingerprint className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Skin Cancer</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Analyze dermoscopic skin lesion images to screen for melanocytic nevus, melanoma, or basal cell carcinoma.
              </p>
            </div>
            <Link href={user ? "/upload" : "/register"} className="mt-6 text-teal-600 text-xs font-bold inline-flex items-center space-x-1 hover:underline">
              <span>Scan Lesion</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-teal-500/30 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Brain Tumor</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Scan magnetic resonance imaging (MRI) slices to identify anomalies associated with glioma or meningioma.
              </p>
            </div>
            <Link href={user ? "/upload" : "/register"} className="mt-6 text-teal-600 text-xs font-bold inline-flex items-center space-x-1 hover:underline">
              <span>Scan MRI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-teal-500/30 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wind className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Lung Cancer</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Screen pulmonary chest X-rays to assess the presence of pulmonary nodules, masses, or pleural effusion.
              </p>
            </div>
            <Link href={user ? "/upload" : "/register"} className="mt-6 text-teal-600 text-xs font-bold inline-flex items-center space-x-1 hover:underline">
              <span>Scan X-Ray</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-teal-500/30 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Breast Cancer</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Assess mammogram projections for structural distortions, microcalcifications, or suspicious dense masses.
              </p>
            </div>
            <Link href={user ? "/upload" : "/register"} className="mt-6 text-teal-600 text-xs font-bold inline-flex items-center space-x-1 hover:underline">
              <span>Scan Mammogram</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-teal-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest font-mono">Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How CancerGuard Works</p>
            <p className="text-slate-500">Get secure, instant risk indications in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-200 -translate-y-1/2 hidden md:block z-0" />
            
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative z-10 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                1
              </div>
              <Upload className="h-10 w-10 text-teal-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Upload Scan Image</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Select your cancer screening type and securely upload a JPG, JPEG, or PNG medical scan image.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative z-10 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                2
              </div>
              <Activity className="h-10 w-10 text-teal-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">AI Risk Evaluation</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our scalable AI architecture evaluates the image and returns risk indicators, confidence rates, and health advice.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative z-10 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                3
              </div>
              <FileText className="h-10 w-10 text-teal-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Download PDF Report</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Review your risk profile and immediately generate a downloadable clinical PDF report to share with your physician.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Common Questions</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-slate-50 transition"
                >
                  <span className="font-bold text-slate-800 text-sm sm:text-base">{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-teal-600 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-500 text-sm sm:text-base border-t border-slate-100 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-slate-950 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12">
          
          {/* Info Card */}
          <div className="md:col-span-5 space-y-8">
            <div>
              <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Get in Touch</h2>
              <p className="text-3xl font-extrabold tracking-tight">Contact Our Team</p>
              <p className="text-slate-400 mt-2">Have inquiries about model integrations or enterprise clinical licensing?</p>
            </div>
            
            <div className="space-y-4 text-slate-300">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-teal-400" />
                <span className="text-sm">support@cancerguard.ai</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-teal-400" />
                <span className="text-sm">+1 (555) 492-3829</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-teal-400" />
                <span className="text-sm">100 Biotech Way, San Francisco, CA</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-teal-400" />
                <span className="text-sm">Mon - Fri, 9:00 AM - 6:00 PM PST</span>
              </div>
            </div>
            
            <div className="p-4 bg-teal-900/20 border border-teal-500/10 rounded-2xl text-xs text-slate-400 leading-normal">
              Please note: Our support channels are for technical and general enquiries only. We do not provide clinical counseling or review scans manually.
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-7 bg-white/5 border border-white/5 backdrop-blur-md rounded-3xl p-8 relative">
            <h3 className="font-bold text-xl mb-6">Send Us a Message</h3>
            
            {submitted ? (
              <div className="bg-teal-500/20 border border-teal-500/30 text-teal-300 p-6 rounded-2xl flex items-center space-x-3">
                <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                <div>
                  <span className="font-semibold block">Thank You!</span>
                  <span className="text-xs text-slate-300">Your message was sent successfully. We will get back to you soon.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Jane Doe" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 text-white placeholder-slate-600 transition" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Your Email</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="jane@example.com" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 text-white placeholder-slate-600 transition" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can we help you?" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 text-white placeholder-slate-600 transition resize-none" 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg transition"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CancerGuard AI. Dedicated to automated risk screening aid.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms of Service</Link>
            <Link href="#" className="text-amber-500 hover:underline font-medium">Medical Disclaimer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
