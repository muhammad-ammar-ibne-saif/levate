import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors, spacing, radius } from "@/lib/theme";
import api from "@/lib/api";

type Step = "email" | "code" | "newpass" | "done";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim() });
      setStep("code");
    } catch (e: any) {
      setError(
        e.response?.data?.message ||
          "Could not send reset code. Check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    if (!code.trim() || code.length < 4) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/verify-reset-code", {
        email: email.trim(),
        code: code.trim(),
      });
      setStep("newpass");
    } catch (e: any) {
      setError(
        e.response?.data?.message || "Invalid or expired code. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!newPass || newPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        email: email.trim(),
        code: code.trim(),
        newPassword: newPass,
      });
      setStep("done");
    } catch (e: any) {
      setError(
        e.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim() });
      Alert.alert("Sent!", "A new code has been sent to your email.");
    } catch {
      setError("Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={s.back}
          onPress={() => (step === "email" ? router.back() : setStep("email"))}
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        {step === "email" && (
          <>
            <View style={s.iconWrap}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={s.title}>Forgot Password?</Text>
            <Text style={s.sub}>
              Enter your email address and we'll send you a 6-digit code to
              reset your password.
            </Text>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error ? <Text style={s.errText}>{error}</Text> : null}
            <Button
              label="Send Reset Code"
              onPress={handleSendCode}
              loading={loading}
            />
          </>
        )}

        {step === "code" && (
          <>
            <View style={s.iconWrap}>
              <Ionicons name="mail-outline" size={40} color={colors.primary} />
            </View>
            <Text style={s.title}>Check your email</Text>
            <Text style={s.sub}>
              We sent a 6-digit code to{" "}
              <Text style={{ color: colors.primary }}>{email}</Text>
              {". "}Enter it below.
            </Text>
            <Input
              label="6-Digit Code"
              placeholder="Enter code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            {error ? <Text style={s.errText}>{error}</Text> : null}
            <Button
              label="Verify Code"
              onPress={handleVerifyCode}
              loading={loading}
            />
            <TouchableOpacity
              style={s.resendBtn}
              onPress={resendCode}
              disabled={loading}
            >
              <Text style={s.resendText}>Didn't receive it? Resend code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "newpass" && (
          <>
            <View style={s.iconWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={s.title}>Set new password</Text>
            <Text style={s.sub}>
              Choose a strong password that you haven't used before.
            </Text>
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
            />
            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
            />
            {error ? <Text style={s.errText}>{error}</Text> : null}
            <Button
              label="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
            />
          </>
        )}

        {step === "done" && (
          <View style={s.doneWrap}>
            <View style={s.doneCircle}>
              <Ionicons name="checkmark" size={36} color={colors.primary} />
            </View>
            <Text style={s.title}>Password reset!</Text>
            <Text style={s.sub}>
              Your password has been updated successfully. You can now sign in
              with your new password.
            </Text>
            <Button
              label="Back to Login"
              onPress={() => router.replace("/auth/login")}
            />
          </View>
        )}
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
    marginBottom: spacing.xxl,
  },
  iconWrap: { alignItems: "center", marginBottom: 20 },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  errText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 14,
    textAlign: "center",
  },
  resendBtn: { marginTop: 16, alignItems: "center" },
  resendText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  doneWrap: { alignItems: "center", paddingTop: 20 },
  doneCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: "rgba(106,83,252,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
});
