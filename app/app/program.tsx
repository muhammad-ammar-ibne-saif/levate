import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/auth";
import api from "@/lib/api";

// ── Full program — all possible sessions ─────────────────────────────────────
const ALL_WORKOUTS = [
  // Priority 1 — always included regardless of days
  {
    id: "w1",
    priority: 1,
    tag: "Lift · Mon",
    name: "Lower Power + Carries",
    meta: "~45 min · 5+1 sets",
    type: "lift" as const,
    goal: ["race", "hybrid", "strength", "general"],
  },
  {
    id: "w2",
    priority: 1,
    tag: "Run · Tue",
    name: "Threshold Builder Run",
    meta: "~35 min · Zone 3–4",
    type: "run" as const,
    goal: ["race", "hybrid", "general"],
  },
  {
    id: "w3",
    priority: 1,
    tag: "Lift · Wed",
    name: "Upper Hypertrophy",
    meta: "~50 min · 4 sets",
    type: "lift" as const,
    goal: ["strength", "hybrid", "general"],
  },
  // Priority 2 — included from 4 days
  {
    id: "w4",
    priority: 2,
    tag: "Run · Thu",
    name: "Easy Recovery Run",
    meta: "~25 min · Zone 1–2",
    type: "run" as const,
    goal: ["race", "hybrid", "general"],
  },
  {
    id: "w5",
    priority: 2,
    tag: "Lift · Thu",
    name: "Lower Strength + Deadlift",
    meta: "~50 min · 5 sets",
    type: "lift" as const,
    goal: ["strength", "hybrid"],
  },
  // Priority 3 — included from 5 days
  {
    id: "w6",
    priority: 3,
    tag: "Race · Sat",
    name: "Race Prep + Adaptive",
    meta: "~30 min · Full effort",
    type: "race" as const,
    goal: ["race", "hybrid"],
  },
  {
    id: "w7",
    priority: 3,
    tag: "Lift · Sat",
    name: "Full Body Power",
    meta: "~55 min · 4 sets",
    type: "lift" as const,
    goal: ["strength", "general"],
  },
  // Priority 4 — only on 6 days
  {
    id: "w8",
    priority: 4,
    tag: "Run · Sun",
    name: "Long Slow Distance Run",
    meta: "~60 min · Zone 2",
    type: "run" as const,
    goal: ["race"],
  },
  {
    id: "w9",
    priority: 4,
    tag: "Lift · Sun",
    name: "Accessory + Core",
    meta: "~35 min · 3 sets",
    type: "lift" as const,
    goal: ["strength", "hybrid", "general"],
  },
];

const GOAL_LABELS: Record<string, string> = {
  race: "🏁 Race Performance",
  strength: "🏋️ Strength Gain",
  hybrid: "🚀 Hybrid Fitness",
  general: "❤️ General Fitness",
};

const TYPE_COLORS = {
  lift: "#7ED957",
  run: "#5B9CF6",
  race: "#F97316",
};

// Filter workouts based on days and goals
function filterWorkouts(days: number, goals: string[]) {
  const priorityMap: Record<number, number> = { 3: 1, 4: 2, 5: 3, 6: 4 };
  const maxPriority = priorityMap[days] || 1;

  return ALL_WORKOUTS.filter((w) => {
    // Must be within priority limit for selected days
    if (w.priority > maxPriority) return false;
    // Must match at least one selected goal
    if (goals.length > 0 && !w.goal.some((g) => goals.includes(g)))
      return false;
    return true;
  });
}

export default function ProgramScreen() {
  const { user, updateProfile } = useAuthStore();

  const [selectedDays, setSelectedDays] = useState(user?.daysPerWeek || 4);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    user?.goals || ["hybrid"]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredWorkouts = filterWorkouts(selectedDays, selectedGoals);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
        // Must have at least one goal
        if (prev.length === 1) return prev;
        return prev.filter((g) => g !== goal);
      }
      return [...prev, goal];
    });
    setSaved(false);
  };

  const handleDaySelect = (days: number) => {
    setSelectedDays(days);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        goals: selectedGoals,
        daysPerWeek: selectedDays,
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert("Error", "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>The Program</Text>
        </View>

        <View style={s.content}>
          {/* Tag + title */}
          <View style={s.tag}>
            <Text style={s.tagText}>Hybrid Foundation</Text>
          </View>
          <Text style={s.title}>8-Week Hybrid Foundation</Text>
          <Text style={s.subtitle}>Build → Deload → Intensify → Peak</Text>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { val: "8", label: "Weeks" },
              { val: `${selectedDays}`, label: "Days/wk" },
              { val: `${filteredWorkouts.length}`, label: "Sessions" },
            ].map((st, i) => (
              <View key={st.label} style={[s.statCard, i < 2 && s.statBorder]}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* Goals selector */}
          <Text style={s.selectorLabel}>Your goals</Text>
          <Text style={s.selectorSub}>
            Select all that apply — your plan adapts accordingly.
          </Text>
          <View style={s.goalsGrid}>
            {Object.entries(GOAL_LABELS).map(([key, label]) => {
              const active = selectedGoals.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => toggleGoal(key)}
                  style={[s.goalPill, active && s.goalPillActive]}
                >
                  <Text
                    style={[s.goalPillText, active && s.goalPillTextActive]}
                  >
                    {label}
                  </Text>
                  {active && <Text style={s.goalCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Days selector */}
          <Text style={s.selectorLabel}>Days per week</Text>
          <Text style={s.selectorSub}>
            Your plan shows only the sessions that fit your schedule.
          </Text>
          <View style={s.daysRow}>
            {[3, 4, 5, 6].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => handleDaySelect(d)}
                style={[s.dayPill, selectedDays === d && s.dayPillActive]}
              >
                <Text
                  style={[
                    s.dayPillText,
                    selectedDays === d && s.dayPillTextActive,
                  ]}
                >
                  {d}
                </Text>
                <Text
                  style={[
                    s.dayPillSub,
                    selectedDays === d && s.dayPillSubActive,
                  ]}
                >
                  days
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={s.saveBtnText}>
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save preferences"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider} />

          {/* Week heading */}
          <Text style={s.weekLabel}>
            Week {user?.currentWeek || 1} — Your Plan
          </Text>
          <Text style={s.weekSub}>
            {filteredWorkouts.length} sessions · {selectedDays} days/week ·{" "}
            {selectedGoals.map((g) => GOAL_LABELS[g]?.split(" ")[1]).join(", ")}
          </Text>

          {/* Filtered workout list */}
          {filteredWorkouts.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>
                No sessions match your current selection. Try adjusting your
                goals or days.
              </Text>
            </View>
          ) : (
            <View style={s.workoutList}>
              {filteredWorkouts.map((w, i) => (
                <TouchableOpacity
                  key={w.id}
                  activeOpacity={0.75}
                  style={s.workoutRow}
                  onPress={() =>
                    router.push({
                      pathname: "/app/workout/active",
                      params: { name: w.name, type: w.type },
                    })
                  }
                >
                  <View
                    style={[
                      s.numCircle,
                      { backgroundColor: `${TYPE_COLORS[w.type]}18` },
                    ]}
                  >
                    <Text style={[s.numText, { color: TYPE_COLORS[w.type] }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.wTag, { color: TYPE_COLORS[w.type] }]}>
                      {w.tag}
                    </Text>
                    <Text style={s.wName}>{w.name}</Text>
                    <Text style={s.wMeta}>{w.meta}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      s.startBtn,
                      { borderColor: TYPE_COLORS[w.type] + "40" },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/app/workout/active",
                        params: { name: w.name, type: w.type },
                      })
                    }
                  >
                    <Text
                      style={[s.startBtnText, { color: TYPE_COLORS[w.type] }]}
                    >
                      Start
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Start today button */}
          {filteredWorkouts.length > 0 && (
            <Button
              label="Start Today's Workout"
              onPress={() =>
                router.push({
                  pathname: "/app/workout/active",
                  params: {
                    name: filteredWorkouts[0].name,
                    type: filteredWorkouts[0].type,
                  },
                })
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 20 },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(126,217,87,0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
    marginTop: 8,
  },
  tagText: {
    color: "#7ED957",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#9A9A9A", fontSize: 13, marginBottom: 18 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 24,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statBorder: {
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  statVal: { color: "#fff", fontSize: 22, fontWeight: "800" },
  statLabel: {
    color: "#5A5A5A",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  selectorLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  selectorSub: { color: "#5A5A5A", fontSize: 12, marginBottom: 12 },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  goalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E1E1E",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  goalPillActive: {
    backgroundColor: "rgba(126,217,87,0.1)",
    borderColor: "#7ED957",
  },
  goalPillText: { color: "#9A9A9A", fontSize: 13, fontWeight: "500" },
  goalPillTextActive: { color: "#7ED957", fontWeight: "600" },
  goalCheck: { color: "#7ED957", fontSize: 12, fontWeight: "800" },
  daysRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  dayPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  dayPillActive: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
  dayPillText: { color: "#9A9A9A", fontWeight: "800", fontSize: 18 },
  dayPillTextActive: { color: "#0D0D0D" },
  dayPillSub: { color: "#5A5A5A", fontSize: 10, marginTop: 2 },
  dayPillSubActive: { color: "rgba(0,0,0,0.5)" },
  saveBtn: {
    backgroundColor: "#1E1E1E",
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(126,217,87,0.3)",
    marginBottom: 24,
  },
  saveBtnText: { color: "#7ED957", fontWeight: "600", fontSize: 14 },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  weekLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  weekSub: { color: "#5A5A5A", fontSize: 12, marginBottom: 16 },
  workoutList: { gap: 10, marginBottom: 20 },
  workoutRow: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  numCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numText: { fontWeight: "800", fontSize: 15 },
  wTag: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  wName: { color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  wMeta: { color: "#5A5A5A", fontSize: 12 },
  startBtn: {
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0.5,
  },
  startBtnText: { fontSize: 12, fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    color: "#5A5A5A",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
