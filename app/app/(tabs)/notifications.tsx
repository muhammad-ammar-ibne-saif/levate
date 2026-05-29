import React, { useEffect, useState, useCallback } from "react";
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
import api from "@/lib/api";

interface Notif {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: "workout" | "streak" | "progress" | "system";
}

const ICON: Record<string, string> = {
  workout: "⚡",
  streak: "⭐",
  progress: "📈",
  system: "🔔",
};

const DEMO: Notif[] = [
  {
    _id: "1",
    title: "Time to train",
    body: "Your hybrid session is ready.",
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    read: false,
    type: "workout",
  },
  {
    _id: "2",
    title: "Streak alert",
    body: "You're one workout away from keeping your streak alive.",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    type: "streak",
  },
  {
    _id: "3",
    title: "Session waiting",
    body: "Today's session is waiting — tap to start.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    type: "workout",
  },
  {
    _id: "4",
    title: "Progress update",
    body: "Week 5 complete! Your endurance score improved by 12%.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    type: "progress",
  },
  {
    _id: "5",
    title: "Rest day",
    body: "Rest day tomorrow. Recovery is part of the plan.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    type: "system",
  },
];

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
  const [notifs, setNotifs] = useState<Notif[]>(DEMO);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get("/api/notifications");
      if (data.notifications?.length > 0) {
        setNotifs(data.notifications);
      }
    } catch {
      // Keep demo data
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
        <ActivityIndicator color="#7ED957" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7ED957"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.item} onPress={() => markRead(item._id)}>
              <View style={s.iconWrap}>
                <Text style={s.icon}>{ICON[item.type] || "🔔"}</Text>
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
              <Text style={s.emptyIcon}>🔔</Text>
              <Text style={s.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  heading: { color: "#fff", fontSize: 20, fontWeight: "700" },
  markAll: { color: "#7ED957", fontSize: 12, fontWeight: "600" },
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
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  icon: { fontSize: 18 },
  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#7ED957",
    borderWidth: 2,
    borderColor: "#0D0D0D",
  },
  title: { color: "#9A9A9A", fontSize: 13, fontWeight: "500", marginBottom: 2 },
  titleUnread: { color: "#fff" },
  body: { color: "#9A9A9A", fontSize: 12, lineHeight: 18, marginBottom: 4 },
  time: { color: "#5A5A5A", fontSize: 11 },
  sep: { height: 0.5, backgroundColor: "rgba(255,255,255,0.08)" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#5A5A5A", fontSize: 14 },
});
