import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.textTertiary}
        />
        <Text style={s.title}>Page not found</Text>
        <Text style={s.sub}>This screen doesn't exist yet.</Text>
        <TouchableOpacity
          style={s.btn}
          onPress={() => router.replace("/app/(tabs)/home")}
        >
          <Text style={s.btnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  sub: { color: colors.textSecondary, fontSize: 14, textAlign: "center" },
  btn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnText: { color: colors.textOnPrimary, fontSize: 15, fontWeight: "700" },
});
