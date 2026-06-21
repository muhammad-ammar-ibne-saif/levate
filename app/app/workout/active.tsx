import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutStore } from "@/store/workout";
import { useWorkoutTimer, formatTime } from "@/hooks/useWorkoutTimer";
import { colors, radius } from "@/lib/theme";

type WorkoutPhase = "ready" | "active" | "paused";
type IconName = React.ComponentProps<typeof Ionicons>["name"];
const TYPE_ICON: Record<string, IconName> = {
  lift: "barbell-outline",
  run: "footsteps-outline",
  race: "flag-outline",
};

export default function ActiveWorkoutScreen() {
  const { name, type } = useLocalSearchParams<{
    name: string;
    type: "lift" | "run" | "race";
  }>();
  const {
    setsCompleted,
    calories,
    elapsedSeconds,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    endWorkout,
    resetWorkout,
  } = useWorkoutStore();
  const [phase, setPhase] = useState<WorkoutPhase>("ready");

  useWorkoutTimer();

  useEffect(() => {
    resetWorkout();
  }, []);

  const size = 220,
    sw = 10,
    r = (size - sw) / 2,
    circ = 2 * Math.PI * r;
  const progress = Math.min(elapsedSeconds / (30 * 60), 1);
  const offset = circ - progress * circ;

  const handleStart = () => {
    setPhase("active");
    startWorkout(name || "Workout", type || "lift");
  };
  const handlePause = () => {
    setPhase("paused");
    pauseWorkout();
  };
  const handleResume = () => {
    setPhase("active");
    resumeWorkout();
  };

  const handleEnd = () => {
    Alert.alert("End Workout", "Are you sure you want to end this session?", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "End Session",
        style: "destructive",
        onPress: async () => {
          await endWorkout();
          router.replace("/app/workout/complete");
        },
      },
    ]);
  };

  const handleBack = () => {
    if (phase === "active" || phase === "paused") {
      Alert.alert("Go Back?", "Your workout progress will be lost.", [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            resetWorkout();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.wkName} numberOfLines={1}>
            {name || "Workout"}
          </Text>
          <Text style={s.wkSub}>
            {type === "lift"
              ? "Strength · "
              : type === "run"
              ? "Run · "
              : "Race · "}
            Week 5
          </Text>
        </View>
        <View style={s.setBadge}>
          <Text style={[s.setNum, { color: colors.primary }]}>5</Text>
          <Text style={s.setPlus}>+</Text>
          <Text style={[s.setNum, { color: colors.textTertiary }]}>1</Text>
        </View>
      </View>

      <View style={s.ringWrap}>
        <Svg
          width={size}
          height={size}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.surfaceAlt}
            strokeWidth={sw}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.primary}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={phase === "ready" ? circ : offset}
            opacity={phase === "ready" ? 0.3 : 1}
          />
        </Svg>
        <View style={s.ringCenter}>
          {phase === "ready" ? (
            <View style={s.readyCenter}>
              <Ionicons
                name={TYPE_ICON[type || "lift"]}
                size={36}
                color={colors.primary}
              />
              <Text style={s.readyText}>Ready</Text>
              <Text style={s.readySub}>Tap Start to begin</Text>
            </View>
          ) : (
            <>
              <Text style={s.timeText}>{formatTime(elapsedSeconds)}</Text>
              <Text style={s.timeLabel}>
                {phase === "paused" ? "Paused" : "Workout duration"}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statVal}>{setsCompleted}</Text>
          <Text style={s.statLabel}>Sets</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{calories}</Text>
          <Text style={s.statLabel}>Calories</Text>
        </View>
      </View>

      <View style={s.tileRow}>
        <View style={s.tile}>
          <Text style={s.tileVal}>5+1</Text>
          <Text style={s.tileLabel}>Hybrid build</Text>
        </View>
        <View style={s.tile}>
          <Text style={[s.tileVal, { color: colors.primary }]}>
            {phase === "ready"
              ? "—"
              : String(
                  Math.max(0, 2 - Math.floor(elapsedSeconds / 60))
                ).padStart(2, "0")}
          </Text>
          <Text style={s.tileLabel}>Countdown</Text>
        </View>
      </View>

      <View style={s.controls}>
        {phase === "ready" && (
          <TouchableOpacity
            style={[s.ctrlBtn, { backgroundColor: colors.primary }]}
            onPress={handleStart}
          >
            <Ionicons name="play" size={16} color={colors.textOnPrimary} />
            <Text style={s.ctrlTextDark}>Start Workout</Text>
          </TouchableOpacity>
        )}
        {phase === "active" && (
          <>
            <TouchableOpacity
              style={[s.ctrlBtn, { backgroundColor: colors.primary }]}
              onPress={handlePause}
            >
              <Ionicons name="pause" size={16} color={colors.textOnPrimary} />
              <Text style={s.ctrlTextDark}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctrlBtnGhost} onPress={handleEnd}>
              <Ionicons name="stop" size={16} color={colors.textPrimary} />
              <Text style={s.ctrlTextLight}>End workout</Text>
            </TouchableOpacity>
          </>
        )}
        {phase === "paused" && (
          <>
            <TouchableOpacity
              style={[s.ctrlBtn, { backgroundColor: colors.primary }]}
              onPress={handleResume}
            >
              <Ionicons name="play" size={16} color={colors.textOnPrimary} />
              <Text style={s.ctrlTextDark}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctrlBtnGhost} onPress={handleEnd}>
              <Ionicons name="stop" size={16} color={colors.textPrimary} />
              <Text style={s.ctrlTextLight}>End workout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
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
  wkName: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  wkSub: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  setBadge: {
    backgroundColor: colors.surface,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  setNum: { fontSize: 16, fontWeight: "800" },
  setPlus: { color: colors.textTertiary, fontSize: 14 },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  readyCenter: { alignItems: "center", gap: 4 },
  readyText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },
  readySub: { color: colors.textTertiary, fontSize: 13 },
  timeText: { color: colors.textPrimary, fontSize: 42, fontWeight: "800" },
  timeLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
  },
  statItem: { alignItems: "center" },
  statVal: { color: colors.textPrimary, fontSize: 22, fontWeight: "700" },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDiv: { width: 1, height: 32, backgroundColor: colors.border },
  tileRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  tileVal: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  tileLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  ctrlBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlBtnGhost: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctrlTextDark: {
    color: colors.textOnPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  ctrlTextLight: { color: colors.textPrimary, fontWeight: "700", fontSize: 14 },
});
