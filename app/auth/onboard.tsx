import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    tag: "Adaptive Training",
    title: "Train Smarter for",
    highlight: "Every Race Ahead",
    desc: "Build your hybrid program around your race, your schedule, and your current fitness.",
  },
  {
    id: "2",
    tag: "Intelligent Plans",
    title: "Your Plan Adapts",
    highlight: "As You Train",
    desc: "We adjust weekly workouts when you miss sessions, recover slower, or improve faster.",
  },
  {
    id: "3",
    tag: "Clear Insights",
    title: "See Progress",
    highlight: "That Matters",
    desc: "Track strength, endurance, and readiness in one simple dashboard built for performance.",
  },
];

export default function OnboardScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push("/auth/welcome");
    }
  };

  const renderSlide: ListRenderItem<(typeof slides)[0]> = ({ item }) => (
    <View style={[s.slide, { width }]}>
      <View style={s.imageBox}>
        <View style={s.avatarCircle} />
        <View style={s.avatarBody} />
        <View style={s.avatarLegs} />
      </View>
      <View style={s.tagRow}>
        <Text style={s.tagText}>{item.tag}</Text>
      </View>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.titleHighlight}>{item.highlight}</Text>
      <Text style={s.desc}>{item.desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity
        style={s.skipBtn}
        onPress={() => router.push("/auth/welcome")}
      >
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={s.logoRow}>
        <View style={s.logoBox}>
          <Text style={s.logoL}>L</Text>
        </View>
        <Text style={s.logoText}>Team L-Evate</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      />

      <View style={s.bottom}>
        <View style={s.dotsRow}>
          {slides.map((_, i) => (
            <View key={i} style={[s.dot, i === currentIndex && s.dotActive]} />
          ))}
        </View>
        <Button
          label={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  skipBtn: { alignItems: "flex-end", paddingHorizontal: 24, paddingTop: 8 },
  skipText: { color: "#5A5A5A", fontSize: 14 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    marginTop: 8,
    marginBottom: 12,
  },
  logoBox: {
    width: 34,
    height: 34,
    backgroundColor: "#7ED957",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoL: { color: "#0D0D0D", fontWeight: "800", fontSize: 18 },
  logoText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  slide: { paddingHorizontal: 28, paddingTop: 8 },
  imageBox: {
    height: 220,
    backgroundColor: "#1E1E1E",
    borderRadius: 24,
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#7ED957",
    marginBottom: 8,
  },
  avatarBody: {
    width: 2,
    height: 60,
    backgroundColor: "rgba(126,217,87,0.4)",
    borderRadius: 1,
  },
  avatarLegs: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(126,217,87,0.3)",
    borderRadius: 1,
    marginTop: 4,
  },
  tagRow: {
    backgroundColor: "rgba(126,217,87,0.12)",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  tagText: {
    color: "#7ED957",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", lineHeight: 34 },
  titleHighlight: {
    color: "#7ED957",
    fontSize: 28,
    fontWeight: "800",
    fontStyle: "italic",
    lineHeight: 34,
    marginBottom: 12,
  },
  desc: { color: "#9A9A9A", fontSize: 14, lineHeight: 22 },
  bottom: { paddingHorizontal: 28, paddingBottom: 32, gap: 16 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 4, borderRadius: 2, backgroundColor: "#2A2A2A" },
  dotActive: { width: 24, backgroundColor: "#7ED957" },
});
