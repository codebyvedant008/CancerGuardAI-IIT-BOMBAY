import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        age: age ? parseInt(age) : undefined,
        gender,
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.brand}>CancerGuard AI</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>Register for free screening access</Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="Jane Doe" placeholderTextColor="#94a3b8" value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} placeholder="name@example.com" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password *</Text>
          <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} placeholder="e.g. 28" placeholderTextColor="#94a3b8" value={age} onChangeText={setAge} keyboardType="numeric" />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {["male", "female", "other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 52, marginBottom: 8 },
  brand: { fontSize: 28, fontWeight: "800", color: "#fff" },
  tagline: { fontSize: 13, color: "#64748b", marginTop: 4 },
  card: { backgroundColor: "#1e293b", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#334155" },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, marginBottom: 16 },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  genderBtn: { flex: 1, borderWidth: 1, borderColor: "#334155", borderRadius: 10, padding: 10, alignItems: "center" },
  genderBtnActive: { backgroundColor: "#0d9488", borderColor: "#0d9488" },
  genderText: { color: "#64748b", fontWeight: "600" },
  genderTextActive: { color: "#fff" },
  btn: { backgroundColor: "#0d9488", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkRow: { alignItems: "center", marginTop: 16 },
  linkText: { color: "#64748b", fontSize: 13 },
  link: { color: "#2dd4bf", fontWeight: "600" },
});
