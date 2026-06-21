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
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";

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

        {user?.isAdmin && (
          <>
            <Text style={s.sectionLabel}>Admin</Text>
            <View style={s.section}>
              <TouchableOpacity
                style={s.row}
                onPress={() => router.push("/app/admin/dashboard")}
              >
                <View style={[s.icon, { backgroundColor: colors.primaryDim }]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>Admin Panel</Text>
                  <Text style={s.rowSub}>Users, stats, notifications</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
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
            <View style={[s.icon, { backgroundColor: colors.primaryDim }]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowLabel}>Change password</Text>
              <Text style={s.rowSub}>Update your login credentials</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.row, s.rowBorder]}
            onPress={() => router.push("/app/(tabs)/profile")}
          >
            <View style={[s.icon, { backgroundColor: colors.primaryDim }]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowLabel}>Edit profile</Text>
              <Text style={s.rowSub}>Name, email, photo</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>Preferences</Text>
        <View style={s.section}>
          <View style={s.row}>
            <View style={[s.icon, { backgroundColor: colors.primaryDim }]}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Notifications</Text>
              <Text style={s.rowSub}>Push training reminders</Text>
            </View>
            <Toggle on={notifOn} onPress={() => setNotifOn((v) => !v)} />
          </View>
          <View style={[s.row, s.rowBorder]}>
            <View style={[s.icon, { backgroundColor: colors.primaryDim }]}>
              <Ionicons name="timer-outline" size={18} color={colors.primary} />
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
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.danger}
              />
            </View>
            <View style={s.rowInfo}>
              <Text style={[s.rowLabel, { color: colors.danger }]}>
                Sign Out
              </Text>
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  trackOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  knob: { width: 21, height: 21, borderRadius: 11, backgroundColor: "#fff" },
  knobOn: { alignSelf: "flex-end" },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headingText: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  sectionLabel: {
    color: colors.textTertiary,
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: colors.border },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: { flex: 1 },
  rowLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "500" },
  rowSub: { color: colors.textTertiary, fontSize: 12, marginTop: 2 },
});
