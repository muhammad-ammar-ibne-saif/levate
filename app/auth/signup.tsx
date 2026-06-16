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
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/auth";
import { colors, spacing } from "../../lib/theme";

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
    // New users go through the personalisation flow before the main app
    if (state.isAuthenticated) router.replace("/auth/personalize");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Join the team</Text>
        <Text style={s.sub}>
          Find your community — then become fitter than you thought possible.
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
          autoCapitalize="none"
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
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  nameRow: { flexDirection: "row", gap: 10 },
  errBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errText: { color: colors.danger, fontSize: 13 },
  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 16,
  },
  link: { color: colors.primary, fontWeight: "600" },
});
