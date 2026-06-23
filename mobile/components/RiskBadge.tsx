import React from "react";
import { View, Text, StyleSheet } from "react-native";

type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

interface RiskBadgeProps {
  risk: RiskLevel | string;
  size?: "sm" | "md" | "lg";
}

const RISK_STYLES: Record<string, { bg: string; text: string; emoji: string }> = {
  "Low Risk": { bg: "#d1fae5", text: "#065f46", emoji: "✅" },
  "Medium Risk": { bg: "#fef3c7", text: "#92400e", emoji: "⚠️" },
  "High Risk": { bg: "#fee2e2", text: "#991b1b", emoji: "🚨" },
};

export default function RiskBadge({ risk, size = "md" }: RiskBadgeProps) {
  const style = RISK_STYLES[risk] || { bg: "#e2e8f0", text: "#475569", emoji: "❓" };
  const fontSize = size === "sm" ? 11 : size === "lg" ? 16 : 13;
  const padding = size === "sm" ? 4 : size === "lg" ? 10 : 6;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, paddingVertical: padding, paddingHorizontal: padding + 8 }]}>
      <Text style={[styles.text, { color: style.text, fontSize }]}>
        {style.emoji} {risk}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
  },
});
