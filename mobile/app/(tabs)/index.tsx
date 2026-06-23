import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api, ScanHistoryItem } from "../../services/api";
import RiskBadge from "../../components/RiskBadge";

const CANCER_ICONS: Record<string, string> = {
  skin: "🔬", brain: "🧠", lung: "🫁", breast: "🎗️",
  prostate: "⚕️", colorectal: "🩺", ovarian: "⚕️", thyroid: "🔬",
  pancreatic: "🩻", liver: "🩻", leukemia: "🔬", lymphoma: "🩻",
  cervical: "🔬", esophageal: "🩺", stomach: "🩺", melanoma: "🔬",
};

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScans = async () => {
    try {
      const data = await api.get<ScanHistoryItem[]>("/scans/history");
      setScans(data);
    } catch {
      /* silent fail */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchScans(); }, []);

  const totalScans = scans.length;
  const lowRisk = scans.filter((s) => s.prediction?.prediction_label === "Low Risk").length;
  const medRisk = scans.filter((s) => s.prediction?.prediction_label === "Medium Risk").length;
  const highRisk = scans.filter((s) => s.prediction?.prediction_label === "High Risk").length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchScans(); }} />}
    >
      {/* Header */}
      <View style={styles.hero}>
        <View>
          <Text style={styles.greeting}>👋 Hello, {user?.full_name?.split(" ")[0] || "User"}!</Text>
          <Text style={styles.heroSub}>Your CancerGuard AI Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsRow}>
        <View style={[styles.metric, { backgroundColor: "#1e293b" }]}>
          <Text style={styles.metricValue}>{totalScans}</Text>
          <Text style={styles.metricLabel}>Total Scans</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: "#064e3b" }]}>
          <Text style={styles.metricValue}>{lowRisk}</Text>
          <Text style={styles.metricLabel}>Low Risk</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: "#78350f" }]}>
          <Text style={styles.metricValue}>{medRisk}</Text>
          <Text style={styles.metricLabel}>Medium Risk</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: "#7f1d1d" }]}>
          <Text style={styles.metricValue}>{highRisk}</Text>
          <Text style={styles.metricLabel}>High Risk</Text>
        </View>
      </View>

      {/* Upload CTA */}
      <TouchableOpacity style={styles.ctaCard} onPress={() => router.push("/(tabs)/upload")}>
        <Text style={styles.ctaIcon}>📤</Text>
        <View>
          <Text style={styles.ctaTitle}>Upload New Scan</Text>
          <Text style={styles.ctaSub}>Get an instant AI risk assessment</Text>
        </View>
        <Text style={styles.ctaArrow}>→</Text>
      </TouchableOpacity>

      {/* Recent Scans */}
      <Text style={styles.sectionTitle}>Recent Scans</Text>

      {loading ? (
        <ActivityIndicator color="#0d9488" style={{ marginTop: 40 }} />
      ) : scans.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🩻</Text>
          <Text style={styles.emptyText}>No scans yet. Upload your first scan!</Text>
        </View>
      ) : (
        scans.slice(0, 5).map((scan) => (
          <TouchableOpacity
            key={scan.id}
            style={styles.scanCard}
            onPress={() => scan.prediction && router.push(`/result/${scan.prediction.id}`)}
          >
            <Text style={styles.scanIcon}>
              {CANCER_ICONS[scan.cancer_type?.toLowerCase()] || "🔬"}
            </Text>
            <View style={styles.scanInfo}>
              <Text style={styles.scanType}>{scan.cancer_type?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
              <Text style={styles.scanDate}>{new Date(scan.created_at).toLocaleDateString()}</Text>
            </View>
            {scan.prediction && <RiskBadge risk={scan.prediction.prediction_label} size="sm" />}
          </TouchableOpacity>
        ))
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ AI risk screening only — not a medical diagnosis</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  hero: { backgroundColor: "#134e4a", padding: 24, paddingTop: 56, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 12, color: "#5eead4", marginTop: 2 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  metricsRow: { flexDirection: "row", gap: 8, padding: 16 },
  metric: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  metricValue: { fontSize: 22, fontWeight: "800", color: "#fff" },
  metricLabel: { fontSize: 10, color: "#94a3b8", marginTop: 4, textAlign: "center" },
  ctaCard: { marginHorizontal: 16, backgroundColor: "#0d9488", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 },
  ctaIcon: { fontSize: 28 },
  ctaTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ctaSub: { color: "#ccfbf1", fontSize: 12, marginTop: 2 },
  ctaArrow: { color: "#fff", fontSize: 20, marginLeft: "auto" },
  sectionTitle: { color: "#e2e8f0", fontWeight: "700", fontSize: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  scanCard: { backgroundColor: "#1e293b", marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  scanIcon: { fontSize: 28 },
  scanInfo: { flex: 1 },
  scanType: { color: "#e2e8f0", fontWeight: "600", fontSize: 14 },
  scanDate: { color: "#64748b", fontSize: 12, marginTop: 2 },
  empty: { alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#64748b", fontSize: 14 },
  disclaimer: { margin: 16, backgroundColor: "#1e293b", borderRadius: 10, padding: 12 },
  disclaimerText: { color: "#64748b", fontSize: 11, textAlign: "center" },
});
