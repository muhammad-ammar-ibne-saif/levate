import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

const GOALS = [
  {
    id: "race",
    emoji: "🏁",
    title: "Race Performance",
    sub: "Train for your next 5K, 10K or marathon",
  },
  {
    id: "strength",
    emoji: "🏋️",
    title: "Strength Gain",
    sub: "Build muscle and increase lifting power",
  },
  {
    id: "hybrid",
    emoji: "🚀",
    title: "Hybrid Fitness",
    sub: "Balance running and lifting performance",
  },
  {
    id: "general",
    emoji: "❤️",
    title: "General Fitness",
    sub: "Stay active and build healthy habits",
  },
];

export default function GoalsScreen() {
  const [selected, setSelected] = useState<string[]>(["race"]);
  const toggle = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((g) => g !== id) : [...p, id]
    );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.header}>
          <Text style={s.heading}>Your Goals</Text>
          <Text style={s.sub}>
            Select your primary training goal. Your plan adapts to what matters
            most.
          </Text>
        </View>
        <View style={s.grid}>
          {GOALS.map((g) => {
            const on = selected.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => toggle(g.id)}
                activeOpacity={0.75}
                style={[s.card, on && s.cardActive]}
              >
                <View style={[s.emoji, on && s.emojiActive]}>
                  <Text style={{ fontSize: 20 }}>{g.emoji}</Text>
                </View>
                <Text style={s.cardTitle}>{g.title}</Text>
                <Text style={s.cardSub}>{g.sub}</Text>
                <View style={[s.check, on && s.checkActive]}>
                  {on && (
                    <Text
                      style={{
                        color: "#0D0D0D",
                        fontSize: 10,
                        fontWeight: "800",
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Button
            label="Save Goals"
            onPress={() => router.push("/app/(tabs)/home")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  heading: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 6 },
  sub: { color: "#9A9A9A", fontSize: 13, lineHeight: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "47%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  cardActive: { borderColor: "#7ED957" },
  emoji: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiActive: { backgroundColor: "rgba(126,217,87,0.12)" },
  cardTitle: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cardSub: { color: "#5A5A5A", fontSize: 11, lineHeight: 16 },
  check: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
});
