import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { colors, spacing } from "../../lib/theme";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.logoBox}>
          <Ionicons name="triangle" size={40} color={colors.textOnPrimary} />
        </View>
        <Text style={s.title}>Welcome to Team L-Evate</Text>
        <Text style={s.sub}>
          Find your community — then become fitter than you thought possible.
        </Text>
      </View>

      <View style={s.actions}>
        <Button label="Login" onPress={() => router.push("/auth/login")} />
        <View style={{ height: 12 }} />
        <Button
          label="Create Account"
          variant="outline"
          onPress={() => router.push("/auth/signup")}
        />
        <Text style={s.footer}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  logoBox: {
    width: 90,
    height: 90,
    backgroundColor: colors.primary,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  actions: { paddingBottom: 40 },
  footer: {
    color: colors.textTertiary,
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
