import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useWorkoutStore } from "@/store/workout";
import { useWorkoutTimer, formatTime } from "@/hooks/useWorkoutTimer";

type WorkoutPhase = "ready" | "active" | "paused";

export default function ActiveWorkoutScreen() {
  const { name, type } = useLocalSearchParams<{
    name: string;
    type: "lift" | "run" | "race";
  }>();
  const {
    isActive,
    isPaused,
    elapsedSeconds,
    setsCompleted,
    calories,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    endWorkout,
    resetWorkout,
  } = useWorkoutStore();
  const [phase, setPhase] = useState<WorkoutPhase>("ready");

  useWorkoutTimer();

  // Reset on mount so timer is always 0 when arriving at this screen
  useEffect(() => {
    resetWorkout();
    return () => {};
  }, []);

  const accentColor = { lift: "#7ED957", run: "#5B9CF6", race: "#F97316" }[
    type || "lift"
  ];
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
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack}>
          <Text style={s.backIcon}>‹</Text>
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
          <Text style={[s.setNum, { color: accentColor }]}>5</Text>
          <Text style={s.setPlus}>+</Text>
          <Text style={[s.setNum, { color: "#5A5A5A" }]}>1</Text>
        </View>
      </View>

      {/* Timer ring */}
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
            stroke="#1E1E1E"
            strokeWidth={sw}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={accentColor}
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
              <Text style={s.readyEmoji}>
                {type === "lift" ? "🏋️" : type === "run" ? "🏃" : "🏁"}
              </Text>
              <Text style={s.readyText}>Ready</Text>
              <Text style={s.readySub}>Tap Start to begin</Text>
            </View>
          ) : (
            <>
              <Text style={s.timeText}>{formatTime(elapsedSeconds)}</Text>
              <Text style={s.timeLabel}>
                {phase === "paused" ? "⏸ Paused" : "Workout duration"}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Stats */}
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

      {/* Info tiles */}
      <View style={s.tileRow}>
        <View style={s.tile}>
          <Text style={s.tileVal}>5+1</Text>
          <Text style={s.tileLabel}>Hybrid build</Text>
        </View>
        <View style={s.tile}>
          <Text style={[s.tileVal, { color: accentColor }]}>
            {phase === "ready"
              ? "—"
              : String(
                  Math.max(0, 2 - Math.floor(elapsedSeconds / 60))
                ).padStart(2, "0")}
          </Text>
          <Text style={s.tileLabel}>Countdown</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        {phase === "ready" && (
          <TouchableOpacity
            style={[s.ctrlBtn, { backgroundColor: accentColor }]}
            onPress={handleStart}
          >
            <Text style={s.ctrlTextDark}>▶ Start Workout</Text>
          </TouchableOpacity>
        )}
        {phase === "active" && (
          <>
            <TouchableOpacity
              style={[s.ctrlBtn, { backgroundColor: accentColor }]}
              onPress={handlePause}
            >
              <Text style={s.ctrlTextDark}>⏸ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctrlBtnGhost} onPress={handleEnd}>
              <Text style={s.ctrlTextLight}>⏹ End workout</Text>
            </TouchableOpacity>
          </>
        )}
        {phase === "paused" && (
          <>
            <TouchableOpacity
              style={[s.ctrlBtn, { backgroundColor: accentColor }]}
              onPress={handleResume}
            >
              <Text style={s.ctrlTextDark}>▶ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctrlBtnGhost} onPress={handleEnd}>
              <Text style={s.ctrlTextLight}>⏹ End workout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
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
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  wkName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  wkSub: { color: "#9A9A9A", fontSize: 12, marginTop: 1 },
  setBadge: {
    backgroundColor: "#1E1E1E",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  setNum: { fontSize: 16, fontWeight: "800" },
  setPlus: { color: "#5A5A5A", fontSize: 14 },
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
  readyEmoji: { fontSize: 40, marginBottom: 4 },
  readyText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  readySub: { color: "#5A5A5A", fontSize: 13 },
  timeText: { color: "#fff", fontSize: 42, fontWeight: "800" },
  timeLabel: {
    color: "#5A5A5A",
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
  statVal: { color: "#fff", fontSize: 22, fontWeight: "700" },
  statLabel: {
    color: "#5A5A5A",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDiv: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.1)" },
  tileRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tileVal: { color: "#fff", fontSize: 20, fontWeight: "700" },
  tileLabel: {
    color: "#5A5A5A",
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
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlBtnGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "transparent",
  },
  ctrlTextDark: { color: "#0D0D0D", fontWeight: "700", fontSize: 14 },
  ctrlTextLight: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
