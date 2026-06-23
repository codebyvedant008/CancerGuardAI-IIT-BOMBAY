import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: logout, style: "destructive" }
    ]);
  };

  const initial = user?.full_name?.charAt(0).toUpperCase() || "U";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.is_admin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>🛡️ Admin</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <Text style={styles.sectionLabel}>Account Details</Text>
      <View style={styles.infoCard}>
        <Row label="Full Name" value={user?.full_name || "—"} />
        <Row label="Email" value={user?.email || "—"} />
        <Row label="Age" value={user?.age ? String(user.age) : "—"} />
        <Row label="Gender" value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "—"} />
        <Row label="Account Type" value={user?.is_admin ? "Administrator" : "Patient"} />
        <Row label="Member Since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} last />
      </View>

      {/* App Info */}
      <Text style={styles.sectionLabel}>About</Text>
      <View style={styles.infoCard}>
        <Row label="App" value="CancerGuard AI" />
        <Row label="Version" value="2.0.0" />
        <Row label="Modules" value="16 Cancer Types" />
        <Row label="Backend" value="FastAPI + SQLite" last />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        ⚠️ CancerGuard AI provides risk screening only.{"\n"}Not a substitute for professional medical diagnosis.
      </Text>
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: { padding: 20, paddingTop: 56, paddingBottom: 60 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  name: { fontSize: 22, fontWeight: "800", color: "#fff" },
  email: { fontSize: 13, color: "#64748b", marginTop: 4 },
  adminBadge: { marginTop: 8, backgroundColor: "#1e3a5f", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  adminBadgeText: { color: "#60a5fa", fontWeight: "700", fontSize: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
  infoCard: { backgroundColor: "#1e293b", borderRadius: 14, marginBottom: 20, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: "#334155" },
  rowLabel: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  rowValue: { color: "#e2e8f0", fontSize: 14, fontWeight: "500", flexShrink: 1, textAlign: "right" },
  logoutBtn: { backgroundColor: "#7f1d1d", borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 24 },
  logoutText: { color: "#fca5a5", fontWeight: "700", fontSize: 16 },
  disclaimer: { color: "#475569", fontSize: 11, textAlign: "center", lineHeight: 18 },
});
