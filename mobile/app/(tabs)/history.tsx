import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { api, ScanHistoryItem } from "../../services/api";
import RiskBadge from "../../components/RiskBadge";

const CANCER_ICONS: Record<string, string> = {
  skin: "🔬", brain: "🧠", lung: "🫁", breast: "🎗️",
  prostate: "⚕️", colorectal: "🩺", ovarian: "⚕️", thyroid: "🔬",
  pancreatic: "🩻", liver: "🩻", leukemia: "🔬", lymphoma: "🩻",
  cervical: "🔬", esophageal: "🩺", stomach: "🩺", melanoma: "🔬",
};

export default function HistoryScreen() {
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

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item.prediction && router.push(`/result/${item.prediction.id}`)}
    >
      <Text style={styles.cardIcon}>
        {CANCER_ICONS[item.cancer_type?.toLowerCase()] || "🔬"}
      </Text>
      <View style={styles.cardInfo}>
        <Text style={styles.cardType}>
          {item.cancer_type?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
        {item.prediction && (
          <Text style={styles.confidence}>Confidence: {item.prediction.confidence}%</Text>
        )}
      </View>
      <View style={styles.badgeCol}>
        {item.prediction
          ? <RiskBadge risk={item.prediction.prediction_label} size="sm" />
          : <Text style={styles.pendingText}>Pending</Text>
        }
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>📋 Scan History</Text>

      {loading ? (
        <ActivityIndicator color="#0d9488" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchScans(); }} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🩻</Text>
              <Text style={styles.emptyText}>No scans found.</Text>
              <Text style={styles.emptySub}>Upload your first scan to see results here.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingTop: 56 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#fff", paddingHorizontal: 16, marginBottom: 8 },
  card: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: { fontSize: 30 },
  cardInfo: { flex: 1 },
  cardType: { color: "#e2e8f0", fontWeight: "700", fontSize: 15 },
  cardDate: { color: "#64748b", fontSize: 12, marginTop: 2 },
  confidence: { color: "#0d9488", fontSize: 12, marginTop: 4, fontWeight: "600" },
  badgeCol: { alignItems: "flex-end", gap: 6 },
  arrow: { color: "#475569", fontSize: 20 },
  pendingText: { color: "#64748b", fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { color: "#e2e8f0", fontSize: 18, fontWeight: "700" },
  emptySub: { color: "#64748b", fontSize: 13, marginTop: 8 },
});
