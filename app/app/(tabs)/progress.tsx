import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Tab = "Strength" | "Endurance" | "Consistency";

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>("Strength");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    week: 1,
    totalWeeks: 8,
    percentage: 13,
    totalDuration: 0,
    totalCalories: 0,
    totalSets: 0,
    completedDays: [false, false, false, false, false, false, false],
    barData: {
      Strength: [0, 0, 0, 0, 0, 0, 0, 0],
      Endurance: [0, 0, 0, 0, 0, 0, 0, 0],
      Consistency: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  });

  const fetchProgress = async () => {
    try {
      const { data } = await api.get("/api/workouts/progress");

      const byWeek = data.byWeek || {};
      const currentWeek = data.currentWeek || 1;
      const totalWeeks = 8;
      const percentage = Math.round((currentWeek / totalWeeks) * 100);

      // Build bar arrays from real week data
      const strengthBars = Array(8).fill(0);
      const enduranceBars = Array(8).fill(0);
      const consistencyBars = Array(8).fill(0);

      Object.keys(byWeek).forEach((w) => {
        const idx = parseInt(w) - 1;
        if (idx >= 0 && idx < 8) {
          strengthBars[idx] = Math.min((byWeek[w].sets || 0) * 3, 72);
          enduranceBars[idx] = Math.min((byWeek[w].duration || 0) / 1.5, 72);
          consistencyBars[idx] = Math.min((byWeek[w].count || 0) * 18, 72);
        }
      });

      // Build real completed days for THIS week using session timestamps
      const { data: histData } = await api.get("/api/workouts/history");
      const sessions = histData.sessions || [];

      // Get start of this ISO week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const completedDays = DAYS.map((_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        return sessions.some((s: any) => {
          const d = new Date(s.createdAt);
          return d >= day && d < nextDay;
        });
      });

      setStats({
        week: currentWeek,
        totalWeeks,
        percentage,
        totalDuration: data.totalDuration || 0,
        totalCalories: data.totalCalories || 0,
        totalSets: data.totalSets || 0,
        completedDays,
        barData: {
          Strength: strengthBars,
          Endurance: enduranceBars,
          Consistency: consistencyBars,
        },
      });
    } catch {
      // Keep default empty state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    setRefreshing(false);
  };

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Athlete";
  const bars = stats.barData[tab];
  const max = Math.max(...bars, 1);

  const todayIndex = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
  })();

  const size = 160,
    sw = 12,
    r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (stats.percentage / 100) * circ;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7ED957"
          />
        }
      >
        {/* Header */}
        <View style={s.topRow}>
          <Text style={s.heading}>Your Progress</Text>
          <Text style={s.weekly}>Weekly</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#7ED957" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Progress ring */}
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
                  stroke="#7ED957"
                  strokeWidth={sw}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                />
              </Svg>
              <View style={s.ringCenter}>
                <Text style={s.ringPct}>{stats.percentage}%</Text>
                <Text style={s.ringWeek}>
                  Week {stats.week} of {stats.totalWeeks}
                </Text>
              </View>
            </View>

            <Text style={s.userName}>{fullName}</Text>
            <Text style={s.userHandle}>
              @{user?.email?.split("@")[0] || "athlete"}
            </Text>

            {/* Calendar — REAL data */}
            <View style={s.calWrap}>
              <Text style={s.calLabel}>This week's training</Text>
              <View style={s.calRow}>
                {DAYS.map((d, i) => {
                  const done = stats.completedDays[i];
                  const isToday = i === todayIndex;
                  return (
                    <View key={d} style={s.calDay}>
                      <Text style={s.calDayLabel}>{d}</Text>
                      <View
                        style={[
                          s.calDot,
                          done && s.calDotDone,
                          isToday && !done && s.calDotToday,
                        ]}
                      >
                        {done && (
                          <Text
                            style={{
                              color: "#0D0D0D",
                              fontSize: 11,
                              fontWeight: "800",
                            }}
                          >
                            ✓
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Performance */}
            <View style={s.perfWrap}>
              <Text style={s.perfSub}>
                See how your strength, endurance, and consistency are improving
                over time.
              </Text>
              <Text style={s.perfTitle}>Track your performance</Text>

              {/* Tabs */}
              <View style={s.tabsRow}>
                {(["Strength", "Endurance", "Consistency"] as Tab[]).map(
                  (t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTab(t)}
                      style={[s.tabBtn, tab === t && s.tabBtnActive]}
                    >
                      <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Bars */}
              <View style={s.barsRow}>
                {bars.map((h, i) => (
                  <View key={i} style={s.barCol}>
                    <View
                      style={[
                        s.bar,
                        {
                          height: Math.max((h / max) * 72, h > 0 ? 6 : 3),
                          backgroundColor: h > 0 ? "#7ED957" : "#1E1E1E",
                          opacity: h > 0 ? 1 : 0.35,
                        },
                      ]}
                    />
                    <Text style={s.barLabel}>W{i + 1}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats */}
            <View style={s.statsWrap}>
              {[
                { label: "Duration", val: `${stats.totalDuration} min` },
                {
                  label: "Calories",
                  val: `${stats.totalCalories.toLocaleString()} kcal`,
                },
                { label: "Sets completed", val: `${stats.totalSets} sets` },
              ].map((st, i, arr) => (
                <View
                  key={st.label}
                  style={[s.statRow, i < arr.length - 1 && s.statBorder]}
                >
                  <Text style={s.statLabel}>{st.label}</Text>
                  <Text style={s.statVal}>{st.val}</Text>
                </View>
              ))}
            </View>

            {/* Empty state hint */}
            {stats.totalDuration === 0 && (
              <View style={s.emptyHint}>
                <Text style={s.emptyIcon}>🏋️</Text>
                <Text style={s.emptyText}>
                  Complete your first workout to see progress here!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: { color: "#fff", fontSize: 20, fontWeight: "700" },
  weekly: { color: "#7ED957", fontSize: 12, fontWeight: "600" },
  ringWrap: { alignItems: "center", marginTop: 16, position: "relative" },
  ringCenter: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPct: { color: "#fff", fontSize: 34, fontWeight: "800", lineHeight: 38 },
  ringWeek: { color: "#5A5A5A", fontSize: 11, marginTop: 4 },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
  userHandle: {
    color: "#5A5A5A",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  calWrap: { paddingHorizontal: 20, marginBottom: 20 },
  calLabel: { color: "#9A9A9A", fontSize: 12, marginBottom: 10 },
  calRow: { flexDirection: "row", justifyContent: "space-between" },
  calDay: { alignItems: "center", gap: 6 },
  calDayLabel: { color: "#5A5A5A", fontSize: 10 },
  calDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  calDotDone: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
  calDotToday: { borderColor: "#7ED957", backgroundColor: "transparent" },
  perfWrap: { paddingHorizontal: 20 },
  perfSub: { color: "#9A9A9A", fontSize: 13, lineHeight: 20, marginBottom: 12 },
  perfTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: 16,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -0.5,
  },
  tabBtnActive: { borderBottomColor: "#7ED957" },
  tabText: { color: "#5A5A5A", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#7ED957" },
  barsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    height: 90,
    marginBottom: 20,
  },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  bar: { width: "100%", borderRadius: 4 },
  barLabel: { color: "#5A5A5A", fontSize: 10 },
  statsWrap: { paddingHorizontal: 20, paddingBottom: 16 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  statBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  statLabel: { color: "#9A9A9A", fontSize: 13 },
  statVal: { color: "#fff", fontSize: 15, fontWeight: "700" },
  emptyHint: { alignItems: "center", paddingHorizontal: 40, paddingBottom: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: {
    color: "#5A5A5A",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
