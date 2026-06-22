import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, Alert, Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";

// ── Total steps ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 12;

// ── Shared option card ────────────────────────────────────────────────────────
function OptionCard({
  title, sub, selected, onPress,
}: { title: string; sub?: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.option, selected && s.optionActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.optionTitle, selected && s.optionTitleActive]}>{title}</Text>
        {sub ? <Text style={[s.optionSub, selected && s.optionSubActive]}>{sub}</Text> : null}
      </View>
      {selected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
    </TouchableOpacity>
  );
}

// ── Chip selector ─────────────────────────────────────────────────────────────
function ChipRow({
  label, options, value, onChange,
}: { label: string; options: (string | number)[]; value: string | number; onChange: (v: string | number) => void }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.chipLabel}>{label}</Text>
      <View style={s.chipRow}>
        {options.map(o => (
          <TouchableOpacity
            key={String(o)}
            style={[s.chip, value === o && s.chipActive]}
            onPress={() => onChange(o)}
          >
            <Text style={[s.chipText, value === o && s.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function PersonalizeScreen() {
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // All answers
  const [name, setName]             = useState("");
  const [dob, setDob]               = useState("");
  const [mainGoal, setMainGoal]     = useState("");
  const [strengthExp, setStrengthExp] = useState("");
  const [condExp, setCondExp]       = useState("");
  const [runExp, setRunExp]         = useState("");
  const [weeklyKm, setWeeklyKm]     = useState(20);
  const [raceName, setRaceName]     = useState("");
  const [raceType, setRaceType]     = useState("");
  const [raceDate, setRaceDate]     = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [strengthSessions, setStrengthSessions] = useState(1);
  const [runSessions, setRunSessions]     = useState(1);
  const [condSessions, setCondSessions]   = useState(1);
  const [strengthFocus, setStrengthFocus] = useState("");
  const [sessionLength, setSessionLength] = useState(45);
  const [facility, setFacility]     = useState("");
  const [runGoal, setRunGoal]       = useState("");
  const [paceMin, setPaceMin]       = useState(21);
  const [paceSec, setPaceSec]       = useState(0);
  const [extra, setExtra]           = useState("");

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => {
    if (step === 1) router.back();
    else setStep(s => s - 1);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1: return name.trim().length > 0;
      case 2: return !!mainGoal;
      case 3: return !!strengthExp && !!condExp && !!runExp;
      case 4: return true; // skippable
      case 5: return sessionsPerWeek > 0 && (strengthSessions + runSessions + condSessions) === sessionsPerWeek;
      case 6: return !!strengthFocus;
      case 7: return !!sessionLength;
      case 8: return !!facility;
      case 9: return !!runGoal;
      case 10: return true;
      case 11: return true;
      case 12: return true;
      default: return true;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const goals = mainGoal === "Race & Competition" ? ["race"]
        : mainGoal === "Hybrid Training" ? ["hybrid"]
        : mainGoal === "Muscle Build" ? ["strength"]
        : ["general"];

      await updateProfile({
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        goals,
        daysPerWeek: sessionsPerWeek,
        fitnessLevel: strengthExp.toLowerCase(),
        onboardingComplete: true,
        // Store full onboarding data as JSON in a notes field
        onboardingData: JSON.stringify({
          dob, mainGoal, strengthExp, condExp, runExp, weeklyKm,
          raceName, raceType, raceDate,
          sessionsPerWeek, strengthSessions, runSessions, condSessions,
          strengthFocus, sessionLength, facility, runGoal,
          paceMin, paceSec, extra,
        }),
      } as any);
      router.replace("/app/(tabs)/home");
    } catch {
      Alert.alert("Error", "Failed to save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const expLevels = ["Beginner", "Intermediate", "Advanced", "Returning"];
  const raceTypes = ["5KM", "10KM", "Half Marathon", "Marathon", "Hyrox"];
  const minutes   = Array.from({ length: 20 }, (_, i) => i + 15);
  const seconds   = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const totalSessions = strengthSessions + runSessions + condSessions;
  const splitValid = totalSessions === sessionsPerWeek;

  // ── Step renderer ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // Step 1 — Name + DOB
      case 1: return (
        <>
          <Text style={s.stepTag}>Step 1 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Who are we working with?</Text>
          <Text style={s.sub}>Used to personalise your experience and tailor training intensity.</Text>
          <Text style={s.fieldLabel}>Your Name</Text>
          <TextInput
            style={s.textInput}
            placeholder="e.g. Isabelle"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
          <Text style={s.fieldLabel}>Date of Birth</Text>
          <TextInput
            style={s.textInput}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textTertiary}
            value={dob}
            onChangeText={setDob}
            keyboardType="numeric"
          />
          <Text style={s.hint}>Used to tailor training intensity and recovery.</Text>
        </>
      );

      // Step 2 — Main goal
      case 2: return (
        <>
          <Text style={s.stepTag}>Step 2 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>What's your main goal?</Text>
          <View style={s.optionList}>
            {[
              { t: "Race & Competition", s: "I'm training for a specific event" },
              { t: "Hybrid Training",    s: "I want to be strong, fast and conditioned" },
              { t: "Muscle Build",       s: "Focus on strength and physique" },
              { t: "Run Improvements",   s: "Become a faster, more durable runner" },
            ].map(o => (
              <OptionCard key={o.t} title={o.t} sub={o.s} selected={mainGoal === o.t} onPress={() => setMainGoal(o.t)} />
            ))}
          </View>
        </>
      );

      // Step 3 — Experience
      case 3: return (
        <>
          <Text style={s.stepTag}>Step 3 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>How experienced are you?</Text>
          <ChipRow label="Strength Training" options={expLevels} value={strengthExp} onChange={v => setStrengthExp(String(v))} />
          <ChipRow label="Conditioning Style" options={expLevels} value={condExp} onChange={v => setCondExp(String(v))} />
          <ChipRow label="Running" options={expLevels} value={runExp} onChange={v => setRunExp(String(v))} />
          <Text style={s.fieldLabel}>Weekly Running Volume</Text>
          <View style={s.sliderRow}>
            <TouchableOpacity style={s.sliderBtn} onPress={() => setWeeklyKm(v => Math.max(0, v - 5))}>
              <Ionicons name="remove" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={s.sliderVal}>{weeklyKm} km</Text>
            <TouchableOpacity style={s.sliderBtn} onPress={() => setWeeklyKm(v => Math.min(100, v + 5))}>
              <Ionicons name="add" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </>
      );

      // Step 4 — Upcoming race (skippable)
      case 4: return (
        <>
          <Text style={s.stepTag}>Step 4 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Got an upcoming race?</Text>
          <Text style={s.sub}>All fields optional — skip if you're not racing yet.</Text>
          <Text style={s.fieldLabel}>Race name / block</Text>
          <TextInput style={s.textInput} placeholder="e.g. Get Faster Block" placeholderTextColor={colors.textTertiary} value={raceName} onChangeText={setRaceName} />
          <Text style={s.fieldLabel}>Race Type</Text>
          <View style={s.chipRow}>
            {raceTypes.map(r => (
              <TouchableOpacity key={r} style={[s.chip, raceType === r && s.chipActive]} onPress={() => setRaceType(r)}>
                <Text style={[s.chipText, raceType === r && s.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.fieldLabel, { marginTop: 16 }]}>Race Date</Text>
          <TextInput style={s.textInput} placeholder="DD/MM/YYYY" placeholderTextColor={colors.textTertiary} value={raceDate} onChangeText={setRaceDate} keyboardType="numeric" />
        </>
      );

      // Step 5 — Training split
      case 5: return (
        <>
          <Text style={s.stepTag}>Step 5 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>How do you want to train?</Text>
          <ChipRow label="Sessions per week" options={[2, 3, 4, 5, 6, 7]} value={sessionsPerWeek} onChange={v => { setSessionsPerWeek(Number(v)); setStrengthSessions(1); setRunSessions(1); setCondSessions(Math.max(0, Number(v) - 2)); }} />
          <ChipRow label="Strength" options={[0, 1, 2, 3, 4, 5, 6, 7]} value={strengthSessions} onChange={v => setStrengthSessions(Number(v))} />
          <ChipRow label="Run" options={[0, 1, 2, 3, 4, 5, 6, 7]} value={runSessions} onChange={v => setRunSessions(Number(v))} />
          <ChipRow label="Conditioning" options={[0, 1, 2, 3, 4, 5, 6, 7]} value={condSessions} onChange={v => setCondSessions(Number(v))} />
          <View style={[s.splitInfo, splitValid ? s.splitInfoOk : s.splitInfoBad]}>
            <Ionicons name={splitValid ? "checkmark-circle" : "alert-circle-outline"} size={16} color={splitValid ? colors.success : colors.warning} />
            <Text style={[s.splitInfoText, { color: splitValid ? colors.success : colors.warning }]}>
              Total: {totalSessions} / {sessionsPerWeek} sessions {splitValid ? "— perfect!" : "— adjust to match"}
            </Text>
          </View>
        </>
      );

      // Step 6 — Strength focus
      case 6: return (
        <>
          <Text style={s.stepTag}>Step 6 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Strength Focus</Text>
          <View style={s.optionList}>
            {[
              { t: "Get Stronger",      s: "Lower reps, heavier loads (3–6 reps)" },
              { t: "Gain Muscle",       s: "Hypertrophy ranges (8–12 reps)" },
              { t: "Muscle Endurance",  s: "Higher reps, conditioning bias (12–20)" },
            ].map(o => (
              <OptionCard key={o.t} title={o.t} sub={o.s} selected={strengthFocus === o.t} onPress={() => setStrengthFocus(o.t)} />
            ))}
          </View>
        </>
      );

      // Step 7 — Session length
      case 7: return (
        <>
          <Text style={s.stepTag}>Step 7 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Session Length</Text>
          <Text style={s.sub}>How long do you have per session?</Text>
          <View style={s.chipRow}>
            {[30, 45, 60, 75].map(m => (
              <TouchableOpacity key={m} style={[s.bigChip, sessionLength === m && s.bigChipActive]} onPress={() => setSessionLength(m)}>
                <Text style={[s.bigChipText, sessionLength === m && s.bigChipTextActive]}>{m}</Text>
                <Text style={[s.bigChipSub, sessionLength === m && s.bigChipSubActive]}>min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );

      // Step 8 — Facility access
      case 8: return (
        <>
          <Text style={s.stepTag}>Step 8 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Facility Access</Text>
          <View style={s.optionList}>
            {[
              { t: "Full Functional Set Up", s: "Sled, ski erg, rower, the lot" },
              { t: "Standard Gym",           s: "Barbells, dumbbells, machines" },
              { t: "Home Gym Basics",        s: "DBs, bands, kettlebell" },
              { t: "Minimal Equipment",      s: "Bodyweight + improvise" },
            ].map(o => (
              <OptionCard key={o.t} title={o.t} sub={o.s} selected={facility === o.t} onPress={() => setFacility(o.t)} />
            ))}
          </View>
        </>
      );

      // Step 9 — Run goal
      case 9: return (
        <>
          <Text style={s.stepTag}>Step 9 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Run Goal</Text>
          <View style={s.optionList}>
            {[
              { t: "Start From Scratch", s: "Build the habit safely" },
              { t: "Get Faster",         s: "Sharpen pace and threshold" },
              { t: "Build Endurance",    s: "Go further, recover better" },
            ].map(o => (
              <OptionCard key={o.t} title={o.t} sub={o.s} selected={runGoal === o.t} onPress={() => setRunGoal(o.t)} />
            ))}
          </View>
        </>
      );

      // Step 10 — 5KM pace
      case 10: return (
        <>
          <Text style={s.stepTag}>Step 10 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Current 5KM Pace</Text>
          <Text style={s.sub}>Roughly how fast do you currently run a 5km?</Text>
          <View style={s.paceRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.paceLabel}>Minutes</Text>
              <View style={s.paceScroll}>
                {minutes.map(m => (
                  <TouchableOpacity key={m} style={[s.paceItem, paceMin === m && s.paceItemActive]} onPress={() => setPaceMin(m)}>
                    <Text style={[s.paceItemText, paceMin === m && s.paceItemTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.paceLabel}>Seconds</Text>
              <View style={s.paceScroll}>
                {seconds.map(sec => (
                  <TouchableOpacity key={sec} style={[s.paceItem, paceSec === sec && s.paceItemActive]} onPress={() => setPaceSec(sec)}>
                    <Text style={[s.paceItemText, paceSec === sec && s.paceItemTextActive]}>{String(sec).padStart(2, "0")}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={s.paceSummary}>
            <Text style={s.paceSummaryText}>{paceMin}:{String(paceSec).padStart(2, "0")} / 5km</Text>
          </View>
        </>
      );

      // Step 11 — Anything else
      case 11: return (
        <>
          <Text style={s.stepTag}>Step 11 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Anything else we should know?</Text>
          <Text style={s.sub}>Injuries, preferences, anything that shapes how you train best.</Text>
          <TextInput
            style={[s.textInput, { height: 120, textAlignVertical: "top", paddingTop: 12 }]}
            placeholder="e.g. I have a knee issue, prefer morning sessions..."
            placeholderTextColor={colors.textTertiary}
            value={extra}
            onChangeText={setExtra}
            multiline
          />
        </>
      );

      // Step 12 — Confirm selections
      case 12: return (
        <>
          <Text style={s.stepTag}>Step 12 of {TOTAL_STEPS}</Text>
          <Text style={s.title}>Confirm Your Selections</Text>
          <Text style={s.sub}>Review everything before we build your plan.</Text>
          <View style={s.confirmList}>
            {[
              { label: "Name",            val: name || "—" },
              { label: "Main Goal",       val: mainGoal || "—" },
              { label: "Experience",      val: strengthExp ? `S:${strengthExp} · C:${condExp} · R:${runExp} · ${weeklyKm}km/wk` : "—" },
              { label: "Race",            val: raceName ? `${raceName}${raceType ? " — " + raceType : ""}${raceDate ? " — " + raceDate : ""}` : "No race set" },
              { label: "Training Split",  val: sessionsPerWeek ? `${sessionsPerWeek}/wk · ${strengthSessions}S/${runSessions}R/${condSessions}C` : "—" },
              { label: "Strength Focus",  val: strengthFocus || "—" },
              { label: "Session Length",  val: sessionLength ? `${sessionLength} min` : "—" },
              { label: "Facility",        val: facility || "—" },
              { label: "Run Goal",        val: runGoal || "—" },
              { label: "5KM Pace",        val: `${paceMin}:${String(paceSec).padStart(2, "0")}` },
              { label: "Notes",           val: extra || "None" },
            ].map(item => (
              <View key={item.label} style={s.confirmRow}>
                <Text style={s.confirmLabel}>{item.label}</Text>
                <Text style={s.confirmVal}>{item.val}</Text>
              </View>
            ))}
          </View>
        </>
      );

      default: return null;
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.progressTrack}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[s.progressSeg, i < step && s.progressSegActive]} />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        {step === 4 && (
          <TouchableOpacity style={s.skipBtn} onPress={goNext}>
            <Text style={s.skipText}>No Race — Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.continueBtn, !canContinue() && s.continueBtnDisabled]}
          onPress={step === TOTAL_STEPS ? handleFinish : goNext}
          disabled={!canContinue() || saving}
        >
          <Text style={s.continueBtnText}>
            {step === TOTAL_STEPS ? (saving ? "Setting up…" : "Start Training") : "Continue"}
          </Text>
          {step < TOTAL_STEPS && <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  progressTrack: { flex: 1, flexDirection: "row", gap: 3 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.surfaceAlt },
  progressSegActive: { backgroundColor: colors.primary },

  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  stepTag: { color: colors.primary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: "800", marginBottom: 8, lineHeight: 32 },
  sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  hint: { color: colors.textTertiary, fontSize: 12, marginTop: 8, lineHeight: 18 },

  fieldLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  textInput: { backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15, marginBottom: 14 },

  optionList: { gap: 10 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  optionTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
  optionTitleActive: { color: colors.primary },
  optionSub: { color: colors.textTertiary, fontSize: 12, marginTop: 2 },
  optionSubActive: { color: colors.textSecondary },

  chipLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.textOnPrimary },

  bigChip: { flex: 1, paddingVertical: 20, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, alignItems: "center" },
  bigChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  bigChipText: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  bigChipTextActive: { color: colors.textOnPrimary },
  bigChipSub: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  bigChipSubActive: { color: "rgba(255,255,255,0.7)" },

  sliderRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  sliderBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  sliderVal: { flex: 1, textAlign: "center", color: colors.textPrimary, fontSize: 20, fontWeight: "800" },

  splitInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: radius.sm, borderWidth: 0.5, marginTop: 4 },
  splitInfoOk: { backgroundColor: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" },
  splitInfoBad: { backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" },
  splitInfoText: { fontSize: 13, fontWeight: "500" },

  paceRow: { flexDirection: "row", gap: 16 },
  paceLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" },
  paceScroll: { gap: 4 },
  paceItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.sm, alignItems: "center", backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border },
  paceItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  paceItemText: { color: colors.textSecondary, fontSize: 16, fontWeight: "600" },
  paceItemTextActive: { color: colors.textOnPrimary },
  paceSummary: { marginTop: 16, alignItems: "center", backgroundColor: colors.primaryDim, borderRadius: radius.sm, paddingVertical: 12, borderWidth: 0.5, borderColor: colors.borderStrong },
  paceSummaryText: { color: colors.primary, fontSize: 20, fontWeight: "800" },

  confirmList: { gap: 1, borderRadius: radius.md, overflow: "hidden", borderWidth: 0.5, borderColor: colors.border },
  confirmRow: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  confirmLabel: { color: colors.textTertiary, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  confirmVal: { color: colors.textPrimary, fontSize: 14, fontWeight: "500" },

  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, gap: 10 },
  skipBtn: { alignItems: "center", paddingVertical: 12, borderRadius: radius.pill, borderWidth: 0.5, borderColor: colors.border },
  skipText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  continueBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 16 },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textOnPrimary, fontSize: 15, fontWeight: "700" },
});