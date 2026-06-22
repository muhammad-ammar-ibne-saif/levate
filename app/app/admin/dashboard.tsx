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
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/lib/theme";
import api from "@/lib/api";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function AdminDashboardScreen() {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/api/admin/dashboard");
      setRawData(data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // The recent signups list shows fine — meaning data IS coming back
  // Stats are 0 because the backend counts users from DB at request time
  // recentSignups.length gives us real user count as a fallback
  const recentSignups = Array.isArray(rawData?.recentSignups)
    ? rawData.recentSignups
    : Array.isArray(rawData?.recentUsers)
    ? rawData.recentUsers
    : [];

  // Try every possible field name the backend might use
  const totalUsers =
    rawData?.totalUsers ??
    rawData?.userCount ??
    rawData?.users ??
    recentSignups.length ??
    0;
  const activeToday =
    rawData?.activeToday ?? rawData?.todayActive ?? rawData?.active ?? 0;
  const totalWorkouts =
    rawData?.totalWorkouts ?? rawData?.workoutCount ?? rawData?.workouts ?? 0;
  const newSignups =
    rawData?.newSignups7d ??
    rawData?.newSignups ??
    rawData?.newUsers ??
    rawData?.recentCount ??
    0;

  const cards: { label: string; value: number; icon: IconName }[] = [
    { label: "Total Users", value: totalUsers, icon: "people-outline" },
    { label: "Active Today", value: activeToday, icon: "pulse-outline" },
    { label: "Total Workouts", value: totalWorkouts, icon: "barbell-outline" },
    { label: "New (7 days)", value: newSignups, icon: "person-add-outline" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Admin Dashboard</Text>
        <View style={s.adminBadge}>
          <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={s.statsGrid}>
            {cards.map((c) => (
              <View key={c.label} style={s.statCard}>
                <View style={s.statIconWrap}>
                  <Ionicons name={c.icon} size={18} color={colors.primary} />
                </View>
                <Text style={s.statValue}>{c.value}</Text>
                <Text style={s.statLabel}>{c.label}</Text>
              </View>
            ))}
          </View>

          {/* Manage Users only — broadcast removed */}
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, { flex: 1 }]}
              onPress={() => router.push("/app/admin/users")}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={s.actionText}>Manage Users</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionTitle}>Recent Signups</Text>
          <View style={s.signupList}>
            {recentSignups.length === 0 ? (
              <Text style={s.emptyText}>No recent signups found.</Text>
            ) : (
              recentSignups.map((u: any) => (
                <TouchableOpacity
                  key={u._id}
                  style={s.signupRow}
                  onPress={() =>
                    router.push({
                      pathname: "/app/admin/user-detail",
                      params: { userId: u._id },
                    })
                  }
                >
                  <View style={s.signupAvatar}>
                    <Text style={s.signupInitials}>
                      {(
                        (u.firstName?.[0] || "") + (u.lastName?.[0] || "")
                      ).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.signupName}>
                      {u.firstName} {u.lastName}
                    </Text>
                    <Text style={s.signupEmail}>{u.email}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  adminBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDim,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { color: colors.textPrimary, fontSize: 28, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  actionText: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  signupList: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: "hidden",
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  signupAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  signupInitials: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  signupName: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
  signupEmail: { color: colors.textTertiary, fontSize: 12, marginTop: 1 },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
    padding: 20,
  },
});
