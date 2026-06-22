import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/lib/theme";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View
        style={[s.inputRow, focused && s.inputFocused, !!error && s.inputError]}
      >
        <TextInput
          style={s.input}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={s.eyeBtn}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 14,
  },
  eyeBtn: { paddingLeft: 8 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
