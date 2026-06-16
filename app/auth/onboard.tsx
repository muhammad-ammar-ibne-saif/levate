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
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { colors, spacing } from "../../lib/theme";

const { width } = Dimensions.get("window");

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const slides: {
  id: string;
  icon: IconName;
  tag: string;
  title: string;
  highlight: string;
  desc: string;
}[] = [
  {
    id: "1",
    icon: "trending-up-outline",
    tag: "Your Next Level Of Fitness",
    title: "The door is open —",
    highlight: "the people inside are the reason you stay",
    desc: "This app is the door. The people within are the reason you stay, and why you become fitter than you thought possible.",
  },
  {
    id: "2",
    icon: "compass-outline",
    tag: "A Plan That Knows Your Life",
    title: "No guesswork.",
    highlight: "Just clarity",
    desc: "We find out your goal, your availability and your fitness level — so you're always clear on how to get fitter.",
  },
  {
    id: "3",
    icon: "people-outline",
    tag: "Join the Community",
    title: "Ambitious athletes,",
    highlight: "all levelling up together",
    desc: "The people within this ecosystem want to level up — and help others do the same. Complete synergy.",
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
        <View style={s.iconCircle}>
          <Ionicons name={item.icon} size={36} color={colors.primary} />
        </View>
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
          <Ionicons name="triangle" size={18} color={colors.textOnPrimary} />
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
  safe: { flex: 1, backgroundColor: colors.background },
  skipBtn: {
    alignItems: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingTop: 8,
  },
  skipText: { color: colors.textTertiary, fontSize: 14 },
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
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: colors.textPrimary, fontWeight: "700", fontSize: 16 },
  slide: { paddingHorizontal: 28, paddingTop: 8 },
  imageBox: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(122,61,240,0.25)",
  },
  tagRow: {
    backgroundColor: colors.primaryDim,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  titleHighlight: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
    fontStyle: "italic",
    lineHeight: 34,
    marginBottom: 12,
  },
  desc: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  bottom: { paddingHorizontal: 28, paddingBottom: 32, gap: 16 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
  },
  dotActive: { width: 24, backgroundColor: colors.primary },
});
