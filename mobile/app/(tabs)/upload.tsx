import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Alert, Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { api, PredictionResult } from "../../services/api";
import RiskBadge from "../../components/RiskBadge";
import { API_BASE_URL } from "../../services/api";

const CANCER_TYPES = [
  { label: "Skin Cancer", code: "skin", icon: "🔬" },
  { label: "Brain Tumor", code: "brain", icon: "🧠" },
  { label: "Lung Cancer", code: "lung", icon: "🫁" },
  { label: "Breast Cancer", code: "breast", icon: "🎗️" },
  { label: "Prostate Cancer", code: "prostate", icon: "⚕️" },
  { label: "Colorectal Cancer", code: "colorectal", icon: "🩺" },
  { label: "Ovarian Cancer", code: "ovarian", icon: "⚕️" },
  { label: "Thyroid Cancer", code: "thyroid", icon: "🔬" },
  { label: "Pancreatic Cancer", code: "pancreatic", icon: "🩻" },
  { label: "Liver Cancer", code: "liver", icon: "🩻" },
  { label: "Leukemia", code: "leukemia", icon: "🔬" },
  { label: "Lymphoma", code: "lymphoma", icon: "🩻" },
  { label: "Cervical Cancer", code: "cervical", icon: "🔬" },
  { label: "Esophageal Cancer", code: "esophageal", icon: "🩺" },
  { label: "Stomach Cancer", code: "stomach", icon: "🩺" },
  { label: "Melanoma", code: "melanoma", icon: "🔬" },
];

export default function UploadScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(CANCER_TYPES[0]);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) {
      setImage(res.assets[0]);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) {
      setImage(res.assets[0]);
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select or take a scan image first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = image.uri.split("/").pop() || "scan.jpg";
      const ext = filename.split(".").pop() || "jpg";
      formData.append("file", {
        uri: image.uri,
        name: filename,
        type: `image/${ext}`,
      } as any);

      const token = (await import("@react-native-async-storage/async-storage")).default.getItem("token");
      const tok = await token;

      const response = await fetch(`${API_BASE_URL}/predict/${selectedType.code}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Prediction failed");
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to analyze scan.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.pageTitle}>📤 Upload Scan</Text>

      {/* Cancer Type Selector */}
      <Text style={styles.label}>Select Cancer Module</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        {CANCER_TYPES.map((type) => (
          <TouchableOpacity
            key={type.code}
            style={[styles.typeChip, selectedType.code === type.code && styles.typeChipActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={styles.typeChipText}>{type.icon} {type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Picker */}
      {!image ? (
        <View style={styles.uploadArea}>
          <Text style={styles.uploadIcon}>🩻</Text>
          <Text style={styles.uploadText}>Select or capture a medical scan image</Text>
          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
              <Text style={styles.pickBtnText}>📁 Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
              <Text style={styles.pickBtnText}>📷 Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.changeBtn} onPress={reset}>
            <Text style={styles.changeBtnText}>✕ Remove Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Predict Button */}
      {image && !result && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={handlePredict} disabled={loading}>
          {loading
            ? <><ActivityIndicator color="#fff" /><Text style={styles.analyzeBtnText}> Analyzing...</Text></>
            : <Text style={styles.analyzeBtnText}>🔬 Run AI Risk Assessment</Text>
          }
        </TouchableOpacity>
      )}

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>✅ Assessment Complete</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Cancer Module</Text>
            <Text style={styles.resultValue}>{result.cancer_type?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Risk Classification</Text>
            <RiskBadge risk={result.prediction} size="md" />
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>AI Probability Score</Text>
            <Text style={styles.resultValue}>{result.confidence}%</Text>
          </View>

          <View style={styles.recBox}>
            <Text style={styles.recLabel}>💊 Recommendation</Text>
            <Text style={styles.recText}>{result.recommendation}</Text>
          </View>

          <TouchableOpacity style={styles.newScanBtn} onPress={reset}>
            <Text style={styles.newScanBtnText}>Upload New Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ This is an AI screening tool — not a medical diagnosis.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  typeScroll: { marginBottom: 20 },
  typeChip: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  typeChipActive: { backgroundColor: "#0d9488", borderColor: "#0d9488" },
  typeChipText: { color: "#e2e8f0", fontSize: 13, fontWeight: "600" },
  uploadArea: { backgroundColor: "#1e293b", borderRadius: 16, borderWidth: 2, borderColor: "#334155", borderStyle: "dashed", padding: 40, alignItems: "center", marginBottom: 16 },
  uploadIcon: { fontSize: 48, marginBottom: 12 },
  uploadText: { color: "#64748b", fontSize: 14, textAlign: "center", marginBottom: 20 },
  pickRow: { flexDirection: "row", gap: 12 },
  pickBtn: { backgroundColor: "#0d9488", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  pickBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  previewImage: { width: "100%", height: 220, borderRadius: 16, marginBottom: 10 },
  changeBtn: { alignItems: "center", paddingVertical: 8, marginBottom: 10 },
  changeBtnText: { color: "#f87171", fontWeight: "600" },
  analyzeBtn: { backgroundColor: "#0d9488", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resultCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 16 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#334155" },
  resultLabel: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  resultValue: { color: "#e2e8f0", fontWeight: "700", fontSize: 14 },
  recBox: { backgroundColor: "#0f172a", borderRadius: 12, padding: 14, marginTop: 16 },
  recLabel: { color: "#0d9488", fontWeight: "700", marginBottom: 6 },
  recText: { color: "#e2e8f0", fontSize: 13, lineHeight: 20 },
  newScanBtn: { marginTop: 16, borderWidth: 1, borderColor: "#0d9488", borderRadius: 12, padding: 14, alignItems: "center" },
  newScanBtnText: { color: "#0d9488", fontWeight: "700" },
  disclaimer: { backgroundColor: "#1e293b", borderRadius: 10, padding: 12 },
  disclaimerText: { color: "#64748b", fontSize: 11, textAlign: "center" },
});
