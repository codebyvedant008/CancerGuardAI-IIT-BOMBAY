"use client";

// @ts-nocheck
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Check, X, AlertCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface ScanUploadProps {
  onUploadSuccess?: (data: any) => void;
  cancerType: string;
  isLoading?: boolean;
}

export const ScanUploadComponent: React.FC<ScanUploadProps> = ({
  onUploadSuccess,
  cancerType,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      processFile(droppedFile);
    }
  };

  const validateFile = (f: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(f.type)) {
      toast.error("Only JPG, JPEG, and PNG files are supported");
      return false;
    }
    if (f.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return false;
    }
    return true;
  };

  const processFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      processFile(f);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `/api/v1/predict/${cancerType}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      toast.success("Scan processed successfully!");
      onUploadSuccess?.(data);
      setFile(null);
      setPreview("");
    } catch (error) {
      toast.error("Failed to upload scan");
      console.error(error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-blue-400/40 dark:border-teal-500/30 rounded-2xl p-8 glass-panel hover:border-blue-500 dark:hover:border-teal-400 hover:shadow-blue-500/20 dark:hover:shadow-teal-500/20 transition-all duration-500 cursor-pointer group overflow-hidden"
      >
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 dark:via-teal-500/10 to-blue-500/0 rounded-2xl"
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative z-10 text-center">
          {!preview ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-teal-400 drop-shadow-md" />
            </motion.div>
          ) : (
            <motion.img
              src={preview}
              alt="Preview"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-32 h-32 mx-auto mb-4 rounded-lg object-cover shadow-lg"
            />
          )}

          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
            {preview ? "Image Selected" : "Upload Medical Image"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {preview
              ? file?.name
              : "Drag & drop your image or click to browse"}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!uploading && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-teal-600 dark:to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-teal-500/25 transition-all"
            >
              {preview ? "Change Image" : "Select File"}
            </motion.button>
          )}

          {preview && !uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex gap-3 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpload}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Process & Analyze
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFile(null);
                  setPreview("");
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-slate-600 to-slate-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-slate-500/25 transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Clear
              </motion.button>
            </motion.div>
          )}

          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <Loader className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600 dark:text-teal-400" />
              <p className="text-blue-600 dark:text-teal-400 font-semibold">
                Processing your scan...
              </p>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-teal-400 h-2 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 glass-panel rounded-xl border-l-4 border-l-blue-500 dark:border-l-teal-500"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This AI system provides risk assessment only and is not a
                substitute for professional medical diagnosis. Always consult
                with a qualified healthcare professional.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
