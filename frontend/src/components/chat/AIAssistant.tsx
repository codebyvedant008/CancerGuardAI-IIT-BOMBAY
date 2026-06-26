"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, X, Send, Bot, User, Loader2, Sparkles, AlertCircle,
  FileText, Activity, ShieldCheck, Heart, Moon
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  { icon: FileText, text: "Explain my latest report" },
  { icon: ShieldCheck, text: "What does my risk score mean?" },
  { icon: Heart, text: "Give me lifestyle advice" },
  { icon: Activity, text: "Should I see a doctor?" },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("cg_ai_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        // ignore
      }
    } else {
      setMessages([
        {
          id: "sys_1",
          role: "assistant",
          content: "Hello! I am your CancerGuard AI Medical Assistant powered by Google Gemini. How can I help you understand your health data today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("cg_ai_history", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error("Failed to reach AI");

      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to the medical AI engine right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl group"
            style={{ background: "linear-gradient(135deg,#14B8A6,#06B6D4)" }}
          >
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#14B8A6" }} />
            <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(15,23,42,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 p-[1px]">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Google Gemini</h3>
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Medical Assistant
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-200/80 leading-relaxed">
                AI responses are for educational purposes and do not substitute professional medical advice.
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                      isUser 
                        ? "bg-teal-500 text-slate-900 rounded-tr-sm" 
                        : "bg-slate-800 border border-white/5 text-slate-200 rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-[9px] mt-1.5 font-semibold ${isUser ? "text-teal-900/60" : "text-slate-500"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (if no history or just started) */}
            {messages.length <= 2 && (
              <div className="p-3 grid grid-cols-2 gap-2 border-t border-white/5 bg-slate-900/30">
                {PRESET_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.text)}
                    className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-800 transition text-left group"
                  >
                    <q.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400" />
                    <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white leading-tight">{q.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-slate-900/80">
              <form
                onSubmit={e => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1 pl-3 focus-within:border-teal-500/50 focus-within:ring-1 focus-within:ring-teal-500/50 transition-all"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask Gemini about your health..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
