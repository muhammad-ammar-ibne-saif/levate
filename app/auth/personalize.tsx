import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";

const TOTAL_STEPS = 12;

// ── Smart date formatter ──────────────────────────────────────────────────────
// Formats input as DD-MM-YYYY, enforces day ≤ 31, month ≤ 12
function formatDate(prev: string, next: string): string {
  // Strip everything except digits
  const digits = next.replace(/\D/g, "").slice(0, 8);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 0) {
      // Day first digit: max 3
      if (parseInt(digits[i]) > 3) out += "0" + digits[i] + "-";
      else out += digits[i];
    } else if (i === 1) {
      // Day second digit
      const day = parseInt(digits[0] + digits[1]);
      if (day < 1) out += "1-";
      else if (day > 31) out += "1-";
      else out += digits[i] + "-";
    } else if (i === 2) {
      // Month first digit: max 1
      if (parseInt(digits[i]) > 1) out += "0" + digits[i] + "-";
      else out += digits[i];
    } else if (i === 3) {
      // Month second digit
      const month = parseInt(digits[2] + digits[3]);
      if (month < 1) out += "1-";
      else if (month > 12) out += "2-";
      else out += digits[i] + "-";
    } else {
      out += digits[i];
    }
  }
  return out;
}

// Validate a date string DD-MM-YYYY
function validateDate(
  val: string,
  mustBeFuture = false,
  mustBePastOrPresent = false
): string | null {
  if (!val || val.length < 10) return "Enter a complete date (DD-MM-YYYY)";
  const parts = val.split("-");
  if (parts.length !== 3) return "Invalid date format";
  const [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return "Invalid date";
  if (d < 1 || d > 31) return "Day must be between 01 and 31";
  if (m < 1 || m > 12) return "Month must be between 01 and 12";
  if (y < 1900) return "Enter a valid year";
  const date = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (mustBeFuture && date <= now) return "Date must be in the future";
  if (mustBePastOrPresent && date > now) return "Date cannot be in the future";
  return null;
}

function OptionCard({
  title,
  sub,
  selected,
  onPress,
}: {
  title: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.option, selected && s.optionActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.optionTitle, selected && s.optionTitleActive]}>
          {title}
        </Text>
        {sub ? (
          <Text style={[s.optionSub, selected && s.optionSubActive]}>
            {sub}
          </Text>
        ) : null}
      </View>
      {selected && (
        <Ionicons name="checkmark" size={16} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: (string | number)[];
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.chipLabel}>{label}</Text>
      <View style={s.chipRow}>
        {options.map((o) => (
          <TouchableOpacity
            key={String(o)}
            style={[s.chip, value === o && s.chipActive]}
            onPress={() => onChange(o)}
          >
            <Text style={[s.chipText, value === o && s.chipTextActive]}>
              {o}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function DateInput({
  label,
  value,
  onChange,
  mustBeFuture,
  mustBePastOrPresent,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mustBeFuture?: boolean;
  mustBePastOrPresent?: boolean;
  hint?: string;
}) {
  const [touched, setTouched] = useState(false);
  const err =
    touched && value.length > 0
      ? validateDate(value, mustBeFuture, mustBePastOrPresent)
      : null;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.textInput, err ? { borderColor: colors.danger } : {}]}
        placeholder="DD-MM-YYYY"
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={(v) => onChange(formatDate(value, v))}
        onBlur={() => setTouched(true)}
        keyboardType="numeric"
        maxLength={10}
      />
      {err && <Text style={s.errText}>{err}</Text>}
      {!err && hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

export default function PersonalizeScreen() {
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [dateErrors, setDateErrors] = useState<Record<string, string | null>>(
    {}
  );

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [strengthExp, setStrengthExp] = useState("");
  const [condExp, setCondExp] = useState("");
  const [runExp, setRunExp] = useState("");
  const [weeklyKm, setWeeklyKm] = useState(20);
  const [raceName, setRaceName] = useState("");
  const [raceType, setRaceType] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [strengthSessions, setStrengthSessions] = useState(1);
  const [runSessions, setRunSessions] = useState(1);
  const [condSessions, setCondSessions] = useState(1);
  const [strengthFocus, setStrengthFocus] = useState("");
  const [sessionLength, setSessionLength] = useState(45);
  const [facility, setFacility] = useState("");
  const [runGoal, setRunGoal] = useState("");
  const [paceMin, setPaceMin] = useState(25);
  const [paceSec, setPaceSec] = useState(0);
  const [extra, setExtra] = useState("");

  const goBack = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1: {
        if (!name.trim()) return false;
        if (dob.length > 0 && validateDate(dob, false, true)) return false;
        return true;
      }
      case 2:
        return !!mainGoal;
      case 3:
        return !!strengthExp && !!condExp && !!runExp;
      case 4: {
        if (raceDate.length > 0 && validateDate(raceDate, true)) return false;
        return true;
      }
      case 5:
        return (
          strengthSessions + runSessions + condSessions === sessionsPerWeek
        );
      case 6:
        return !!strengthFocus;
      case 7:
        return !!sessionLength;
      case 8:
        return !!facility;
      case 9:
        return !!runGoal;
      case 10:
        return true;
      case 11:
        return true;
      case 12:
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!canContinue()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const goals =
        mainGoal === "Race & Competition"
          ? ["race"]
          : mainGoal === "Hybrid Training"
          ? ["hybrid"]
          : mainGoal === "Muscle Build"
          ? ["strength"]
          : ["general"];

      await updateProfile({
        goals,
        daysPerWeek: sessionsPerWeek,
        fitnessLevel: strengthExp.toLowerCase(),
        onboardingComplete: true,
        onboardingData: JSON.stringify({
          dob,
          mainGoal,
          strengthExp,
          condExp,
          runExp,
          weeklyKm,
          raceName,
          raceType,
          raceDate,
          sessionsPerWeek,
          strengthSessions,
          runSessions,
          condSessions,
          strengthFocus,
          sessionLength,
          facility,
          runGoal,
          paceMin,
          paceSec,
          extra,
        }),
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

  const expLevels = ["Beginner", "Intermediate", "Advanced", "Returning"];
  const raceTypes = ["5KM", "10KM", "Half Marathon", "Marathon", "Hyrox"];
  // Pace: 0–59 minutes, 0–55 seconds in steps of 5
  const paceMinutes = Array.from({ length: 60 }, (_, i) => i);
  const paceSeconds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const totalSessions = strengthSessions + runSessions + condSessions;
  const splitValid = totalSessions === sessionsPerWeek;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={s.stepTag}>Step 1 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Who are we working with?</Text>
            <Text style={s.sub}>
              Used to personalise your experience and tailor training intensity.
            </Text>
            <Text style={s.fieldLabel}>Your Name</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. Isabelle"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
            <DateInput
              label="Date of Birth"
              value={dob}
              onChange={setDob}
              mustBePastOrPresent
              hint="Used to tailor training intensity and recovery."
            />
          </>
        );

      case 2:
        return (
          <>
            <Text style={s.stepTag}>Step 2 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>What's your main goal?</Text>
            <View style={s.optionList}>
              {[
                {
                  t: "Race & Competition",
                  s: "I'm training for a specific event",
                },
                {
                  t: "Hybrid Training",
                  s: "I want to be strong, fast and conditioned",
                },
                { t: "Muscle Build", s: "Focus on strength and physique" },
                {
                  t: "Run Improvements",
                  s: "Become a faster, more durable runner",
                },
              ].map((o) => (
                <OptionCard
                  key={o.t}
                  title={o.t}
                  sub={o.s}
                  selected={mainGoal === o.t}
                  onPress={() => setMainGoal(o.t)}
                />
              ))}
            </View>
          </>
        );

      case 3:
        return (
          <>
            <Text style={s.stepTag}>Step 3 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>How experienced are you?</Text>
            <ChipRow
              label="Strength Training"
              options={expLevels}
              value={strengthExp}
              onChange={(v) => setStrengthExp(String(v))}
            />
            <ChipRow
              label="Conditioning Style"
              options={expLevels}
              value={condExp}
              onChange={(v) => setCondExp(String(v))}
            />
            <ChipRow
              label="Running"
              options={expLevels}
              value={runExp}
              onChange={(v) => setRunExp(String(v))}
            />
            <Text style={s.fieldLabel}>Weekly Running Volume</Text>
            <View style={s.sliderRow}>
              <TouchableOpacity
                style={s.sliderBtn}
                onPress={() => setWeeklyKm((v) => Math.max(0, v - 5))}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={s.sliderVal}>{weeklyKm} km</Text>
              <TouchableOpacity
                style={s.sliderBtn}
                onPress={() => setWeeklyKm((v) => Math.min(200, v + 5))}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text style={s.stepTag}>Step 4 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Got an upcoming race?</Text>
            <Text style={s.sub}>
              All fields optional — skip if you're not racing yet.
            </Text>
            <Text style={s.fieldLabel}>Race name / block</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. Get Faster Block"
              placeholderTextColor={colors.textTertiary}
              value={raceName}
              onChangeText={setRaceName}
            />
            <Text style={s.fieldLabel}>Race Type</Text>
            <View style={s.chipRow}>
              {raceTypes.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.chip, raceType === r && s.chipActive]}
                  onPress={() => setRaceType(r)}
                >
                  <Text
                    style={[s.chipText, raceType === r && s.chipTextActive]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <DateInput
              label="Race Date"
              value={raceDate}
              onChange={setRaceDate}
              mustBeFuture
              hint="Must be a future date."
            />
          </>
        );

      case 5:
        return (
          <>
            <Text style={s.stepTag}>Step 5 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>How do you want to train?</Text>
            <ChipRow
              label="Sessions per week"
              options={[2, 3, 4, 5, 6, 7]}
              value={sessionsPerWeek}
              onChange={(v) => {
                const n = Number(v);
                setSessionsPerWeek(n);
                setStrengthSessions(1);
                setRunSessions(1);
                setCondSessions(Math.max(0, n - 2));
              }}
            />
            <ChipRow
              label="Strength"
              options={[0, 1, 2, 3, 4, 5, 6, 7]}
              value={strengthSessions}
              onChange={(v) => setStrengthSessions(Number(v))}
            />
            <ChipRow
              label="Run"
              options={[0, 1, 2, 3, 4, 5, 6, 7]}
              value={runSessions}
              onChange={(v) => setRunSessions(Number(v))}
            />
            <ChipRow
              label="Conditioning"
              options={[0, 1, 2, 3, 4, 5, 6, 7]}
              value={condSessions}
              onChange={(v) => setCondSessions(Number(v))}
            />
            <View
              style={[s.splitInfo, splitValid ? s.splitInfoOk : s.splitInfoBad]}
            >
              <Ionicons
                name={splitValid ? "checkmark-circle" : "alert-circle-outline"}
                size={16}
                color={splitValid ? colors.success : colors.warning}
              />
              <Text
                style={[
                  s.splitInfoText,
                  { color: splitValid ? colors.success : colors.warning },
                ]}
              >
                Total: {totalSessions} / {sessionsPerWeek} sessions{" "}
                {splitValid ? "— perfect!" : "— adjust to match"}
              </Text>
            </View>
          </>
        );

      case 6:
        return (
          <>
            <Text style={s.stepTag}>Step 6 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Strength Focus</Text>
            <View style={s.optionList}>
              {[
                {
                  t: "Get Stronger",
                  s: "Lower reps, heavier loads (3–6 reps)",
                },
                { t: "Gain Muscle", s: "Hypertrophy ranges (8–12 reps)" },
                {
                  t: "Muscle Endurance",
                  s: "Higher reps, conditioning bias (12–20)",
                },
              ].map((o) => (
                <OptionCard
                  key={o.t}
                  title={o.t}
                  sub={o.s}
                  selected={strengthFocus === o.t}
                  onPress={() => setStrengthFocus(o.t)}
                />
              ))}
            </View>
          </>
        );

      case 7:
        return (
          <>
            <Text style={s.stepTag}>Step 7 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Session Length</Text>
            <Text style={s.sub}>How long do you have per session?</Text>
            <View style={s.bigChipRow}>
              {[30, 45, 60, 75].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[s.bigChip, sessionLength === m && s.bigChipActive]}
                  onPress={() => setSessionLength(m)}
                >
                  <Text
                    style={[
                      s.bigChipText,
                      sessionLength === m && s.bigChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                  <Text
                    style={[
                      s.bigChipSub,
                      sessionLength === m && s.bigChipSubActive,
                    ]}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case 8:
        return (
          <>
            <Text style={s.stepTag}>Step 8 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Facility Access</Text>
            <View style={s.optionList}>
              {[
                {
                  t: "Full Functional Set Up",
                  s: "Sled, ski erg, rower, the lot",
                },
                { t: "Standard Gym", s: "Barbells, dumbbells, machines" },
                { t: "Home Gym Basics", s: "DBs, bands, kettlebell" },
                { t: "Minimal Equipment", s: "Bodyweight + improvise" },
              ].map((o) => (
                <OptionCard
                  key={o.t}
                  title={o.t}
                  sub={o.s}
                  selected={facility === o.t}
                  onPress={() => setFacility(o.t)}
                />
              ))}
            </View>
          </>
        );

      case 9:
        return (
          <>
            <Text style={s.stepTag}>Step 9 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Run Goal</Text>
            <View style={s.optionList}>
              {[
                { t: "Start From Scratch", s: "Build the habit safely" },
                { t: "Get Faster", s: "Sharpen pace and threshold" },
                { t: "Build Endurance", s: "Go further, recover better" },
              ].map((o) => (
                <OptionCard
                  key={o.t}
                  title={o.t}
                  sub={o.s}
                  selected={runGoal === o.t}
                  onPress={() => setRunGoal(o.t)}
                />
              ))}
            </View>
          </>
        );

      case 10:
        return (
          <>
            <Text style={s.stepTag}>Step 10 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Current 5KM Pace</Text>
            <Text style={s.sub}>
              Roughly how fast do you currently run a 5km? Select any time — no
              limits.
            </Text>
            <View style={s.paceRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.paceLabel}>Minutes</Text>
                <ScrollView
                  style={s.paceScroller}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {paceMinutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[s.paceItem, paceMin === m && s.paceItemActive]}
                      onPress={() => setPaceMin(m)}
                    >
                      <Text
                        style={[
                          s.paceItemText,
                          paceMin === m && s.paceItemTextActive,
                        ]}
                      >
                        {String(m).padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={s.paceDivider} />
              <View style={{ flex: 1 }}>
                <Text style={s.paceLabel}>Seconds</Text>
                <ScrollView
                  style={s.paceScroller}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {paceSeconds.map((sec) => (
                    <TouchableOpacity
                      key={sec}
                      style={[s.paceItem, paceSec === sec && s.paceItemActive]}
                      onPress={() => setPaceSec(sec)}
                    >
                      <Text
                        style={[
                          s.paceItemText,
                          paceSec === sec && s.paceItemTextActive,
                        ]}
                      >
                        {String(sec).padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={s.paceSummary}>
              <Text style={s.paceSummaryText}>
                {String(paceMin).padStart(2, "0")}:
                {String(paceSec).padStart(2, "0")} / 5km
              </Text>
            </View>
          </>
        );

      case 11:
        return (
          <>
            <Text style={s.stepTag}>Step 11 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Anything else we should know?</Text>
            <Text style={s.sub}>
              Injuries, preferences, anything that shapes how you train best.
            </Text>
            <TextInput
              style={[
                s.textInput,
                { height: 140, textAlignVertical: "top", paddingTop: 14 },
              ]}
              placeholder="e.g. I have a knee issue, prefer morning sessions..."
              placeholderTextColor={colors.textTertiary}
              value={extra}
              onChangeText={setExtra}
              multiline
            />
          </>
        );

      case 12:
        return (
          <>
            <Text style={s.stepTag}>Step 12 of {TOTAL_STEPS}</Text>
            <Text style={s.title}>Confirm Your Selections</Text>
            <Text style={s.sub}>
              Review everything before we build your plan.
            </Text>
            <View style={s.confirmList}>
              {[
                { label: "Name", val: name || "—" },
                { label: "Date of Birth", val: dob || "—" },
                { label: "Main Goal", val: mainGoal || "—" },
                {
                  label: "Experience",
                  val: strengthExp
                    ? `S:${strengthExp} · C:${condExp} · R:${runExp} · ${weeklyKm}km/wk`
                    : "—",
                },
                {
                  label: "Race",
                  val: raceName
                    ? `${raceName}${raceType ? " — " + raceType : ""}${
                        raceDate ? " — " + raceDate : ""
                      }`
                    : "No race set",
                },
                {
                  label: "Training Split",
                  val: `${sessionsPerWeek}/wk · ${strengthSessions}S / ${runSessions}R / ${condSessions}C`,
                },
                { label: "Strength Focus", val: strengthFocus || "—" },
                { label: "Session Length", val: `${sessionLength} min` },
                { label: "Facility", val: facility || "—" },
                { label: "Run Goal", val: runGoal || "—" },
                {
                  label: "5KM Pace",
                  val: `${String(paceMin).padStart(2, "0")}:${String(
                    paceSec
                  ).padStart(2, "0")}`,
                },
                { label: "Notes", val: extra || "None" },
              ].map((item) => (
                <View key={item.label} style={s.confirmRow}>
                  <Text style={s.confirmLabel}>{item.label}</Text>
                  <Text style={s.confirmVal}>{item.val}</Text>
                </View>
              ))}
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.progressTrack}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[s.progressSeg, i < step && s.progressSegActive]}
            />
          ))}
        </View>
        <Text style={s.stepCounter}>
          {step}/{TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={s.footer}>
        {step === 4 && (
          <TouchableOpacity
            style={s.skipBtn}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text style={s.skipText}>No Race — Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            s.continueBtn,
            (!canContinue() || saving) && s.continueBtnDisabled,
          ]}
          onPress={step === TOTAL_STEPS ? handleFinish : goNext}
          disabled={!canContinue() || saving}
        >
          <Text style={s.continueBtnText}>
            {step === TOTAL_STEPS
              ? saving
                ? "Setting up…"
                : "Start Training"
              : "Continue"}
          </Text>
          {step < TOTAL_STEPS && (
            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.textOnPrimary}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: { flex: 1, flexDirection: "row", gap: 3 },
  progressSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
  },
  progressSegActive: { backgroundColor: colors.primary },
  stepCounter: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "right",
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 4 },
  stepTag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    lineHeight: 32,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  hint: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 14,
    lineHeight: 18,
  },
  errText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 14,
  },

  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 14,
  },

  optionList: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  optionTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
  optionTitleActive: { color: colors.primary },
  optionSub: { color: colors.textTertiary, fontSize: 12, marginTop: 2 },
  optionSubActive: { color: colors.textSecondary },

  chipLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.textOnPrimary },

  bigChipRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  bigChip: {
    flex: 1,
    paddingVertical: 22,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  bigChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bigChipText: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  bigChipTextActive: { color: colors.textOnPrimary },
  bigChipSub: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  bigChipSubActive: { color: "rgba(255,255,255,0.7)" },

  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  sliderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderVal: {
    flex: 1,
    textAlign: "center",
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },

  splitInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    marginTop: 4,
  },
  splitInfoOk: {
    backgroundColor: "rgba(34,197,94,0.08)",
    borderColor: "rgba(34,197,94,0.3)",
  },
  splitInfoBad: {
    backgroundColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.3)",
  },
  splitInfoText: { fontSize: 13, fontWeight: "500" },

  paceRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  paceLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
  },
  paceScroller: {
    height: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  paceDivider: { width: 0.5, backgroundColor: colors.border, marginTop: 28 },
  paceItem: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  paceItemActive: { backgroundColor: colors.primary },
  paceItemText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  paceItemTextActive: { color: colors.textOnPrimary, fontWeight: "800" },
  paceSummary: {
    alignItems: "center",
    backgroundColor: colors.primaryDim,
    borderRadius: radius.sm,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
  },
  paceSummaryText: { color: colors.primary, fontSize: 22, fontWeight: "800" },

  confirmList: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  confirmRow: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  confirmLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  confirmVal: { color: colors.textPrimary, fontSize: 14, fontWeight: "500" },

  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, gap: 10 },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  skipText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  continueBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
