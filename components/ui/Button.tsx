import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Button({
  label,
  variant = "primary",
  loading = false,
  size = "md",
  onPress,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        s.base,
        s[variant],
        s[size],
        (disabled || loading) && s.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#0D0D0D" : "#7ED957"}
          size="small"
        />
      ) : (
        <Text style={[s.text, s[`t_${variant}`], s[`ts_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: { borderRadius: 50, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: "#7ED957" },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ghost: {
    backgroundColor: "#1E1E1E",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sm: { paddingHorizontal: 16, paddingVertical: 10 },
  md: { paddingVertical: 16, width: "100%" },
  lg: { paddingVertical: 18, width: "100%" },
  disabled: { opacity: 0.5 },
  text: { fontWeight: "700", letterSpacing: 0.2 },
  t_primary: { color: "#0D0D0D" },
  t_outline: { color: "#ffffff" },
  t_ghost: { color: "#ffffff" },
  ts_sm: { fontSize: 13 },
  ts_md: { fontSize: 15 },
  ts_lg: { fontSize: 17 },
} as any);
