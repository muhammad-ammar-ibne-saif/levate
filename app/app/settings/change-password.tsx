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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.title}>Change Password</Text>
        <Text style={s.sub}>
          Update your login credentials to keep your account secure.
        </Text>

        {/* Info card */}
        <View style={s.infoCard}>
          <Text style={s.infoIcon}>🔒</Text>
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
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  scroll: { padding: 24 },
  header: { marginBottom: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { color: "#fff", fontSize: 26, lineHeight: 30 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#9A9A9A", fontSize: 14, lineHeight: 22, marginBottom: 24 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(126,217,87,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(126,217,87,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  infoIcon: { fontSize: 20 },
  infoText: { color: "#9A9A9A", fontSize: 13, lineHeight: 20, flex: 1 },
});
