import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "@/lib/theme";
import api from "@/lib/api";

interface UserDetail {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  isAdmin: boolean;
  createdAt: string;
  daysPerWeek?: number;
  goals?: string[];
  workoutCount: number;
  totalMinutes: number;
  recentWorkouts: {
    _id: string;
    name: string;
    type: string;
    createdAt: string;
    durationMinutes: number;
  }[];
  recentNotifications: { _id: string; title: string; createdAt: string }[];
}

export default function AdminUserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/admin/users/${userId}`);
        setUser(data.user);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  const sendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      Alert.alert("Missing fields", "Please enter both title and message.");
      return;
    }
    setSending(true);
    try {
      await api.post(`/api/admin/users/${userId}/notify`, {
        title: pushTitle,
        body: pushBody,
      });
      Alert.alert("Sent", "Notification sent successfully.");
      setPushTitle("");
      setPushBody("");
    } catch {
      Alert.alert("Error", "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const toggleAdmin = async () => {
    if (!user) return;
    Alert.alert(
      user.isAdmin ? "Remove Admin" : "Make Admin",
      user.isAdmin
        ? "Remove admin privileges from this user?"
        : "Grant admin privileges to this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await api.patch(`/api/admin/users/${userId}/admin`, {
                isAdmin: !user.isAdmin,
              });
              setUser((prev) =>
                prev ? { ...prev, isAdmin: !prev.isAdmin } : prev
              );
            } catch {
              Alert.alert("Error", "Failed to update admin status.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={s.emptyText}>User not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={s.headerTitle}>User Details</Text>
        </View>

        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(user.firstName[0] || "") + (user.lastName[0] || "")}
            </Text>
          </View>
          <Text style={s.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={s.email}>{user.email}</Text>
          {user.isAdmin && (
            <View style={s.adminBadge}>
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={colors.primary}
              />
              <Text style={s.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={s.statsRow}>
          <View style={s.statCell}>
            <Text style={s.statVal}>{user.workoutCount}</Text>
            <Text style={s.statLabel}>Workouts</Text>
          </View>
          <View style={[s.statCell, s.statBorder]}>
            <Text style={s.statVal}>{user.totalMinutes}</Text>
            <Text style={s.statLabel}>Minutes</Text>
          </View>
          <View style={s.statCell}>
            <Text style={s.statVal}>{user.daysPerWeek || "—"}</Text>
            <Text style={s.statLabel}>Days/wk</Text>
          </View>
        </View>

        <TouchableOpacity style={s.adminToggleRow} onPress={toggleAdmin}>
          <Ionicons
            name={user.isAdmin ? "shield-checkmark-outline" : "shield-outline"}
            size={18}
            color={colors.primary}
          />
          <Text style={s.adminToggleText}>
            {user.isAdmin ? "Remove Admin Access" : "Grant Admin Access"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textTertiary}
          />
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Recent Workouts</Text>
        <View style={s.listCard}>
          {user.recentWorkouts.length === 0 ? (
            <Text style={s.emptyText}>No workouts yet.</Text>
          ) : (
            user.recentWorkouts.map((w) => (
              <View key={w._id} style={s.listRow}>
                <Ionicons
                  name="barbell-outline"
                  size={16}
                  color={colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.listTitle}>{w.name}</Text>
                  <Text style={s.listSub}>
                    {w.durationMinutes} min ·{" "}
                    {new Date(w.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={s.sectionTitle}>Send Push Notification</Text>
        <View style={s.pushCard}>
          <TextInput
            style={s.pushInput}
            placeholder="Notification title"
            placeholderTextColor={colors.textTertiary}
            value={pushTitle}
            onChangeText={setPushTitle}
          />
          <TextInput
            style={[s.pushInput, { height: 70, textAlignVertical: "top" }]}
            placeholder="Message"
            placeholderTextColor={colors.textTertiary}
            value={pushBody}
            onChangeText={setPushBody}
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, sending && { opacity: 0.6 }]}
            onPress={sendPush}
            disabled={sending}
          >
            <Ionicons
              name="send-outline"
              size={15}
              color={colors.textOnPrimary}
            />
            <Text style={s.sendBtnText}>
              {sending ? "Sending…" : "Send Notification"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  profileCard: { alignItems: "center", paddingVertical: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  name: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  email: { color: colors.textTertiary, fontSize: 13, marginTop: 2 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryDim,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  adminBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  statCell: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statBorder: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: colors.border,
  },
  statVal: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },
  adminToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 20,
  },
  adminToggleText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 20,
  },
  listRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  listTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
  listSub: { color: colors.textTertiary, fontSize: 11, marginTop: 1 },
  pushCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  pushInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 13,
  },
  sendBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 13,
    marginTop: 4,
  },
  sendBtnText: { color: colors.textOnPrimary, fontSize: 13, fontWeight: "700" },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
    padding: 20,
  },
});
