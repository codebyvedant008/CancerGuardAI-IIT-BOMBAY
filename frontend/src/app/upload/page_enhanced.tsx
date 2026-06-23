"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ScanUploadComponent } from "@/components/ScanUploadComponent";
import {
  Beaker,
  Brain,
  Heart,
  Lung,
  Flame,
  Zap,
  Target,
  BarChart3,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface CancerType {
  code: string;
  name: string;
  description: string;
  imaging: string;
  specificity: number;
}

const iconMap: Record<string, any> = {
  skin: Beaker,
  brain: Brain,
  breast: Heart,
  lung: Lung,
  colorectal: Flame,
  prostate: Zap,
  thyroid: Target,
  ovarian: BarChart3,
};

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cancerTypes, setCancerTypes] = useState<CancerType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingResult, setUploadingResult] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchCancerTypes();
  }, [user, router]);

  const fetchCancerTypes = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/predict/cancer-types", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCancerTypes(data.cancer_types);
        if (data.cancer_types.length > 0) {
          setSelectedType(data.cancer_types[0].code);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cancer types:", error);
      toast.error("Failed to load cancer types");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (result: any) => {
    setUploadingResult(result);
    toast.success("Scan analyzed successfully!");
    setTimeout(() => {
      router.push(`/result/${result.scan_id}`);
    }, 2000);
  };

  const selectedCancerInfo = cancerTypes.find((ct) => ct.code === selectedType);
  const IconComponent = selectedCancerInfo
    ? iconMap[selectedType] || Beaker
    : Beaker;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8"
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            🏥 Medical Image Analysis
          </h1>
          <p className="text-blue-100">
            Upload your medical scan for AI-powered risk assessment
          </p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Cancer Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Select Cancer Type
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {cancerTypes.map((cancer, index) => {
                  const CIcon = iconMap[cancer.code] || Beaker;
                  const isSelected = selectedType === cancer.code;

                  return (
                    <motion.button
                      key={cancer.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedType(cancer.code)}
                      className={`p-5 rounded-xl transition-all duration-300 border-2 text-left group ${
                        isSelected
                          ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                          }`}
                        >
                          <CIcon className="w-6 h-6" />
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </motion.div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800">{cancer.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {cancer.imaging}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {(cancer.specificity * 100).toFixed(0)}% specific
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Selected Cancer Info */}
        <AnimatePresence mode="wait">
          {selectedCancerInfo && (
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedCancerInfo.name}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {selectedCancerInfo.description}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Imaging Type:
                      </span>
                      <span className="text-sm text-gray-600">
                        {selectedCancerInfo.imaging}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Specificity:
                      </span>
                      <span className="text-sm text-gray-600">
                        {(selectedCancerInfo.specificity * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Important Guidelines</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Ensure the image is clear and properly oriented
                      </li>
                      <li>
                        All findings must be verified by a qualified healthcare
                        professional
                      </li>
                      <li>
                        This is a screening tool only, not a diagnostic tool
                      </li>
                      <li>
                        Patient privacy is protected with end-to-end encryption
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Component */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Upload Your Image
            </h2>
            <ScanUploadComponent
              cancerType={selectedType}
              onUploadSuccess={handleUploadSuccess}
            />
          </motion.div>
        )}

        {/* Upload Result */}
        <AnimatePresence>
          {uploadingResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Scan Processed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your medical image has been analyzed successfully. Redirecting
                  to results...
                </p>
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
