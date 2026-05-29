import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type WorkoutType = "lift" | "run" | "race";

interface WorkoutCardProps {
  type: WorkoutType;
  tag: string;
  name: string;
  meta: string;
  badge: string;
  onPress: () => void;
}

const config = {
  lift: {
    color: "#7ED957",
    dimBg: "rgba(126,217,87,0.1)",
    icon: "barbell-outline" as const,
    accent: "#7ED957",
  },
  run: {
    color: "#5B9CF6",
    dimBg: "rgba(91,156,246,0.1)",
    icon: "walk-outline" as const,
    accent: "#5B9CF6",
  },
  race: {
    color: "#F97316",
    dimBg: "rgba(249,115,22,0.1)",
    icon: "flag-outline" as const,
    accent: "#F97316",
  },
};

export function WorkoutCard({
  type,
  tag,
  name,
  meta,
  badge,
  onPress,
}: WorkoutCardProps) {
  const c = config[type];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-bg-3 border border-white/10 rounded-2xl p-4 flex-row items-center gap-3.5"
    >
      {/* Left accent bar */}
      <View
        style={{ backgroundColor: c.color }}
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
      />

      {/* Icon */}
      <View
        style={{ backgroundColor: c.dimBg }}
        className="w-11 h-11 rounded-xl items-center justify-center ml-2"
      >
        <Ionicons name={c.icon} size={22} color={c.color} />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text
          style={{ color: c.color }}
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
        >
          {tag}
        </Text>
        <Text className="text-white font-syne text-sm font-bold mb-0.5">
          {name}
        </Text>
        <Text className="text-muted text-xs">{meta}</Text>
      </View>

      {/* Badge */}
      <View style={{ backgroundColor: c.dimBg }} className="rounded-full px-2.5 py-1.5">
        <Text style={{ color: c.color }} className="text-xs font-bold">
          {badge}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
