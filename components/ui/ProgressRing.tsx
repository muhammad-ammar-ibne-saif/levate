import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  week?: number;
  totalWeeks?: number;
}

export function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  week = 5,
  totalWeeks = 8,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E1E1E"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7ED957"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className="text-white font-syne text-3xl font-bold leading-none">
          {percentage}%
        </Text>
        <Text className="text-muted-2 text-xs mt-1">
          Week {week} of {totalWeeks}
        </Text>
      </View>
    </View>
  );
}
