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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    if (!email.trim() || !password) return;
    await login(email.trim(), password);
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
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={s.title}>Welcome back</Text>
        <Text style={s.sub}>
          Sign in to continue your training plan and track your progress.
        </Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={s.forgotBtn}
          onPress={() => router.push("/auth/forgot-password")}
        >
          <Text style={s.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {error ? (
          <View style={s.errBox}>
            <Text style={s.errText}>{error}</Text>
          </View>
        ) : null}

        <Button label="Sign In" onPress={handleLogin} loading={isLoading} />

        <Text style={s.footer}>
          Don't have an account?{" "}
          <Text style={s.link} onPress={() => router.push("/auth/signup")}>
            Sign up here
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
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#9A9A9A", fontSize: 14, lineHeight: 22, marginBottom: 28 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { color: "#7ED957", fontSize: 13, fontWeight: "600" },
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
    marginTop: 20,
  },
  link: { color: "#7ED957", fontWeight: "600" },
});
