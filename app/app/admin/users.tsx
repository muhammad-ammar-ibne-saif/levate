import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, RefreshControl, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "@/lib/api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  createdAt: string;
  currentWeek: number;
  workoutCount: number;
  totalMinutes: number;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = async (p = 1, q = search, append = false) => {
    try {
      const { data } = await api.get("/api/admin/users", {
        params: { page: p, limit: 20, search: q },
      });
      setUsers(prev => append ? [...prev, ...data.users] : data.users);
      setTotal(data.total);
      setTotalPages(data.pages);
      setPage(p);
    } catch (err: any) {
      if (err.response?.status === 403) {
        Alert.alert("Access Denied", "Admin only.");
        router.back();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchUsers(1, "", false); }, []);

  const onSearch = (text: string) => {
    setSearch(text);
    if (text.length === 0 || text.length >= 2) {
      setLoading(true);
      fetchUsers(1, text, false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, search, false);
  };

  const loadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    fetchUsers(page + 1, search, true);
  };

  const deleteUser = (userId: string, name: string) => {
    Alert.alert(
      "Delete User",
      `Delete ${name} and all their data? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/admin/users/${userId}`);
              setUsers(prev => prev.filter(u => u._id !== userId));
              setTotal(prev => prev - 1);
            } catch {
              Alert.alert("Error", "Failed to delete user.");
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={s.userCard}
      activeOpacity={0.75}
      onPress={() => router.push({ pathname: "/app/admin/user-detail", params: { id: item._id } })}
    >
      <View style={s.avatarWrap}>
        <Text style={s.avatarText}>
          {(item.firstName[0] || "") + (item.lastName[0] || "")}
        </Text>
        {item.isAdmin && (
          <View style={s.adminBadge}><Text style={s.adminBadgeText}>A</Text></View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.nameRow}>
          <Text style={s.name}>{item.firstName} {item.lastName}</Text>
          {item.isAdmin && <Text style={s.adminTag}>Admin</Text>}
        </View>
        <Text style={s.email}>{item.email}</Text>
        <View style={s.metaRow}>
          <Text style={s.meta}>Week {item.currentWeek}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.meta}>{item.workoutCount} workouts</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.meta}>{item.totalMinutes} min</Text>
        </View>
      </View>
      <View style={s.rightCol}>
        <Text style={s.joinDate}>{timeAgo(item.createdAt)}</Text>
        {!item.isAdmin && (
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={() => deleteUser(item._id, `${item.firstName} ${item.lastName}`)}
          >
            <Text style={s.deleteText}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>All Users</Text>
          <Text style={s.subtitle}>{total} total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor="#3A3A3A"
          value={search}
          onChangeText={onSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch("")}>
            <Text style={{ color: "#5A5A5A", fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#7ED957" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7ED957" />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#7ED957" style={{ marginTop: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>👥</Text>
              <Text style={s.emptyText}>
                {search ? "No users match your search." : "No users yet."}
              </Text>
            </View>
          }
        />
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
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginVertical: 12, backgroundColor: "#1E1E1E", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },
  userCard: { backgroundColor: "#1E1E1E", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(126,217,87,0.12)", borderWidth: 1, borderColor: "rgba(126,217,87,0.3)", alignItems: "center", justifyContent: "center", position: "relative" },
  avatarText: { color: "#7ED957", fontWeight: "800", fontSize: 15 },
  adminBadge: { position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: "#F97316", alignItems: "center", justifyContent: "center" },
  adminBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: "#fff", fontSize: 14, fontWeight: "600" },
  adminTag: { backgroundColor: "rgba(249,115,22,0.1)", color: "#F97316", fontSize: 10, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  email: { color: "#5A5A5A", fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  meta: { color: "#9A9A9A", fontSize: 11 },
  metaDot: { color: "#3A3A3A", fontSize: 11 },
  rightCol: { alignItems: "flex-end", gap: 8 },
  joinDate: { color: "#5A5A5A", fontSize: 11 },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 14 },
  empty: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: "#5A5A5A", fontSize: 14 },
});
