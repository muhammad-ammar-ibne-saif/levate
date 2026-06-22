import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { colors, spacing } from "@/lib/theme";
import api from "@/lib/api";

export default function ChangePasswordScreen() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.current) e.current = "Required";
    if (!form.newPass) e.newPass = "Required";
    else if (form.newPass.length < 6) e.newPass = "Min 6 characters";
    if (form.newPass !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      Alert.alert("Success", "Password updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to update password."
      );
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
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <Text style={s.title}>Change Password</Text>
        <Text style={s.sub}>
          Update your login credentials to keep your account secure.
        </Text>

        <View style={s.infoCard}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={s.infoText}>
            Your new password must be at least 6 characters long.
          </Text>
        </View>

        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={form.current}
          onChangeText={set("current")}
          secureTextEntry
          error={errors.current}
        />
        <Input
          label="New Password"
          placeholder="Enter new password"
          value={form.newPass}
          onChangeText={set("newPass")}
          secureTextEntry
          error={errors.newPass}
        />
        <Input
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={form.confirm}
          onChangeText={set("confirm")}
          secureTextEntry
          error={errors.confirm}
        />

        <View style={{ marginTop: 8 }}>
          <Button
            label="Update Password"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  header: { marginBottom: spacing.xl },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primaryDim,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    padding: 14,
    marginBottom: spacing.xl,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
});
