import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

const workouts = [
  {
    num: 1,
    tag: "Lift · Today",
    name: "Lower Power + Carries",
    meta: "~45 min · 5+1 sets",
    today: true,
    type: "lift" as const,
  },
  {
    num: 2,
    tag: "Run · Today",
    name: "Threshold Builder Run",
    meta: "~35 min · Zone 3–4",
    today: true,
    type: "run" as const,
  },
  {
    num: 3,
    tag: "Lift · Wed",
    name: "Upper Hypertrophy",
    meta: "~50 min · 4 sets",
    today: false,
    type: "lift" as const,
  },
  {
    num: 4,
    tag: "Run · Thu",
    name: "Easy Recovery Run",
    meta: "~25 min · Zone 1–2",
    today: false,
    type: "run" as const,
  },
  {
    num: 5,
    tag: "Race · Sat",
    name: "Race Prep + Adaptive",
    meta: "~30 min · Full effort",
    today: false,
    type: "race" as const,
  },
];

const typeColors = { lift: "#7ED957", run: "#5B9CF6", race: "#F97316" };

export default function ProgramScreen() {
  const [selectedDays, setSelectedDays] = useState(4);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>The Program</Text>
        </View>

        <View style={s.content}>
          {/* Tag */}
          <View style={s.tag}>
            <Text style={s.tagText}>Hybrid Foundation</Text>
          </View>

          <Text style={s.title}>8-Week Hybrid Foundation</Text>
          <Text style={s.subtitle}>Build → Deload → Intensify → Peak</Text>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { val: "8", label: "Weeks" },
              { val: "3–6", label: "Days/wk" },
              { val: "100%", label: "Mobile" },
            ].map((st, i) => (
              <View key={st.label} style={[s.statCard, i < 2 && s.statBorder]}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* Days selector */}
          <Text style={s.selectorLabel}>Choose days per week</Text>
          <View style={s.daysRow}>
            {[3, 4, 5, 6].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDays(d)}
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
              </TouchableOpacity>
            ))}
          </View>

          {/* Week heading */}
          <Text style={s.weekLabel}>Week 5 — Build Phase</Text>

          {/* Workout rows */}
          <View style={s.workoutList}>
            {workouts.map((w) => (
              <TouchableOpacity
                key={w.num}
                activeOpacity={0.75}
                style={s.workoutRow}
                onPress={() =>
                  router.push({
                    pathname: "/app/workout/active",
                    params: { name: w.name, type: w.type },
                  })
                }
              >
                <View style={[s.numCircle, w.today && s.numCircleActive]}>
                  <Text style={[s.numText, w.today && s.numTextActive]}>
                    {w.num}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      s.wTag,
                      { color: w.today ? typeColors[w.type] : "#5A5A5A" },
                    ]}
                  >
                    {w.tag}
                  </Text>
                  <Text style={s.wName}>{w.name}</Text>
                  <Text style={s.wMeta}>{w.meta}</Text>
                </View>
                <TouchableOpacity
                  style={[s.startBtn, w.today && s.startBtnActive]}
                  onPress={() =>
                    router.push({
                      pathname: "/app/workout/active",
                      params: { name: w.name, type: w.type },
                    })
                  }
                >
                  <Text
                    style={[s.startBtnText, w.today && s.startBtnTextActive]}
                  >
                    Start
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label="Start Today's Workout"
            onPress={() =>
              router.push({
                pathname: "/app/workout/active",
                params: { name: "Lower Power + Carries", type: "lift" },
              })
            }
          />
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
    marginBottom: 20,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statBorder: {
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  statVal: { color: "#fff", fontSize: 20, fontWeight: "700" },
  statLabel: {
    color: "#5A5A5A",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  selectorLabel: { color: "#9A9A9A", fontSize: 12, marginBottom: 10 },
  daysRow: { flexDirection: "row", gap: 8, marginBottom: 22 },
  dayPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  dayPillActive: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
  dayPillText: { color: "#9A9A9A", fontWeight: "700", fontSize: 14 },
  dayPillTextActive: { color: "#0D0D0D" },
  weekLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
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
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numCircleActive: { backgroundColor: "#7ED957" },
  numText: { color: "#9A9A9A", fontWeight: "700", fontSize: 14 },
  numTextActive: { color: "#0D0D0D" },
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
    backgroundColor: "#2A2A2A",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  startBtnActive: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
  startBtnText: { color: "#9A9A9A", fontSize: 12, fontWeight: "700" },
  startBtnTextActive: { color: "#0D0D0D" },
});
