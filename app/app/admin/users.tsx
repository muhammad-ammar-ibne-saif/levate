import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "@/lib/theme";
import api from "@/lib/api";

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = useCallback(
    async (pageNum: number, query: string, append: boolean) => {
      try {
        const { data } = await api.get("/api/admin/users", {
          params: { page: pageNum, search: query, limit: 20 },
        });
        setUsers((prev) => (append ? [...prev, ...data.users] : data.users));
        setHasMore(data.users.length === 20);
      } catch {
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search, false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    fetchUsers(next, search, true);
  };

  const confirmDelete = (user: AdminUser) => {
    Alert.alert(
      "Delete User",
      `Delete ${user.firstName} ${user.lastName}'s account? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/admin/users/${user._id}`);
              setUsers((prev) => prev.filter((u) => u._id !== user._id));
            } catch {
              Alert.alert("Error", "Failed to delete user.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Manage Users</Text>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={17} color={colors.textTertiary} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or email…"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={17}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={<Text style={s.emptyText}>No users found.</Text>}
          renderItem={({ item }) => (
            <View style={s.userRow}>
              <TouchableOpacity
                style={s.userInfo}
                onPress={() =>
                  router.push({
                    pathname: "/app/admin/user-detail",
                    params: { userId: item._id },
                  })
                }
              >
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {(item.firstName[0] || "") + (item.lastName[0] || "")}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.nameRow}>
                    <Text style={s.userName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    {item.isAdmin && (
                      <View style={s.adminTag}>
                        <Ionicons
                          name="shield-checkmark"
                          size={10}
                          color={colors.primary}
                        />
                        <Text style={s.adminTagText}>Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.userEmail}>{item.email}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.deleteBtn}
                onPress={() => confirmDelete(item)}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={colors.danger}
                />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
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
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  userInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
  adminTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primaryDim,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminTagText: { color: colors.primary, fontSize: 9, fontWeight: "700" },
  userEmail: { color: colors.textTertiary, fontSize: 12, marginTop: 1 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(239,68,68,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sep: { height: 0.5, backgroundColor: colors.border },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
    textAlign: "center",
    padding: 40,
  },
});
