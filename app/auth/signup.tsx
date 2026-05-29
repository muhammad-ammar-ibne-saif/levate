import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/auth";

export default function SignupScreen() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { signup, isLoading, error, clearError } = useAuthStore();
  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSignup = async () => {
    clearError();
    if (!form.firstName || !form.lastName || !form.email || !form.password)
      return;
    if (form.password !== form.confirmPassword) return;
    await signup(
      form.firstName.trim(),
      form.lastName.trim(),
      form.email.trim(),
      form.password
    );
    const state = useAuthStore.getState();
    if (state.isAuthenticated) router.replace("/app/(tabs)/home");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Create your account</Text>
        <Text style={s.sub}>
          Save your plan, track your progress, and stay ready for race day.
        </Text>
        <View style={s.nameRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="First Name"
              placeholder="First Name"
              value={form.firstName}
              onChangeText={set("firstName")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Last Name"
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={set("lastName")}
            />
          </View>
        </View>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={form.email}
          onChangeText={set("email")}
          keyboardType="email-address"
        />
        <Input
          label="Create Password"
          placeholder="Create your password"
          value={form.password}
          onChangeText={set("password")}
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChangeText={set("confirmPassword")}
          secureTextEntry
        />
        {error ? (
          <View style={s.errBox}>
            <Text style={s.errText}>{error}</Text>
          </View>
        ) : null}
        <Button
          label="Create Account"
          onPress={handleSignup}
          loading={isLoading}
        />
        <Text style={s.footer}>
          Already have an account?{" "}
          <Text style={s.link} onPress={() => router.push("/auth/login")}>
            Sign In here
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  scroll: { padding: 24 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  backText: { color: "#fff", fontSize: 24, lineHeight: 28 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#9A9A9A", fontSize: 14, lineHeight: 22, marginBottom: 28 },
  nameRow: { flexDirection: "row", gap: 10 },
  errBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errText: { color: "#EF4444", fontSize: 13 },
  footer: {
    textAlign: "center",
    color: "#9A9A9A",
    fontSize: 13,
    marginTop: 16,
  },
  link: { color: "#7ED957", fontWeight: "600" },
});
