"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface AnalyticsData {
  total_scans: number;
  cancer_type_counts: Record<string, number>;
  risk_distribution: {
    "Low Risk": number;
    "Medium Risk": number;
    "High Risk": number;
  };
  average_confidence: number;
}

const COLORS = {
  "Low Risk": "#10b981",
  "Medium Risk": "#f59e0b",
  "High Risk": "#ef4444",
};

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  isLoading = false,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      // Prepare cancer type chart data
      const cancerData = Object.entries(data.cancer_type_counts).map(
        ([type, count]) => ({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          scans: count,
        })
      );
      setChartData(cancerData);

      // Prepare risk distribution data
      const riskDistData = Object.entries(data.risk_distribution).map(
        ([risk, count]) => ({
          name: risk,
          value: count,
        })
      );
      setRiskData(riskDistData);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        ))}
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, unit = "" }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-600 font-semibold text-sm">{label}</p>
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <p className="text-3xl font-bold text-gray-800">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </motion.div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <StatCard
          icon={CheckCircle}
          label="Total Scans"
          value={data?.total_scans || 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Confidence"
          value={(data?.average_confidence || 0).toFixed(1)}
          unit="%"
        />
        <StatCard
          icon={AlertCircle}
          label="Medium Risk Cases"
          value={data?.risk_distribution["Medium Risk"] || 0}
        />
        <StatCard
          icon={Clock}
          label="High Risk Cases"
          value={data?.risk_distribution["High Risk"] || 0}
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cancer Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Scans by Cancer Type
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Risk Distribution
          </h3>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Risk Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-red-50 p-6 rounded-xl border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(COLORS).map(([risk, color]) => (
            <div key={risk} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="font-semibold text-gray-800">{risk}</p>
                <p className="text-sm text-gray-600">
                  {data?.risk_distribution[risk as keyof typeof data.risk_distribution] || 0} cases
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
