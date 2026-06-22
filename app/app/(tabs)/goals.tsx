import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const GOALS: { id: string; icon: IconName; title: string; sub: string }[] = [
  {
    id: "race",
    icon: "flag-outline",
    title: "Race Performance",
    sub: "Train for your next 5K, 10K or marathon",
  },
  {
    id: "strength",
    icon: "barbell-outline",
    title: "Strength Gain",
    sub: "Build muscle and increase lifting power",
  },
  {
    id: "hybrid",
    icon: "rocket-outline",
    title: "Hybrid Fitness",
    sub: "Balance running and lifting performance",
  },
  {
    id: "general",
    icon: "heart-outline",
    title: "General Fitness",
    sub: "Stay active and build healthy habits",
  },
];

export default function GoalsScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(user?.goals || ["hybrid"]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((g) => g !== id);
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    await updateProfile({ goals: selected } as any);
    Alert.alert(
      "Goals Saved",
      "Your training plan has been updated to match your goals.",
      [
        { text: "View Plan", onPress: () => router.push("/app/program") },
        { text: "OK" },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.header}>
          <Text style={s.heading}>Your Goals</Text>
          <Text style={s.sub}>
            Select your primary training goals. Your plan adapts to what matters
            most.
          </Text>
        </View>

        <View style={s.grid}>
          {GOALS.map((g) => {
            const on = selected.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => toggle(g.id)}
                activeOpacity={0.75}
                style={[s.card, on && s.cardActive]}
              >
                <View style={[s.iconWrap, on && s.iconWrapActive]}>
                  <Ionicons
                    name={g.icon}
                    size={22}
                    color={on ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={s.cardTitle}>{g.title}</Text>
                <Text style={s.cardSub}>{g.sub}</Text>
                <View style={[s.check, on && s.checkActive]}>
                  {on && (
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={colors.textOnPrimary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.summary}>
          <Text style={s.summaryText}>
            {selected.length === 1
              ? "1 goal selected — your plan is focused"
              : `${selected.length} goals selected — your plan is balanced`}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Button
            label={isLoading ? "Saving…" : "Save Goals"}
            onPress={handleSave}
            loading={isLoading}
          />
          <TouchableOpacity
            style={s.viewPlanBtn}
            onPress={() => router.push("/app/program")}
          >
            <Text style={s.viewPlanText}>View your adapted plan</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  heading: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    position: "relative",
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: "rgba(106,83,252,0.15)" },
  cardTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
  cardSub: { color: colors.textTertiary, fontSize: 12, lineHeight: 17 },
  check: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  summary: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.primaryDim,
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
  },
  summaryText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  viewPlanBtn: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  viewPlanText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
});
