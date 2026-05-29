import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "@/lib/api";

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersToday: number;
    newUsersWeek: number;
    newUsersMonth: number;
    totalWorkouts: number;
    workoutsToday: number;
    workoutsWeek: number;
    activeUsersThisWeek: number;
    totalNotifications: number;
  };
  recentSignups: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  }[];
}

function StatCard({ label, value, sub, color = "#7ED957" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <View style={sc.card}>
      <Text style={[sc.val, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      {sub && <Text style={sc.sub}>{sub}</Text>}
    </View>
  );
}

const sc = StyleSheet.create({
  card: { flex: 1, backgroundColor: "#1E1E1E", borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", minWidth: "45%" },
  val: { fontSize: 28, fontWeight: "800", lineHeight: 32 },
  label: { color: "#9A9A9A", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4, textAlign: "center" },
  sub: { color: "#5A5A5A", fontSize: 11, marginTop: 2 },
});

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await api.get("/api/admin/dashboard");
      setData(d);
    } catch (err: any) {
      if (err.response?.status === 403) {
        Alert.alert("Access Denied", "You don't have admin privileges.");
        router.back();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const sendToAll = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      Alert.alert("Error", "Please enter both title and message.");
      return;
    }
    Alert.alert(
      "Send to All Users?",
      `"${notifTitle}" will be sent to all users.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            setSending(true);
            try {
              const { data: r } = await api.post("/api/admin/notify-all", {
                title: notifTitle, body: notifBody, type: "system",
              });
              Alert.alert("Sent!", r.message);
              setNotifTitle(""); setNotifBody("");
            } catch {
              Alert.alert("Error", "Failed to send notifications.");
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "just now";
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Admin Panel</Text>
          <Text style={s.subtitle}>Team L-Evate</Text>
        </View>
        <TouchableOpacity
          style={s.usersBtn}
          onPress={() => router.push("/app/admin/users")}
        >
          <Text style={s.usersBtnText}>Users →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#7ED957" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7ED957" />
          }
        >
          {/* Users stats */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>👥 Users</Text>
            <View style={s.grid}>
              <StatCard label="Total Users"   value={data?.stats.totalUsers || 0} color="#7ED957" />
              <StatCard label="New Today"     value={data?.stats.newUsersToday || 0} color="#5B9CF6" />
              <StatCard label="This Week"     value={data?.stats.newUsersWeek || 0} color="#F97316" />
              <StatCard label="Active / Week" value={data?.stats.activeUsersThisWeek || 0} color="#A855F7" />
            </View>
          </View>

          {/* Workout stats */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>🏋️ Workouts</Text>
            <View style={s.grid}>
              <StatCard label="Total Sessions" value={data?.stats.totalWorkouts || 0} color="#7ED957" />
              <StatCard label="Today"          value={data?.stats.workoutsToday || 0} color="#5B9CF6" />
              <StatCard label="This Week"      value={data?.stats.workoutsWeek || 0} color="#F97316" />
              <StatCard label="Notifications"  value={data?.stats.totalNotifications || 0} color="#A855F7" />
            </View>
          </View>

          {/* Recent signups */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>🆕 Recent Signups</Text>
            <View style={s.listCard}>
              {data?.recentSignups.length === 0 && (
                <Text style={s.emptyText}>No users yet</Text>
              )}
              {data?.recentSignups.map((u, i) => (
                <TouchableOpacity
                  key={u._id}
                  style={[s.userRow, i < (data.recentSignups.length - 1) && s.rowBorder]}
                  onPress={() => router.push({ pathname: "/app/admin/user-detail", params: { id: u._id } })}
                >
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>
                      {(u.firstName[0] || "") + (u.lastName[0] || "")}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{u.firstName} {u.lastName}</Text>
                    <Text style={s.userEmail}>{u.email}</Text>
                  </View>
                  <Text style={s.userTime}>{timeAgo(u.createdAt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={s.viewAllBtn}
              onPress={() => router.push("/app/admin/users")}
            >
              <Text style={s.viewAllText}>View all users →</Text>
            </TouchableOpacity>
          </View>

          {/* Broadcast notification */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>📢 Broadcast Notification</Text>
            <View style={s.notifCard}>
              <Text style={s.inputLabel}>Title</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. New workout available!"
                placeholderTextColor="#3A3A3A"
                value={notifTitle}
                onChangeText={setNotifTitle}
              />
              <Text style={s.inputLabel}>Message</Text>
              <TextInput
                style={[s.input, s.inputMulti]}
                placeholder="e.g. Check out this week's new program updates."
                placeholderTextColor="#3A3A3A"
                value={notifBody}
                onChangeText={setNotifBody}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[s.sendBtn, sending && { opacity: 0.6 }]}
                onPress={sendToAll}
                disabled={sending}
              >
                {sending
                  ? <ActivityIndicator color="#0D0D0D" size="small" />
                  : <Text style={s.sendBtnText}>📢 Send to All Users</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.1)" },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1E1E1E", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  subtitle: { color: "#5A5A5A", fontSize: 12, marginTop: 1 },
  usersBtn: { backgroundColor: "rgba(126,217,87,0.1)", borderWidth: 0.5, borderColor: "rgba(126,217,87,0.3)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  usersBtnText: { color: "#7ED957", fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionLabel: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  listCard: { backgroundColor: "#1E1E1E", borderRadius: 16, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(126,217,87,0.12)", borderWidth: 0.5, borderColor: "rgba(126,217,87,0.3)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#7ED957", fontWeight: "800", fontSize: 13 },
  userName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  userEmail: { color: "#5A5A5A", fontSize: 12, marginTop: 1 },
  userTime: { color: "#5A5A5A", fontSize: 11 },
  viewAllBtn: { marginTop: 10, alignItems: "center", paddingVertical: 8 },
  viewAllText: { color: "#7ED957", fontSize: 13, fontWeight: "600" },
  emptyText: { color: "#5A5A5A", textAlign: "center", padding: 20, fontSize: 13 },
  notifCard: { backgroundColor: "#1E1E1E", borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" },
  inputLabel: { color: "#9A9A9A", fontSize: 12, fontWeight: "500", marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#2A2A2A", borderRadius: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", padding: 12, color: "#fff", fontSize: 14 },
  inputMulti: { height: 80, textAlignVertical: "top" },
  sendBtn: { backgroundColor: "#7ED957", borderRadius: 50, paddingVertical: 14, alignItems: "center", marginTop: 14 },
  sendBtnText: { color: "#0D0D0D", fontWeight: "700", fontSize: 14 },
});
