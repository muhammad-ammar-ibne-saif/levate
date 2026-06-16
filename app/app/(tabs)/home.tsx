import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { useGreeting } from "@/hooks/useGreeting";
import { colors, radius, spacing } from "../../../lib/theme";
import api from "@/lib/api";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface WorkoutPlan {
  _id: string;
  name: string;
  type: "lift" | "run" | "race";
  duration: number;
  sets?: string;
  zone?: string;
}

const TYPE_ICON: Record<string, IconName> = {
  lift: "barbell-outline",
  run: "footsteps-outline",
  race: "flag-outline",
};

const FALLBACK_WORKOUTS = [
  {
    _id: "1",
    type: "lift" as const,
    tag: "Hybrid build",
    name: "Lower power + carries",
    meta: "Set 5+1 · ~45 min",
    badge: "Today",
  },
  {
    _id: "2",
    type: "run" as const,
    tag: "Run 1",
    name: "Threshold Builder Run",
    meta: "~35 min · Zone 3–4",
    badge: "Today",
  },
  {
    _id: "3",
    type: "race" as const,
    tag: "Race prep",
    name: "Race prep + adaptive progress",
    meta: "Tuesday · ~30 min",
    badge: "Tue",
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
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
        }));
        setWorkouts(mapped);
      }
    } catch {}
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
            tintColor={colors.primary}
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
            <Ionicons
              name="notifications-outline"
              size={19}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Week banner */}
        <View style={s.weekBanner}>
          <View style={{ flex: 1 }}>
            <Text style={s.weekLabel}>
              You're in Week {progress.week} of {progress.totalWeeks}, and your
            </Text>
            <Text style={s.weekTitle}>plan is moving forward.</Text>
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

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Today</Text>
          <TouchableOpacity onPress={() => router.push("/app/program")}>
            <Text style={s.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

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
              <View style={s.cardAccent} />
              <View style={s.cardIcon}>
                <Ionicons
                  name={TYPE_ICON[w.type]}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTag}>{w.tag}</Text>
                <Text style={s.cardName}>{w.name}</Text>
                <Text style={s.cardMeta}>{w.meta}</Text>
              </View>
              <View style={s.cardBadge}>
                <Text style={s.cardBadgeText}>{w.badge}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.primary}
              />
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
              style={s.btnPrimary}
              onPress={() => router.push("/app/workout/active")}
            >
              <Text style={s.btnPrimaryText}>Start workout</Text>
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

      <TouchableOpacity style={s.fab} onPress={() => router.push("/app/chat")}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={22}
          color={colors.textOnPrimary}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greeting: { color: colors.textSecondary, fontSize: 14 },
  name: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 2,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weekBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  weekLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  weekTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  weekNumBox: { marginLeft: 20, alignItems: "center" },
  weekNum: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
  },
  weekOf: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  sectionAction: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  cardsContainer: { paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDim,
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
    color: colors.primary,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardMeta: { color: colors.textSecondary, fontSize: 12 },
  cardBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.primaryDim,
  },
  cardBadgeText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  programCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 24,
  },
  programTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  programTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  programDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 220,
  },
  programArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDim,
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
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  badgeText: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
  programBtns: { flexDirection: "row", gap: 10 },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: colors.textOnPrimary,
    fontWeight: "700",
    fontSize: 13,
  },
  btnGhost: {
    flex: 1,
    backgroundColor: colors.button,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  btnGhostText: { color: colors.textPrimary, fontWeight: "500", fontSize: 13 },
  fab: {
    position: "absolute",
    bottom: 96,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
