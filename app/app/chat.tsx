import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { useChatStore, ChatMessage } from "@/store/chat";
import { colors, radius } from "@/lib/theme";

function Typing() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={c.botRow}>
      <View style={c.botAvatar}>
        <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
      </View>
      <View style={c.typingBubble}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[c.typingDot, { opacity: dot === i ? 1 : 0.3 }]}
          />
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { user } = useAuthStore();
  const { messages, isLoading, sendMessage } = useChatStore();
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);
  const firstName = user?.firstName || "Athlete";

  const userContext = {
    name: firstName,
    week: 5,
    totalWeeks: 8,
    program: "8-Week Hybrid Foundation",
    todayWorkout: "Lower Power + Carries",
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text, userContext);
  };

  useEffect(() => {
    if (messages.length > 0)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isLoading]);

  return (
    <SafeAreaView style={c.safe}>
      <View style={c.header}>
        <TouchableOpacity style={c.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={c.headerTitle}>Ask me</Text>
          <Text style={c.headerSub}>AI Training Assistant</Text>
        </View>
        <View style={c.botIcon}>
          <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={c.botRow}>
              <View style={c.botAvatar}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={colors.primary}
                />
              </View>
              <View style={c.botBubble}>
                <Text style={c.botText}>
                  Hey {firstName}! I'm your AI training assistant. Ask me
                  anything about your workouts, nutrition, recovery, or race
                  prep.
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }: { item: ChatMessage }) =>
            item.role === "user" ? (
              <View style={c.userRow}>
                <View style={c.userBubble}>
                  <Text style={c.userText}>{item.content}</Text>
                </View>
              </View>
            ) : (
              <View style={c.botRow}>
                <View style={c.botAvatar}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={colors.primary}
                  />
                </View>
                <View style={c.botBubble}>
                  <Text style={c.botText}>{item.content}</Text>
                </View>
              </View>
            )
          }
          ListFooterComponent={isLoading ? <Typing /> : null}
        />

        <View style={c.inputBar}>
          <View style={c.inputWrap}>
            <TextInput
              style={c.textInput}
              placeholder="Ask anything..."
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            style={[
              c.sendBtn,
              (!input.trim() || isLoading) && { opacity: 0.5 },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <Ionicons name="send" size={16} color={colors.textOnPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const c = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  headerSub: { color: colors.primary, fontSize: 11, marginTop: 1 },
  botIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  botRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
    marginBottom: 12,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: "78%",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  botText: { color: colors.textPrimary, fontSize: 13, lineHeight: 20 },
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: "78%",
  },
  userText: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  typingBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  textInput: { color: colors.textPrimary, fontSize: 14, maxHeight: 80 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
