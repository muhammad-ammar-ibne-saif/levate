import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface TimerRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  timeDisplay: string;
  label?: string;
  color?: string;
}

export function TimerRing({
  size = 220,
  strokeWidth = 10,
  progress,
  timeDisplay,
  label = "Duration",
  color = "#7ED957",
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E1E1E"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress fill */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      {/* Center content */}
      <View className="absolute items-center justify-center">
        <Text className="text-white font-syne text-4xl font-bold">
          {timeDisplay}
        </Text>
        <Text className="text-muted-2 text-xs uppercase tracking-widest mt-1">
          {label}
        </Text>
      </View>
    </View>
  );
}
