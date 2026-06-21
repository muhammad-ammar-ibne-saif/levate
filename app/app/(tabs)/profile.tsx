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
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";
import { colors, radius, spacing } from "@/lib/theme";
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/api/workouts/history");
        if (data.sessions) {
          const totalMins = data.sessions.reduce(
            (acc: number, sess: any) => acc + (sess.durationMinutes || 0),
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

        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.initials}>{initials || "U"}</Text>
          </View>
          <Text style={s.name}>
            {form.firstName} {form.lastName}
          </Text>
          <Text style={s.handle}>@{user?.email?.split("@")[0] || "user"}</Text>
        </View>

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
            <View style={s.savedRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.primary}
              />
              <Text style={s.savedText}>Profile updated successfully!</Text>
            </View>
          )}
        </View>

        <View style={s.logoutSection}>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
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
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headingText: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  avatarWrap: { alignItems: "center", paddingVertical: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  initials: { color: colors.primary, fontSize: 26, fontWeight: "800" },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  handle: { color: colors.textTertiary, fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statVal: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: { width: 0.5, backgroundColor: colors.border },
  form: { paddingHorizontal: 20 },
  nameRow: { flexDirection: "row", gap: 10 },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  savedText: { color: colors.primary, fontSize: 13 },
  logoutSection: { marginHorizontal: 20, marginTop: 32 },
  logoutBtn: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.25)",
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: "600" },
  logoutHint: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
});
