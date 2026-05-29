import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "@/store/workout";
import { Button } from "@/components/ui/Button";

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
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.checkCircle}>
            <Text style={s.checkMark}>✓</Text>
          </View>
          <Text style={s.title}>Workout Completed!</Text>
          <Text style={s.sub}>Nice work. Here's your session summary.</Text>
        </View>

        {/* Summary card */}
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

        {/* Actions */}
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
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
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
    backgroundColor: "rgba(126,217,87,0.1)",
    borderWidth: 2,
    borderColor: "rgba(126,217,87,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  checkMark: { color: "#7ED957", fontSize: 36, fontWeight: "800" },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#9A9A9A", fontSize: 14, textAlign: "center", lineHeight: 22 },
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  cardHeaderText: {
    color: "#5A5A5A",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: { flexDirection: "row" },
  statCell: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statBorder: {
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statUnit: { fontSize: 13, fontWeight: "500", color: "#5A5A5A" },
  statLabel: {
    color: "#5A5A5A",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actions: { paddingHorizontal: 20 },
});
