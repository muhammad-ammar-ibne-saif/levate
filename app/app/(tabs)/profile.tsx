import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import api from "@/lib/api";

export default function ProfileScreen() {
  const { user, updateProfile, logout, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({
    sessions: 0,
    totalMinutes: 0,
    streak: 0,
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const initials = (
    (form.firstName[0] || "") + (form.lastName[0] || "")
  ).toUpperCase();

  // Fetch real user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/api/workouts/history");
        if (data.sessions) {
          const totalMins = data.sessions.reduce(
            (acc: number, s: any) => acc + (s.durationMinutes || 0),
            0
          );
          setStats({
            sessions: data.sessions.length,
            totalMinutes: totalMins,
            streak: data.streak || 0,
          });
        }
      } catch {}
    };
    fetchStats();
  }, []);

  const handleSave = async () => {
    await updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          // Replace entire navigation stack — user cannot go back
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.heading}>
          <Text style={s.headingText}>Profile</Text>
        </View>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.initials}>{initials || "U"}</Text>
          </View>
          <Text style={s.name}>
            {form.firstName} {form.lastName}
          </Text>
          <Text style={s.handle}>@{user?.email?.split("@")[0] || "user"}</Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statVal}>{stats.sessions}</Text>
            <Text style={s.statLabel}>Workouts</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCard}>
            <Text style={s.statVal}>{stats.totalMinutes}</Text>
            <Text style={s.statLabel}>Minutes</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCard}>
            <Text style={s.statVal}>{stats.streak}</Text>
            <Text style={s.statLabel}>Day streak</Text>
          </View>
        </View>

        {/* Form */}
        <View style={s.form}>
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="First Name"
                value={form.firstName}
                onChangeText={set("firstName")}
                placeholder="First Name"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Last Name"
                value={form.lastName}
                onChangeText={set("lastName")}
                placeholder="Last Name"
              />
            </View>
          </View>
          <Input
            label="Email"
            value={form.email}
            onChangeText={set("email")}
            placeholder="Email"
            keyboardType="email-address"
          />
          <Input
            label="Mobile No"
            value={form.mobile}
            onChangeText={set("mobile")}
            placeholder="+1 234 567 890"
            keyboardType="phone-pad"
          />
          <Button
            label="Update Profile"
            onPress={handleSave}
            loading={isLoading}
          />
          {saved && (
            <Text style={s.savedText}>✓ Profile updated successfully!</Text>
          )}
        </View>

        {/* Logout button — clearly separated */}
        <View style={s.logoutSection}>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <Text style={s.logoutIcon}>🚪</Text>
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={s.logoutHint}>
            You'll need to sign in again to access your plan.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  heading: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headingText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  avatarWrap: { alignItems: "center", paddingVertical: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E1E1E",
    borderWidth: 2,
    borderColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  initials: { color: "#7ED957", fontSize: 26, fontWeight: "800" },
  name: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 2 },
  handle: { color: "#5A5A5A", fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 24,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statVal: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: {
    color: "#5A5A5A",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: { width: 0.5, backgroundColor: "rgba(255,255,255,0.1)" },
  form: { paddingHorizontal: 20 },
  nameRow: { flexDirection: "row", gap: 10 },
  savedText: {
    color: "#7ED957",
    textAlign: "center",
    fontSize: 13,
    marginTop: 12,
  },
  logoutSection: { marginHorizontal: 20, marginTop: 32 },
  logoutBtn: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.25)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },
  logoutHint: {
    color: "#5A5A5A",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
});
