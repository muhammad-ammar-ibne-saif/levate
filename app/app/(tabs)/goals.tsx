import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";

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
  const { user, updateProfile, isLoading } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(user?.goals || ["hybrid"]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // must keep at least one
        return prev.filter((g) => g !== id);
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    await updateProfile({ goals: selected } as any);
    Alert.alert(
      "Goals Saved! 🎯",
      "Your training plan has been updated to match your goals.",
      [
        { text: "View Plan", onPress: () => router.push("/app/program") },
        { text: "OK" },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.header}>
          <Text style={s.heading}>Your Goals</Text>
          <Text style={s.sub}>
            Select your primary training goals. Your plan adapts to what matters
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
                  <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
                </View>
                <Text style={s.cardTitle}>{g.title}</Text>
                <Text style={s.cardSub}>{g.sub}</Text>
                <View style={[s.check, on && s.checkActive]}>
                  {on && (
                    <Text
                      style={{
                        color: "#0D0D0D",
                        fontSize: 11,
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

        {/* Selected summary */}
        <View style={s.summary}>
          <Text style={s.summaryText}>
            {selected.length === 1
              ? `1 goal selected — your plan is focused`
              : `${selected.length} goals selected — your plan is balanced`}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Button
            label={isLoading ? "Saving…" : "Save Goals"}
            onPress={handleSave}
            loading={isLoading}
          />
          <TouchableOpacity
            style={s.viewPlanBtn}
            onPress={() => router.push("/app/program")}
          >
            <Text style={s.viewPlanText}>View your adapted plan →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  heading: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#9A9A9A", fontSize: 14, lineHeight: 22 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
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
  cardActive: {
    borderColor: "#7ED957",
    backgroundColor: "rgba(126,217,87,0.05)",
  },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiActive: { backgroundColor: "rgba(126,217,87,0.12)" },
  cardTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cardSub: { color: "#5A5A5A", fontSize: 12, lineHeight: 17 },
  check: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
  summary: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(126,217,87,0.06)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "rgba(126,217,87,0.2)",
  },
  summaryText: {
    color: "#7ED957",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  viewPlanBtn: { marginTop: 14, alignItems: "center" },
  viewPlanText: { color: "#7ED957", fontSize: 13, fontWeight: "600" },
});
