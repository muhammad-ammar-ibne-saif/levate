import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "../../lib/theme";

// ── Onboarding question flow — runs once after signup ────────────────────────
// Collects: goal, fitness level, availability (days/week)
// This is what personalises the program shown afterwards.

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface Option {
  id: string;
  title: string;
  sub: string;
  icon: IconName;
}

const GOAL_OPTIONS: Option[] = [
  {
    id: "race",
    title: "Race Performance",
    sub: "Train for your next 5K, 10K or marathon",
    icon: "flag-outline",
  },
  {
    id: "strength",
    title: "Strength Gain",
    sub: "Build muscle and increase lifting power",
    icon: "barbell-outline",
  },
  {
    id: "hybrid",
    title: "Hybrid Fitness",
    sub: "Balance running and lifting performance",
    icon: "rocket-outline",
  },
  {
    id: "general",
    title: "General Fitness",
    sub: "Stay active and build healthy habits",
    icon: "heart-outline",
  },
];

const LEVEL_OPTIONS: Option[] = [
  {
    id: "beginner",
    title: "Beginner",
    sub: "New to structured training",
    icon: "leaf-outline",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    sub: "Training consistently for 6+ months",
    icon: "trending-up-outline",
  },
  {
    id: "advanced",
    title: "Advanced",
    sub: "Experienced with hybrid or race training",
    icon: "trophy-outline",
  },
];

const DAYS_OPTIONS = [3, 4, 5, 6];

type Step = "goal" | "level" | "days";

export default function PersonalizeScreen() {
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const stepIndex = { goal: 0, level: 1, days: 2 }[step];
  const totalSteps = 3;

  const handleNext = async () => {
    if (step === "goal") {
      if (!goal) return;
      setStep("level");
      return;
    }
    if (step === "level") {
      if (!level) return;
      setStep("days");
      return;
    }
    // Final step — save everything and go to main app
    if (!days) return;
    setSaving(true);
    try {
      await updateProfile({
        goals: [goal!],
        fitnessLevel: level,
        daysPerWeek: days,
        onboardingComplete: true,
      } as any);
      router.replace("/app/(tabs)/home");
    } catch {
      Alert.alert(
        "Error",
        "Failed to save your preferences. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === "level") setStep("goal");
    else if (step === "days") setStep("level");
    else router.back();
  };

  const canContinue =
    (step === "goal" && !!goal) ||
    (step === "level" && !!level) ||
    (step === "days" && !!days);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header with progress */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.progressTrack}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[s.progressSeg, i <= stepIndex && s.progressSegActive]}
            />
          ))}
        </View>
      </View>

      <View style={s.content}>
        {/* ── Step 1: Goal ── */}
        {step === "goal" && (
          <>
            <Text style={s.stepLabel}>Step 1 of 3</Text>
            <Text style={s.title}>What's your goal?</Text>
            <Text style={s.sub}>
              We find out your goal, availability and fitness level so you're
              clear on how to get fitter — no guesswork.
            </Text>
            <View style={s.optionList}>
              {GOAL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  selected={goal === opt.id}
                  onPress={() => setGoal(opt.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* ── Step 2: Fitness level ── */}
        {step === "level" && (
          <>
            <Text style={s.stepLabel}>Step 2 of 3</Text>
            <Text style={s.title}>Where are you starting from?</Text>
            <Text style={s.sub}>
              This helps us calibrate your first few weeks correctly.
            </Text>
            <View style={s.optionList}>
              {LEVEL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  selected={level === opt.id}
                  onPress={() => setLevel(opt.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* ── Step 3: Days per week ── */}
        {step === "days" && (
          <>
            <Text style={s.stepLabel}>Step 3 of 3</Text>
            <Text style={s.title}>How many days can you train?</Text>
            <Text style={s.sub}>
              Your plan will only include sessions that fit your schedule.
            </Text>
            <View style={s.daysGrid}>
              {DAYS_OPTIONS.map((d) => {
                const on = days === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDays(d)}
                    style={[s.dayCard, on && s.dayCardActive]}
                  >
                    <Text style={[s.dayNum, on && s.dayNumActive]}>{d}</Text>
                    <Text style={[s.dayLabel, on && s.dayLabelActive]}>
                      days / week
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      {/* Footer button */}
      <View style={s.footer}>
        <Button
          label={
            step === "days"
              ? saving
                ? "Setting up…"
                : "Start Training"
              : "Continue"
          }
          onPress={handleNext}
          loading={saving}
          disabled={!canContinue}
        />
      </View>
    </SafeAreaView>
  );
}

function OptionCard({
  option,
  selected,
  onPress,
}: {
  option: Option;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.optionCard, selected && s.optionCardActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[s.optionIcon, selected && s.optionIconActive]}>
        <Ionicons
          name={option.icon}
          size={22}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.optionTitle}>{option.title}</Text>
        <Text style={s.optionSub}>{option.sub}</Text>
      </View>
      <View style={[s.radio, selected && s.radioActive]}>
        {selected && (
          <Ionicons name="checkmark" size={13} color={colors.textOnPrimary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  progressTrack: { flex: 1, flexDirection: "row", gap: 6 },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
  },
  progressSegActive: { backgroundColor: colors.primary },

  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  stepLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    lineHeight: 32,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  optionList: { gap: spacing.md },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconActive: { backgroundColor: "rgba(122,61,240,0.15)" },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  optionSub: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary },

  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  dayCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  dayNum: { color: colors.textPrimary, fontSize: 32, fontWeight: "800" },
  dayNumActive: { color: colors.primary },
  dayLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  dayLabelActive: { color: colors.primary },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});
