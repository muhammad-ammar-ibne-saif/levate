import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useGreeting } from "@/hooks/useGreeting";
import api from "@/lib/api";

interface WorkoutPlan {
  _id: string;
  name: string;
  type: "lift" | "run" | "race";
  scheduledFor: string;
  duration: number;
  sets?: string;
  zone?: string;
}

const FALLBACK_WORKOUTS = [
  {
    _id: "1",
    type: "lift" as const,
    tag: "Hybrid build",
    name: "Lower power + carries",
    meta: "Set 5+1 · ~45 min",
    badge: "Today",
    color: "#7ED957",
    dimColor: "rgba(126,217,87,0.12)",
  },
  {
    _id: "2",
    type: "run" as const,
    tag: "Run 1",
    name: "Threshold Builder Run",
    meta: "~35 min · Zone 3–4",
    badge: "Today",
    color: "#5B9CF6",
    dimColor: "rgba(91,156,246,0.12)",
  },
  {
    _id: "3",
    type: "race" as const,
    tag: "Race prep",
    name: "Race prep + adaptive progress",
    meta: "Tuesday · ~30 min",
    badge: "Tue",
    color: "#F97316",
    dimColor: "rgba(249,115,22,0.12)",
  },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const greeting = useGreeting();
  const firstName = user?.firstName || user?.email?.split("@")[0] || "Athlete";
  const [workouts, setWorkouts] = useState(FALLBACK_WORKOUTS);
  const [progress, setProgress] = useState({
    week: 5,
    totalWeeks: 8,
    percentage: 62,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch workout progress
      const progRes = await api.get("/api/workouts/progress");
      if (progRes.data?.currentWeek) {
        setProgress({
          week: progRes.data.currentWeek,
          totalWeeks: progRes.data.totalWeeks || 8,
          percentage: Math.round(
            (progRes.data.currentWeek / (progRes.data.totalWeeks || 8)) * 100
          ),
        });
      }
      // Fetch today's plan
      const planRes = await api.get("/api/workouts/today");
      if (planRes.data?.workouts?.length > 0) {
        const mapped = planRes.data.workouts.map((w: WorkoutPlan) => ({
          _id: w._id,
          type: w.type,
          tag:
            w.type === "lift"
              ? "Hybrid build"
              : w.type === "run"
              ? "Run"
              : "Race prep",
          name: w.name,
          meta: `~${w.duration} min${w.sets ? ` · ${w.sets}` : ""}${
            w.zone ? ` · ${w.zone}` : ""
          }`,
          badge: "Today",
          color:
            w.type === "lift"
              ? "#7ED957"
              : w.type === "run"
              ? "#5B9CF6"
              : "#F97316",
          dimColor:
            w.type === "lift"
              ? "rgba(126,217,87,0.12)"
              : w.type === "run"
              ? "rgba(91,156,246,0.12)"
              : "rgba(249,115,22,0.12)",
        }));
        setWorkouts(mapped);
      }
    } catch {
      // Keep fallback data if API not available
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7ED957"
          />
        }
      >
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.name}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={s.notifBtn}
            onPress={() => router.push("/app/(tabs)/notifications")}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Week banner */}
        <View style={s.weekBanner}>
          <View style={{ flex: 1 }}>
            <Text style={s.weekLabel}>
              You're in Week {progress.week} of {progress.totalWeeks}, and your
            </Text>
            <Text style={s.weekTitle}>hybrid plan is moving forward.</Text>
            <View style={s.progressTrack}>
              <View
                style={[s.progressFill, { width: `${progress.percentage}%` }]}
              />
            </View>
          </View>
          <View style={s.weekNumBox}>
            <Text style={s.weekNum}>{progress.week}</Text>
            <Text style={s.weekOf}>of {progress.totalWeeks}</Text>
          </View>
        </View>

        {/* Today label */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Today</Text>
          <TouchableOpacity onPress={() => router.push("/app/program")}>
            <Text style={s.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Workout cards */}
        <View style={s.cardsContainer}>
          {workouts.map((w) => (
            <TouchableOpacity
              key={w._id}
              style={s.workoutCard}
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: "/app/workout/active",
                  params: { name: w.name, type: w.type },
                })
              }
            >
              <View style={[s.cardAccent, { backgroundColor: w.color }]} />
              <View style={[s.cardIcon, { backgroundColor: w.dimColor }]}>
                <Text style={{ fontSize: 18 }}>
                  {w.type === "lift" ? "🏋️" : w.type === "run" ? "🏃" : "🏁"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTag, { color: w.color }]}>{w.tag}</Text>
                <Text style={s.cardName}>{w.name}</Text>
                <Text style={s.cardMeta}>{w.meta}</Text>
              </View>
              <View style={[s.cardBadge, { backgroundColor: w.dimColor }]}>
                <Text style={[s.cardBadgeText, { color: w.color }]}>
                  {w.badge}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Program card */}
        <Text
          style={[s.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}
        >
          The program
        </Text>
        <TouchableOpacity
          style={s.programCard}
          activeOpacity={0.75}
          onPress={() => router.push("/app/program")}
        >
          <View style={s.programTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.programTitle}>8-Week Hybrid Foundation</Text>
              <Text style={s.programDesc}>
                One block. Build → Deload → Intensify → Peak. Choose 3, 4, 5 or
                6 days a week.
              </Text>
            </View>
            <View style={s.programArrow}>
              <Text style={{ color: "#7ED957", fontSize: 20 }}>›</Text>
            </View>
          </View>
          <View style={s.badgeRow}>
            {["3–6 days/week", "8 weeks", "100% phone-friendly"].map((b) => (
              <View key={b} style={s.badge}>
                <Text style={s.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={s.programBtns}>
            <TouchableOpacity
              style={s.btnGreen}
              onPress={() => router.push("/app/workout/active")}
            >
              <Text style={s.btnGreenText}>Start workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnGhost}
              onPress={() => router.push("/app/program")}
            >
              <Text style={s.btnGhostText}>The program</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* FAB chat */}
      <TouchableOpacity style={s.fab} onPress={() => router.push("/app/chat")}>
        <Text style={{ color: "#0D0D0D", fontSize: 22 }}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greeting: { color: "#9A9A9A", fontSize: 14 },
  name: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 2 },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  weekBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  weekLabel: {
    color: "#5A5A5A",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  weekTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#2A2A2A",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: "#7ED957", borderRadius: 2 },
  weekNumBox: { marginLeft: 20, alignItems: "center" },
  weekNum: {
    color: "#7ED957",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
  },
  weekOf: { color: "#5A5A5A", fontSize: 11, marginTop: 2 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionAction: { color: "#7ED957", fontSize: 12, fontWeight: "600" },
  cardsContainer: { paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  workoutCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  cardName: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 3 },
  cardMeta: { color: "#9A9A9A", fontSize: 12 },
  cardBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  cardBadgeText: { fontSize: 11, fontWeight: "700" },
  programCard: {
    marginHorizontal: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 24,
  },
  programTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  programTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  programDesc: {
    color: "#9A9A9A",
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 220,
  },
  programArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(126,217,87,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: { color: "#9A9A9A", fontSize: 11, fontWeight: "600" },
  programBtns: { flexDirection: "row", gap: 10 },
  btnGreen: {
    flex: 1,
    backgroundColor: "#7ED957",
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnGreenText: { color: "#0D0D0D", fontWeight: "700", fontSize: 13 },
  btnGhost: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  btnGhostText: { color: "#fff", fontWeight: "500", fontSize: 13 },
  fab: {
    position: "absolute",
    bottom: 96,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7ED957",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
