import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

// ── IMPORTANT: set this to your server URL ──────────────────────────────────
// Same as API_BASE_URL in lib/api.ts
const SOCKET_URL = "http://192.168.1.8:4000";
// ────────────────────────────────────────────────────────────────────────────

interface Message {
  _id: string;
  user: string;
  firstName: string;
  lastName: string;
  content: string;
  createdAt: string;
  deleted: boolean;
}

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function initials(firstName: string, lastName: string) {
  return ((firstName[0] || "") + (lastName[0] || "")).toUpperCase();
}

// Simple avatar colors based on first letter
const COLORS = [
  "#7ED957",
  "#5B9CF6",
  "#F97316",
  "#A855F7",
  "#EF4444",
  "#14B8A6",
  "#F59E0B",
  "#EC4899",
];
function avatarColor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export default function CommunityScreen() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load history then connect socket ──────────────────────────────────────
  useEffect(() => {
    loadHistory();
    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/api/community/messages");
      setMessages(data.messages);
    } catch {
      // Show empty state — socket will still work
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = async () => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ Socket connected");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("🔴 Socket disconnected");
    });

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    });

    socket.on("typing_update", (names: string[]) => {
      // Filter out current user's own name
      const others = names.filter((n) => n !== user?.firstName);
      setTypingNames(others);
    });

    socket.on("message_deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, deleted: true, content: "This message was deleted." }
            : m
        )
      );
    });

    socket.on("error", (err: { message: string }) => {
      console.error("Socket error:", err.message);
    });

    socketRef.current = socket;
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !socketRef.current || sending) return;

    setSending(true);
    socketRef.current.emit("send_message", { content: text });
    setInput("");
    setSending(false);

    // Stop typing indicator
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socketRef.current.emit("typing_stop");
  }, [input, sending]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = (text: string) => {
    setInput(text);
    if (!socketRef.current) return;

    socketRef.current.emit("typing_start");

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("typing_stop");
    }, 2500);
  };

  // ── Long press actions ────────────────────────────────────────────────────
  const handleLongPress = (msg: Message) => {
    if (msg.deleted) return;

    const isOwn = msg.user === user?._id;
    const opts: {
      text: string;
      onPress: () => void;
      style?: "destructive" | "cancel";
    }[] = [];

    if (isOwn || user?.isAdmin) {
      opts.push({
        text: "Delete message",
        style: "destructive",
        onPress: () => {
          Alert.alert("Delete Message", "Delete this message for everyone?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                socketRef.current?.emit("delete_message", {
                  messageId: msg._id,
                });
              },
            },
          ]);
        },
      });
    }

    if (!isOwn) {
      opts.push({
        text: "Report message",
        onPress: async () => {
          try {
            await api.post(`/api/community/messages/${msg._id}/report`);
            Alert.alert(
              "Reported",
              "This message has been reported for review."
            );
          } catch {
            Alert.alert("Error", "Failed to report message.");
          }
        },
      });
    }

    opts.push({ text: "Cancel", style: "cancel", onPress: () => {} });
    Alert.alert("Message Options", undefined as any, opts);
  };

  // ── Render message bubble ─────────────────────────────────────────────────
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.user === user?._id;
    const isDeleted = item.deleted;
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showName = !isOwn && (!prevMsg || prevMsg.user !== item.user);
    const color = avatarColor(item.firstName);

    return (
      <TouchableOpacity
        activeOpacity={isDeleted ? 1 : 0.8}
        onLongPress={() => !isDeleted && handleLongPress(item)}
        delayLongPress={400}
      >
        <View style={[s.msgRow, isOwn && s.msgRowOwn]}>
          {/* Avatar — only for others, only when name shown */}
          {!isOwn && (
            <View style={[s.avatar, showName ? {} : s.avatarHidden]}>
              {showName && (
                <View style={[s.avatarCircle, { backgroundColor: color }]}>
                  <Text style={s.avatarText}>
                    {initials(item.firstName, item.lastName)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={[s.bubbleWrap, isOwn && s.bubbleWrapOwn]}>
            {/* Sender name */}
            {showName && !isOwn && (
              <Text style={[s.senderName, { color }]}>
                {item.firstName} {item.lastName}
              </Text>
            )}

            {/* Bubble */}
            <View
              style={[
                s.bubble,
                isOwn ? s.bubbleOwn : s.bubbleOther,
                isDeleted && s.bubbleDeleted,
              ]}
            >
              <Text
                style={[
                  s.bubbleText,
                  isOwn ? s.bubbleTextOwn : s.bubbleTextOther,
                  isDeleted && s.bubbleTextDeleted,
                ]}
              >
                {item.content}
              </Text>
            </View>

            {/* Time */}
            <Text style={[s.time, isOwn && s.timeOwn]}>
              {timeLabel(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Typing indicator text ─────────────────────────────────────────────────
  const typingText = () => {
    if (typingNames.length === 0) return null;
    if (typingNames.length === 1) return `${typingNames[0]} is typing…`;
    if (typingNames.length === 2)
      return `${typingNames[0]} and ${typingNames[1]} are typing…`;
    return "Several people are typing…";
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>Community</Text>
          <View style={s.headerStatus}>
            <View
              style={[s.statusDot, connected ? s.statusGreen : s.statusGrey]}
            />
            <Text style={s.statusText}>
              {connected ? "Live" : "Connecting…"}
            </Text>
          </View>
        </View>
        <View style={s.membersBadge}>
          <Text style={s.membersText}>🏋️ Team</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {loading ? (
          <ActivityIndicator color="#7ED957" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            contentContainerStyle={s.messageList}
            showsVerticalScrollIndicator={false}
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <Text style={s.emptyIcon}>💬</Text>
                <Text style={s.emptyTitle}>Be the first to say hello!</Text>
                <Text style={s.emptyText}>
                  This is the Team L-Evate community. All members are here.
                </Text>
              </View>
            }
          />
        )}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <View style={s.typingWrap}>
            <View style={s.typingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={s.typingDot} />
              ))}
            </View>
            <Text style={s.typingText}>{typingText()}</Text>
          </View>
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              placeholder="Message the community…"
              placeholderTextColor="#3A3A3A"
              value={input}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            style={[
              s.sendBtn,
              (!input.trim() || !connected) && s.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || !connected}
          >
            <Text style={s.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusGreen: { backgroundColor: "#7ED957" },
  statusGrey: { backgroundColor: "#5A5A5A" },
  statusText: { color: "#9A9A9A", fontSize: 11 },
  membersBadge: {
    backgroundColor: "rgba(126,217,87,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(126,217,87,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  membersText: { color: "#7ED957", fontSize: 12, fontWeight: "600" },

  // Messages
  messageList: { paddingHorizontal: 16, paddingVertical: 12, gap: 2 },

  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 2,
  },
  msgRowOwn: { flexDirection: "row-reverse" },

  avatar: { width: 32, flexShrink: 0 },
  avatarHidden: { opacity: 0 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#0D0D0D", fontSize: 11, fontWeight: "800" },

  bubbleWrap: { maxWidth: "75%", gap: 3 },
  bubbleWrapOwn: { alignItems: "flex-end" },

  senderName: {
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 4,
    marginBottom: 1,
  },

  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwn: { backgroundColor: "#7ED957", borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bubbleDeleted: {
    backgroundColor: "#161616",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
  },

  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextOwn: { color: "#0D0D0D", fontWeight: "500" },
  bubbleTextOther: { color: "#fff" },
  bubbleTextDeleted: { color: "#3A3A3A", fontStyle: "italic" },

  time: { color: "#3A3A3A", fontSize: 10, paddingLeft: 4 },
  timeOwn: { paddingLeft: 0, paddingRight: 4 },

  // Typing
  typingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingDots: { flexDirection: "row", gap: 3 },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#5A5A5A",
  },
  typingText: { color: "#5A5A5A", fontSize: 12, fontStyle: "italic" },

  // Input
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#161616",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    maxHeight: 120,
  },
  input: { color: "#fff", fontSize: 14, lineHeight: 20 },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: "#2A2A2A" },
  sendIcon: { color: "#0D0D0D", fontSize: 16, fontWeight: "700" },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#5A5A5A",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
