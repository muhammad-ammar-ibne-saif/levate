import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";

export default function SettingsScreen() {
  const { logout, user } = useAuthStore();
  const [notifOn, setNotifOn] = useState(true);
  const [timerOn, setTimerOn] = useState(false);

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

  const Toggle = ({ on, onPress }: { on: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[t.track, on && t.trackOn]}>
      <View style={[t.knob, on && t.knobOn]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.heading}>
          <Text style={s.headingText}>Settings</Text>
        </View>

        {/* Admin Panel — only visible to admins */}
        {user?.isAdmin && (
          <>
            <Text style={s.sectionLabel}>⚡ Admin</Text>
            <View style={s.section}>
              <TouchableOpacity
                style={s.row}
                onPress={() => router.push("/app/admin/dashboard")}
              >
                <View
                  style={[s.icon, { backgroundColor: "rgba(249,115,22,0.1)" }]}
                >
                  <Text style={{ fontSize: 18 }}>🛡️</Text>
                </View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>Admin Panel</Text>
                  <Text style={s.rowSub}>Users, stats, notifications</Text>
                </View>
                <Text style={s.arrow}>›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.section}>
          <TouchableOpacity
            style={s.row}
            onPress={() => router.push("/app/settings/change-password")}
          >
            <View
              style={[s.icon, { backgroundColor: "rgba(126,217,87,0.08)" }]}
            >
              <Text style={{ fontSize: 18 }}>🔒</Text>
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowLabel}>Change password</Text>
              <Text style={s.rowSub}>Update your login credentials</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.row, s.rowBorder]}
            onPress={() => router.push("/app/(tabs)/profile")}
          >
            <View
              style={[s.icon, { backgroundColor: "rgba(91,156,246,0.08)" }]}
            >
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowLabel}>Edit profile</Text>
              <Text style={s.rowSub}>Name, email, photo</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>Preferences</Text>
        <View style={s.section}>
          <View style={s.row}>
            <View
              style={[s.icon, { backgroundColor: "rgba(249,115,22,0.08)" }]}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Notifications</Text>
              <Text style={s.rowSub}>Push training reminders</Text>
            </View>
            <Toggle on={notifOn} onPress={() => setNotifOn((v) => !v)} />
          </View>
          <View style={[s.row, s.rowBorder]}>
            <View
              style={[s.icon, { backgroundColor: "rgba(126,217,87,0.08)" }]}
            >
              <Text style={{ fontSize: 18 }}>⏱</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Rest timers</Text>
              <Text style={s.rowSub}>Auto-start between sets</Text>
            </View>
            <Toggle on={timerOn} onPress={() => setTimerOn((v) => !v)} />
          </View>
        </View>

        <Text style={s.sectionLabel}>Support</Text>
        <View style={s.section}>
          <TouchableOpacity style={s.row} onPress={handleLogout}>
            <View style={[s.icon, { backgroundColor: "rgba(239,68,68,0.08)" }]}>
              <Text style={{ fontSize: 18 }}>🚪</Text>
            </View>
            <View style={s.rowInfo}>
              <Text style={[s.rowLabel, { color: "#EF4444" }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const t = StyleSheet.create({
  track: {
    width: 48,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#2A2A2A",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  trackOn: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
  knob: { width: 21, height: 21, borderRadius: 11, backgroundColor: "#fff" },
  knobOn: { alignSelf: "flex-end" },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  heading: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headingText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  sectionLabel: {
    color: "#5A5A5A",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  section: {
    marginHorizontal: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.1)" },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: { flex: 1 },
  rowLabel: { color: "#fff", fontSize: 14, fontWeight: "500" },
  rowSub: { color: "#5A5A5A", fontSize: 12, marginTop: 2 },
  arrow: { color: "#5A5A5A", fontSize: 20 },
});
