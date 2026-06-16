import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";
import { colors, radius } from "../../lib/theme";

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
  const baseStyle = [
    s.base,
    s[variant],
    s[size],
    (disabled || loading) && s.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={baseStyle}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.textOnPrimary : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[s.text, s[`text_${variant}`], s[`textSize_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  ghost: {
    backgroundColor: colors.button,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  sm: { paddingHorizontal: 16, paddingVertical: 10 },
  md: { paddingVertical: 16, width: "100%" },
  lg: { paddingVertical: 18, width: "100%" },
  disabled: { opacity: 0.5 },
  text: { fontWeight: "700", letterSpacing: 0.2 },
  text_primary: { color: colors.textOnPrimary },
  text_outline: { color: colors.textPrimary },
  text_ghost: { color: colors.textPrimary },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
} as any);
