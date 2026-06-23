import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { colors, spacing } from "@/lib/theme";

export default function PaymentSuccessScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.circle}>
          <Ionicons name="checkmark" size={48} color={colors.primary} />
        </View>
        <Text style={s.title}>You're In!</Text>
        <Text style={s.sub}>
          Your 7-day free trial has started. Welcome to Team L-Evate — find your community, then become fitter than you thought possible.
        </Text>
        <View style={s.detailsCard}>
          {[
            { icon: "gift-outline" as const,      text: "7 days free, no charge until day 8" },
            { icon: "people-outline" as const,     text: "Community access unlocked" },
            { icon: "barbell-outline" as const,    text: "Personalised training plan ready" },
            { icon: "notifications-outline" as const, text: "You can cancel anytime in settings" },
          ].map(item => (
            <View key={item.text} style={s.detailRow}>
              <View style={s.detailIcon}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
              </View>
              <Text style={s.detailText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Button
          label="Start Training"
          onPress={() => router.replace("/app/(tabs)/home")}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xxl },
  circle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryDim, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: "800", marginBottom: 10 },
  sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 28 },
  detailsCard: { width: "100%", backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 14, marginBottom: 28, borderWidth: 0.5, borderColor: colors.border },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryDim, alignItems: "center", justifyContent: "center" },
  detailText: { color: colors.textSecondary, fontSize: 13, flex: 1 },
});
