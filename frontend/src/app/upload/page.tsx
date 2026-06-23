"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, PredictionResult } from "@/services/api";
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Activity, 
  Fingerprint, 
  Brain, 
  Wind, 
  Heart,
  AlertCircle,
  CheckCircle2,
  Zap,
  Droplet,
  Crown,
  Shield,
  Flame,
  TrendingUp,
  AlertTriangle,
  Beaker
} from "lucide-react";

export default function UploadScanPage() {
  const [cancerType, setCancerType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const cancerOptions = [
    { id: "skin", name: "Skin Cancer", value: "skin", desc: "Dermoscopy & lesion scans", icon: Fingerprint },
    { id: "brain", name: "Brain Tumor", value: "brain", desc: "MRI slice scan imaging", icon: Brain },
    { id: "lung", name: "Lung Cancer", value: "lung", desc: "Chest radiograph X-rays", icon: Wind },
    { id: "breast", name: "Breast Cancer", value: "breast", desc: "Digital Mammograms", icon: Heart },
    { id: "colorectal", name: "Colorectal Cancer", value: "colorectal", desc: "Colonoscopy & endoscopy", icon: Flame },
    { id: "ovarian", name: "Ovarian Cancer", value: "ovarian", desc: "Ultrasound imaging", icon: Droplet },
    { id: "prostate", name: "Prostate Cancer", value: "prostate", desc: "MRI & biopsy imaging", icon: Shield },
    { id: "thyroid", name: "Thyroid Cancer", value: "thyroid", desc: "Ultrasound & CT scans", icon: Crown },
    { id: "pancreatic", name: "Pancreatic Cancer", value: "pancreatic", desc: "CT & MRI imaging", icon: Zap },
    { id: "liver", name: "Liver Cancer", value: "liver", desc: "Ultrasound & CT scans", icon: TrendingUp },
    { id: "leukemia", name: "Leukemia", value: "leukemia", desc: "Blood & bone marrow tests", icon: Beaker },
    { id: "lymphoma", name: "Lymphoma", value: "lymphoma", desc: "CT & PET imaging", icon: Activity },
    { id: "cervical", name: "Cervical Cancer", value: "cervical", desc: "Pap smear & colposcopy", icon: AlertTriangle },
    { id: "esophageal", name: "Esophageal Cancer", value: "esophageal", desc: "Endoscopy imaging", icon: Wind },
    { id: "stomach", name: "Stomach Cancer", value: "stomach", desc: "Endoscopy & CT scans", icon: Flame },
    { id: "melanoma", name: "Melanoma", value: "melanoma", desc: "Dermoscopy analysis", icon: Fingerprint },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Supported file formats are JPG, JPEG, and PNG only.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(droppedFile.type)) {
      setError("Supported file formats are JPG, JPEG, and PNG only.");
      return;
    }

    setFile(droppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancerType) {
      setError("Please select a cancer type module.");
      return;
    }
    if (!file) {
      setError("Please select or drop a scan image to analyze.");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(15);

    // Simulate progress bar movement
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        return prev + Math.floor(Math.random() * 15);
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call correct endpoint
      const result = await api.post<PredictionResult>(
        `/predict/${cancerType}`,
        formData
      );

      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      // Delay navigation briefly so user sees completion
      setTimeout(() => {
        router.push(`/result/${result.scan_id}`);
      }, 800);

    } catch (err: any) {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
      setError(err.message || "Failed to process scan image.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload Screening Scan</h1>
          <p className="text-slate-500 mt-1">Select the diagnosis type, upload your medical scan, and get instant risk insights.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Scan processed successfully! Generating risk details...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Select Cancer Type */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">1. Select Cancer Type</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cancerOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = cancerType === opt.value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCancerType(opt.value)}
                    disabled={uploading}
                    className={`
                      p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all focus:outline-none
                      ${isSelected 
                        ? "border-teal-500 bg-teal-50/30 ring-1 ring-teal-500" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"}
                    `}
                  >
                    <div className={`
                      h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{opt.name}</span>
                      <span className="block text-xs text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Upload Files */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">2. Medical Scan Image</h2>
            
            {!previewUrl ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/40 hover:bg-teal-50/5 transition group"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  disabled={uploading}
                />
                
                <Upload className="h-10 w-10 text-slate-400 group-hover:text-teal-600 mx-auto transition-colors mb-3" />
                <span className="block font-bold text-slate-700 text-sm">Drag and drop your scan here</span>
                <span className="block text-xs text-slate-400 mt-1">Supported formats: JPG, JPEG, PNG (max 10MB)</span>
                <button 
                  type="button" 
                  className="mt-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview Container */}
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[350px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={previewUrl} 
                    alt="Preview scan" 
                    className="max-h-[350px] object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-3 left-3 text-xs text-white bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    {file?.name} ({(Number(file?.size) / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </div>

                {!uploading && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove File</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Uploading progress bar */}
          {uploading && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
                  <span>AI Risk assessment in progress...</span>
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="block text-[11px] text-slate-400">Please do not refresh the page. Running neural model inference...</span>
            </div>
          )}

          {/* Submit */}
          {!uploading && (
            <button
              type="submit"
              className="w-full flex justify-center py-4 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Run AI Risk Assessment
            </button>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
