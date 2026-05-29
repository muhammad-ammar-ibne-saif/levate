import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

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
          placeholderTextColor="#3A3A3A"
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
            <Text style={s.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
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
    color: "#9A9A9A",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: "#7ED957" },
  inputError: { borderColor: "#EF4444" },
  input: { flex: 1, paddingVertical: 14, color: "#fff", fontSize: 14 },
  eyeBtn: { paddingLeft: 8 },
  eyeText: { fontSize: 16 },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
});
