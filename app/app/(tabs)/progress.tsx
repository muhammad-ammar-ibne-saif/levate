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
import { colors, radius, spacing } from "@/lib/theme";
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

      const { data: histData } = await api.get("/api/workouts/history");
      const sessions = histData.sessions || [];

      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const completedDays = DAYS.map((_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        return sessions.some((sess: any) => {
          const d = new Date(sess.createdAt);
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
    return d === 0 ? 6 : d - 1;
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
            tintColor={colors.primary}
          />
        }
      >
        <View style={s.topRow}>
          <Text style={s.heading}>Your Progress</Text>
          <Text style={s.weekly}>Weekly</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
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
                              color: colors.textOnPrimary,
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

            <View style={s.perfWrap}>
              <Text style={s.perfSub}>
                See how your strength, endurance, and consistency are improving
                over time.
              </Text>
              <Text style={s.perfTitle}>Track your performance</Text>

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

              <View style={s.barsRow}>
                {bars.map((h, i) => (
                  <View key={i} style={s.barCol}>
                    <View
                      style={[
                        s.bar,
                        {
                          height: Math.max((h / max) * 72, h > 0 ? 6 : 3),
                          backgroundColor:
                            h > 0 ? colors.primary : colors.surfaceAlt,
                          opacity: h > 0 ? 1 : 0.35,
                        },
                      ]}
                    />
                    <Text style={s.barLabel}>W{i + 1}</Text>
                  </View>
                ))}
              </View>
            </View>

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

            {stats.totalDuration === 0 && (
              <View style={s.emptyHint}>
                <Text style={s.emptyText}>
                  Complete your first workout to see progress here.
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
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  weekly: { color: colors.primary, fontSize: 12, fontWeight: "600" },
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
  ringPct: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38,
  },
  ringWeek: { color: colors.textTertiary, fontSize: 11, marginTop: 4 },
  userName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
  userHandle: {
    color: colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  calWrap: { paddingHorizontal: 20, marginBottom: 20 },
  calLabel: { color: colors.textSecondary, fontSize: 12, marginBottom: 10 },
  calRow: { flexDirection: "row", justifyContent: "space-between" },
  calDay: { alignItems: "center", gap: 6 },
  calDayLabel: { color: colors.textTertiary, fontSize: 10 },
  calDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  calDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  calDotToday: { borderColor: colors.primary, backgroundColor: "transparent" },
  perfWrap: { paddingHorizontal: 20 },
  perfSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  perfTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -0.5,
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textTertiary, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: colors.primary },
  barsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    height: 90,
    marginBottom: 20,
  },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  bar: { width: "100%", borderRadius: 4 },
  barLabel: { color: colors.textTertiary, fontSize: 10 },
  statsWrap: { paddingHorizontal: 20, paddingBottom: 16 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  statBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  statLabel: { color: colors.textSecondary, fontSize: 13 },
  statVal: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  emptyHint: { alignItems: "center", paddingHorizontal: 40, paddingBottom: 32 },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
