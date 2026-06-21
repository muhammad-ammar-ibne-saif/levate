import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/lib/theme";
import api from "@/lib/api";

interface Notif {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: "workout" | "streak" | "progress" | "system";
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const ICON: Record<string, IconName> = {
  workout: "flash-outline",
  streak: "star-outline",
  progress: "trending-up-outline",
  system: "notifications-outline",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get("/api/notifications");
      setNotifs(data.notifications || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifs();
    setRefreshing(false);
  };

  const markRead = async (id: string) => {
    setNotifs((n) => n.map((i) => (i._id === id ? { ...i, read: true } : i)));
    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch {}
  };

  const markAllRead = async () => {
    setNotifs((n) => n.map((i) => ({ ...i, read: true })));
    try {
      await api.patch("/api/notifications/read-all");
    } catch {}
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.heading}>Notifications</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={s.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.item} onPress={() => markRead(item._id)}>
              <View style={s.iconWrap}>
                <Ionicons
                  name={ICON[item.type] || "notifications-outline"}
                  size={18}
                  color={colors.primary}
                />
                {!item.read && <View style={s.dot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.title, !item.read && s.titleUnread]}>
                  {item.title}
                </Text>
                <Text style={s.body}>{item.body}</Text>
                <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons
                name="notifications-outline"
                size={40}
                color={colors.textTertiary}
              />
              <Text style={s.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  heading: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  markAll: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  titleUnread: { color: colors.textPrimary },
  body: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: { color: colors.textTertiary, fontSize: 11 },
  sep: { height: 0.5, backgroundColor: colors.border },
  empty: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { color: colors.textTertiary, fontSize: 14 },
});
