import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import api from "@/lib/api";

interface UserDetail {
  user: {
    _id: string; firstName: string; lastName: string;
    email: string; mobile: string; isAdmin: boolean;
    currentWeek: number; currentProgram: string;
    goals: string[]; createdAt: string;
    notificationsEnabled: boolean;
  };
  sessions: {
    _id: string; name: string; type: string;
    durationMinutes: number; calories: number;
    setsCompleted: number; week: number; createdAt: string;
  }[];
  notifications: {
    _id: string; title: string; body: string;
    type: string; read: boolean; createdAt: string;
  }[];
  summary: {
    totalWorkouts: number; totalMinutes: number;
    totalCalories: number; totalSets: number;
  };
}

const TYPE_COLOR: Record<string, string> = {
  lift: "#7ED957", run: "#5B9CF6", race: "#F97316",
};

export default function AdminUserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "workouts" | "notifications">("overview");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/api/admin/users/${id}`)
      .then(r => setData(r.data))
      .catch(() => Alert.alert("Error", "Failed to load user."))
      .finally(() => setLoading(false));
  }, [id]);

  const sendNotif = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      Alert.alert("Error", "Enter title and message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/api/admin/notify-user", {
        userId: id, title: notifTitle, body: notifBody, type: "system",
      });
      Alert.alert("Sent!", "Notification delivered.");
      setNotifTitle(""); setNotifBody("");
    } catch {
      Alert.alert("Error", "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  const deleteUser = () => {
    Alert.alert(
      "Delete User",
      `Delete ${data?.user.firstName} and all their data? Cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/admin/users/${id}`);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete.");
            }
          },
        },
      ]
    );
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator color="#7ED957" style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  const u = data?.user;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>User Detail</Text>
        {u && !u.isAdmin && (
          <TouchableOpacity style={s.delBtn} onPress={deleteUser}>
            <Text style={s.delText}>🗑 Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(u?.firstName[0] || "") + (u?.lastName[0] || "")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>{u?.firstName} {u?.lastName}</Text>
            {u?.isAdmin && <Text style={s.adminTag}>Admin</Text>}
          </View>
          <Text style={s.email}>{u?.email}</Text>
          <Text style={s.joined}>Joined {u ? fmt(u.createdAt) : ""}</Text>
        </View>
      </View>

      {/* Summary stats */}
      <View style={s.statsRow}>
        {[
          { label: "Workouts", val: data?.summary.totalWorkouts || 0, color: "#7ED957" },
          { label: "Minutes",  val: data?.summary.totalMinutes  || 0, color: "#5B9CF6" },
          { label: "Calories", val: data?.summary.totalCalories || 0, color: "#F97316" },
          { label: "Sets",     val: data?.summary.totalSets     || 0, color: "#A855F7" },
        ].map(st => (
          <View key={st.label} style={s.statCard}>
            <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(["overview", "workouts", "notifications"] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)}
            style={[s.tab, activeTab === t && s.tabActive]}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            <View style={s.infoCard}>
              {[
                { label: "Program",      val: u?.currentProgram || "—" },
                { label: "Current Week", val: `Week ${u?.currentWeek || 1} of 8` },
                { label: "Goals",        val: (u?.goals || []).join(", ") || "—" },
                { label: "Mobile",       val: u?.mobile || "Not set" },
                { label: "Push Notifs",  val: u?.notificationsEnabled ? "Enabled" : "Disabled" },
              ].map((item, i, arr) => (
                <View key={item.label} style={[s.infoRow, i < arr.length - 1 && s.infoBorder]}>
                  <Text style={s.infoLabel}>{item.label}</Text>
                  <Text style={s.infoVal}>{item.val}</Text>
                </View>
              ))}
            </View>

            {/* Send notification to this user */}
            <Text style={s.sectionTitle}>Send Notification</Text>
            <View style={s.notifCard}>
              <Text style={s.inputLabel}>Title</Text>
              <TextInput style={s.input} placeholder="Notification title"
                placeholderTextColor="#3A3A3A" value={notifTitle} onChangeText={setNotifTitle} />
              <Text style={s.inputLabel}>Message</Text>
              <TextInput style={[s.input, { height: 70, textAlignVertical: "top" }]}
                placeholder="Notification message" placeholderTextColor="#3A3A3A"
                value={notifBody} onChangeText={setNotifBody} multiline />
              <TouchableOpacity style={[s.sendBtn, sending && { opacity: 0.6 }]}
                onPress={sendNotif} disabled={sending}>
                {sending
                  ? <ActivityIndicator color="#0D0D0D" size="small" />
                  : <Text style={s.sendBtnText}>Send Notification</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── WORKOUTS TAB ── */}
        {activeTab === "workouts" && (
          <>
            {data?.sessions.length === 0 && (
              <Text style={s.emptyText}>No workouts completed yet.</Text>
            )}
            {data?.sessions.map((session, i) => (
              <View key={session._id}
                style={[s.sessionCard, i < (data.sessions.length - 1) && s.sessionBorder]}>
                <View style={[s.sessionDot, { backgroundColor: TYPE_COLOR[session.type] || "#9A9A9A" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.sessionName}>{session.name}</Text>
                  <Text style={s.sessionMeta}>
                    {session.durationMinutes} min · {session.calories} kcal · {session.setsCompleted} sets · Week {session.week}
                  </Text>
                  <Text style={s.sessionDate}>{fmt(session.createdAt)}</Text>
                </View>
                <View style={[s.typeBadge, { backgroundColor: `${TYPE_COLOR[session.type]}18` }]}>
                  <Text style={[s.typeBadgeText, { color: TYPE_COLOR[session.type] || "#9A9A9A" }]}>
                    {session.type}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === "notifications" && (
          <>
            {data?.notifications.length === 0 && (
              <Text style={s.emptyText}>No notifications yet.</Text>
            )}
            {data?.notifications.map((n, i) => (
              <View key={n._id}
                style={[s.notifRow, i < (data.notifications.length - 1) && s.notifBorder]}>
                <View style={s.notifDot}>
                  <Text style={{ fontSize: 14 }}>
                    {n.type === "workout" ? "⚡" : n.type === "streak" ? "⭐" : "🔔"}
                  </Text>
                  {!n.read && <View style={s.unreadDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.notifTitle}>{n.title}</Text>
                  <Text style={s.notifBody}>{n.body}</Text>
                  <Text style={s.notifDate}>{fmt(n.createdAt)}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.1)" },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1E1E1E", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  title: { color: "#fff", fontSize: 18, fontWeight: "800", flex: 1 },
  delBtn: { backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 0.5, borderColor: "rgba(239,68,68,0.25)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  delText: { color: "#EF4444", fontSize: 12, fontWeight: "600" },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.1)" },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(126,217,87,0.12)", borderWidth: 1.5, borderColor: "#7ED957", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#7ED957", fontWeight: "800", fontSize: 18 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: "#fff", fontSize: 16, fontWeight: "700" },
  adminTag: { backgroundColor: "rgba(249,115,22,0.12)", color: "#F97316", fontSize: 10, fontWeight: "700", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  email: { color: "#9A9A9A", fontSize: 13, marginTop: 2 },
  joined: { color: "#5A5A5A", fontSize: 11, marginTop: 3 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, gap: 8, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.1)" },
  statCard: { flex: 1, backgroundColor: "#1E1E1E", borderRadius: 10, padding: 10, alignItems: "center", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)" },
  statVal: { fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#5A5A5A", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 2 },
  tabs: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.1)" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#7ED957" },
  tabText: { color: "#5A5A5A", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#7ED957" },
  infoCard: { backgroundColor: "#1E1E1E", borderRadius: 14, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", marginBottom: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  infoBorder: { borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  infoLabel: { color: "#9A9A9A", fontSize: 13 },
  infoVal: { color: "#fff", fontSize: 13, fontWeight: "500", maxWidth: "55%", textAlign: "right" },
  sectionTitle: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 10 },
  notifCard: { backgroundColor: "#1E1E1E", borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" },
  inputLabel: { color: "#9A9A9A", fontSize: 12, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: "#2A2A2A", borderRadius: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", padding: 12, color: "#fff", fontSize: 14 },
  sendBtn: { backgroundColor: "#7ED957", borderRadius: 50, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  sendBtnText: { color: "#0D0D0D", fontWeight: "700", fontSize: 14 },
  emptyText: { color: "#5A5A5A", textAlign: "center", marginTop: 40, fontSize: 14 },
  sessionCard: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  sessionBorder: { borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  sessionDot: { width: 10, height: 10, borderRadius: 5 },
  sessionName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  sessionMeta: { color: "#9A9A9A", fontSize: 12, marginTop: 2 },
  sessionDate: { color: "#5A5A5A", fontSize: 11, marginTop: 2 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  typeBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  notifRow: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  notifBorder: { borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  notifDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1E1E1E", alignItems: "center", justifyContent: "center", position: "relative" },
  unreadDot: { position: "absolute", top: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: "#7ED957", borderWidth: 1.5, borderColor: "#0D0D0D" },
  notifTitle: { color: "#fff", fontSize: 13, fontWeight: "600" },
  notifBody: { color: "#9A9A9A", fontSize: 12, marginTop: 2, lineHeight: 18 },
  notifDate: { color: "#5A5A5A", fontSize: 11, marginTop: 3 },
});
