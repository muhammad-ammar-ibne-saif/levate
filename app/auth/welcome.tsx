import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.logoBox}>
          <Text style={s.logoL}>L</Text>
        </View>
        <Text style={s.title}>Welcome to Team L-Evate</Text>
        <Text style={s.sub}>
          Stay Active. Build your race-ready hybrid training plan and stay on
          track every week.
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
  safe: { flex: 1, backgroundColor: "#0D0D0D", paddingHorizontal: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  logoBox: {
    width: 90,
    height: 90,
    backgroundColor: "#7ED957",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoL: { color: "#0D0D0D", fontWeight: "800", fontSize: 48 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  sub: {
    color: "#9A9A9A",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  actions: { paddingBottom: 40 },
  footer: {
    color: "#3A3A3A",
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
