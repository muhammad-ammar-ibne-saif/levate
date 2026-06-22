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
import { colors, radius, spacing } from "@/lib/theme";
import api from "@/lib/api";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  totalWorkouts: number;
  newSignups7d: number;
  recentSignups: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/api/admin/dashboard");
      setStats(data);
    } catch {
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

  const cards: { label: string; value: number; icon: IconName }[] = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "people-outline",
    },
    {
      label: "Active Today",
      value: stats?.activeToday || 0,
      icon: "pulse-outline",
    },
    {
      label: "Total Workouts",
      value: stats?.totalWorkouts || 0,
      icon: "barbell-outline",
    },
    {
      label: "New (7 days)",
      value: stats?.newSignups7d || 0,
      icon: "person-add-outline",
    },
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

          <View style={s.actionsRow}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => router.push("/app/admin/users")}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={s.actionText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => router.push("/app/admin/broadcast")}
            >
              <Ionicons
                name="megaphone-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={s.actionText}>Broadcast</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionTitle}>Recent Signups</Text>
          <View style={s.signupList}>
            {(stats?.recentSignups || []).map((u) => (
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
                    {(u.firstName[0] || "") + (u.lastName[0] || "")}
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
            ))}
            {(!stats?.recentSignups || stats.recentSignups.length === 0) && (
              <Text style={s.emptyText}>No recent signups.</Text>
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
  statValue: { color: colors.textPrimary, fontSize: 24, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
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
