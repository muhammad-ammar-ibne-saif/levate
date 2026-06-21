import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutStore } from "@/store/workout";
import { Button } from "@/components/ui/Button";
import { colors, radius } from "@/lib/theme";

export default function WorkoutCompleteScreen() {
  const { sessions } = useWorkoutStore();
  const last = sessions[0];
  const duration = last ? Math.round(last.durationSeconds / 60) : 0;
  const sets = last?.setsCompleted ?? 0;
  const cals = last?.calories ?? 0;

  const stats = [
    { label: "Duration", value: `${duration}`, unit: "min" },
    { label: "Calories", value: `${cals}`, unit: "kcal" },
    { label: "Sets done", value: String(sets).padStart(2, "0"), unit: "" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.hero}>
          <View style={s.checkCircle}>
            <Ionicons name="checkmark" size={36} color={colors.primary} />
          </View>
          <Text style={s.title}>Workout Completed!</Text>
          <Text style={s.sub}>Nice work. Here's your session summary.</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderText}>Session Summary</Text>
          </View>
          <View style={s.statsRow}>
            {stats.map((st, i) => (
              <View
                key={st.label}
                style={[s.statCell, i < stats.length - 1 && s.statBorder]}
              >
                <Text style={s.statValue}>
                  {st.value}
                  {st.unit ? <Text style={s.statUnit}> {st.unit}</Text> : null}
                </Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.actions}>
          <Button
            label="Back to Home"
            onPress={() => router.replace("/app/(tabs)/home")}
          />
          <View style={{ height: 10 }} />
          <Button
            label="View Program"
            variant="ghost"
            onPress={() => router.push("/app/program")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  cardHeaderText: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: { flexDirection: "row" },
  statCell: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statBorder: { borderRightWidth: 0.5, borderRightColor: colors.border },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statUnit: { fontSize: 13, fontWeight: "500", color: colors.textTertiary },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actions: { paddingHorizontal: 20 },
});
