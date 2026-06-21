import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ALL_WORKOUTS: {
  id: string;
  priority: number;
  tag: string;
  name: string;
  meta: string;
  type: "lift" | "run" | "race";
  goal: string[];
}[] = [
  {
    id: "w1",
    priority: 1,
    tag: "Lift · Mon",
    name: "Lower Power + Carries",
    meta: "~45 min · 5+1 sets",
    type: "lift",
    goal: ["race", "hybrid", "strength", "general"],
  },
  {
    id: "w2",
    priority: 1,
    tag: "Run · Tue",
    name: "Threshold Builder Run",
    meta: "~35 min · Zone 3–4",
    type: "run",
    goal: ["race", "hybrid", "general"],
  },
  {
    id: "w3",
    priority: 1,
    tag: "Lift · Wed",
    name: "Upper Hypertrophy",
    meta: "~50 min · 4 sets",
    type: "lift",
    goal: ["strength", "hybrid", "general"],
  },
  {
    id: "w4",
    priority: 2,
    tag: "Run · Thu",
    name: "Easy Recovery Run",
    meta: "~25 min · Zone 1–2",
    type: "run",
    goal: ["race", "hybrid", "general"],
  },
  {
    id: "w5",
    priority: 2,
    tag: "Lift · Thu",
    name: "Lower Strength + Deadlift",
    meta: "~50 min · 5 sets",
    type: "lift",
    goal: ["strength", "hybrid"],
  },
  {
    id: "w6",
    priority: 3,
    tag: "Race · Sat",
    name: "Race Prep + Adaptive",
    meta: "~30 min · Full effort",
    type: "race",
    goal: ["race", "hybrid"],
  },
  {
    id: "w7",
    priority: 3,
    tag: "Lift · Sat",
    name: "Full Body Power",
    meta: "~55 min · 4 sets",
    type: "lift",
    goal: ["strength", "general"],
  },
  {
    id: "w8",
    priority: 4,
    tag: "Run · Sun",
    name: "Long Slow Distance Run",
    meta: "~60 min · Zone 2",
    type: "run",
    goal: ["race"],
  },
  {
    id: "w9",
    priority: 4,
    tag: "Lift · Sun",
    name: "Accessory + Core",
    meta: "~35 min · 3 sets",
    type: "lift",
    goal: ["strength", "hybrid", "general"],
  },
];

const GOAL_LABELS: Record<string, { label: string; icon: IconName }> = {
  race: { label: "Race Performance", icon: "flag-outline" },
  strength: { label: "Strength Gain", icon: "barbell-outline" },
  hybrid: { label: "Hybrid Fitness", icon: "rocket-outline" },
  general: { label: "General Fitness", icon: "heart-outline" },
};

const TYPE_ICON: Record<string, IconName> = {
  lift: "barbell-outline",
  run: "footsteps-outline",
  race: "flag-outline",
};

function filterWorkouts(days: number, goals: string[]) {
  const priorityMap: Record<number, number> = { 3: 1, 4: 2, 5: 3, 6: 4 };
  const maxPriority = priorityMap[days] || 1;
  return ALL_WORKOUTS.filter((w) => {
    if (w.priority > maxPriority) return false;
    if (goals.length > 0 && !w.goal.some((g) => goals.includes(g)))
      return false;
    return true;
  });
}

export default function ProgramScreen() {
  const { user, updateProfile } = useAuthStore();
  const [selectedDays, setSelectedDays] = useState(
    (user as any)?.daysPerWeek || 4
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    user?.goals || ["hybrid"]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredWorkouts = filterWorkouts(selectedDays, selectedGoals);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
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
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={s.headerTitle}>The Program</Text>
        </View>

        <View style={s.content}>
          <View style={s.tag}>
            <Text style={s.tagText}>Hybrid Foundation</Text>
          </View>
          <Text style={s.title}>8-Week Hybrid Foundation</Text>
          <Text style={s.subtitle}>Build → Deload → Intensify → Peak</Text>

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

          <Text style={s.selectorLabel}>Your goals</Text>
          <Text style={s.selectorSub}>
            Select all that apply — your plan adapts accordingly.
          </Text>
          <View style={s.goalsGrid}>
            {Object.entries(GOAL_LABELS).map(([key, g]) => {
              const active = selectedGoals.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => toggleGoal(key)}
                  style={[s.goalPill, active && s.goalPillActive]}
                >
                  <Ionicons
                    name={g.icon}
                    size={15}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[s.goalPillText, active && s.goalPillTextActive]}
                  >
                    {g.label}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

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

          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={s.saveBtnText}>
              {saving ? "Saving…" : saved ? "Saved" : "Save preferences"}
            </Text>
          </TouchableOpacity>

          <View style={s.divider} />

          <Text style={s.weekLabel}>
            Week {(user as any)?.currentWeek || 1} — Your Plan
          </Text>
          <Text style={s.weekSub}>
            {filteredWorkouts.length} sessions · {selectedDays} days/week ·{" "}
            {selectedGoals.map((g) => GOAL_LABELS[g]?.label).join(", ")}
          </Text>

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
                  <View style={s.numCircle}>
                    <Ionicons
                      name={TYPE_ICON[w.type]}
                      size={17}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.wTag}>{w.tag}</Text>
                    <Text style={s.wName}>{w.name}</Text>
                    <Text style={s.wMeta}>{w.meta}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.startBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/app/workout/active",
                        params: { name: w.name, type: w.type },
                      })
                    }
                  >
                    <Text style={s.startBtnText}>Start</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
  safe: { flex: 1, backgroundColor: colors.background },
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
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 20 },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryDim,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
    marginTop: 8,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 18 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statBorder: { borderRightWidth: 0.5, borderRightColor: colors.border },
  statVal: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  selectorLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  selectorSub: { color: colors.textTertiary, fontSize: 12, marginBottom: 12 },
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
    backgroundColor: colors.surface,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  goalPillActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  goalPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  goalPillTextActive: { color: colors.primary, fontWeight: "600" },
  daysRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  dayPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  dayPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayPillText: { color: colors.textSecondary, fontWeight: "800", fontSize: 18 },
  dayPillTextActive: { color: colors.textOnPrimary },
  dayPillSub: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },
  dayPillSubActive: { color: "rgba(255,255,255,0.7)" },
  saveBtn: {
    backgroundColor: colors.surface,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    marginBottom: 24,
  },
  saveBtnText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
  divider: { height: 0.5, backgroundColor: colors.border, marginBottom: 20 },
  weekLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  weekSub: { color: colors.textTertiary, fontSize: 12, marginBottom: 16 },
  workoutList: { gap: 10, marginBottom: 20 },
  workoutRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  numCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  wTag: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
    color: colors.primary,
  },
  wName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  wMeta: { color: colors.textTertiary, fontSize: 12 },
  startBtn: {
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
  },
  startBtnText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
