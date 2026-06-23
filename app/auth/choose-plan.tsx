import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";
import api from "@/lib/api";

const PLANS = {
  monthly: {
    label: "Monthly",
    price: "£11.99",
    period: "/ month",
    priceId: "price_1TlBayKcyzUxSEDsnXZti9gR",
    features: ["Full member portal", "Personalised program", "Community runs", "The Lab learning hub"],
    badge: null,
  },
  annual: {
    label: "Annual",
    price: "£129.99",
    period: "/ year",
    priceId: "price_1TlBc3KcyzUxSEDsBHqJVqjE",
    features: ["Everything in Monthly", "Two months free", "Priority on retreats", "Best value"],
    badge: "SAVE ~10%",
  },
};

type Plan = keyof typeof PLANS;

export default function ChoosePlanScreen() {
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<Plan>("monthly");
  const [loading, setLoading]   = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const plan = PLANS[selected];
      const { data } = await api.post("/api/payments/create-checkout", {
        priceId: plan.priceId,
        email:   user?.email,
        userId:  user?._id,
      });

      // If the trial requires no upfront payment, the backend already marked
      // the user as subscribed/trialing — skip the card screen entirely.
      if (data.trialing) {
        router.push({
          pathname: "/auth/payment-success",
          params: { plan: selected, price: plan.price },
        });
        return;
      }

      // Otherwise we need to collect/confirm a card via the payment screen.
      router.push({
        pathname: "/auth/payment",
        params: { clientSecret: data.clientSecret, plan: selected, price: plan.price },
      });
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.trialBadge}>
          <Ionicons name="gift-outline" size={14} color={colors.primary} />
          <Text style={s.trialBadgeText}>7-DAY FREE TRIAL</Text>
        </View>
        <Text style={s.title}>Pick Your Plan</Text>
        <Text style={s.sub}>Try everything free for 7 days. Cancel any time.</Text>

        <View style={s.plansRow}>
          {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, plan]) => {
            const on = selected === key;
            return (
              <TouchableOpacity key={key} style={[s.planCard, on && s.planCardActive]} onPress={() => setSelected(key)} activeOpacity={0.8}>
                {plan.badge && <View style={s.saveBadge}><Text style={s.saveBadgeText}>{plan.badge}</Text></View>}
                <Text style={[s.planLabel, on && s.planLabelActive]}>{plan.label}</Text>
                <View style={s.priceRow}>
                  <Text style={[s.planPrice, on && s.planPriceActive]}>{plan.price}</Text>
                  <Text style={[s.planPeriod, on && s.planPeriodActive]}>{plan.period}</Text>
                </View>
                <View style={s.featureList}>
                  {plan.features.map(f => (
                    <View key={f} style={s.featureRow}>
                      <Ionicons name="checkmark" size={13} color={on ? colors.textOnPrimary : colors.primary} />
                      <Text style={[s.featureText, on && s.featureTextActive]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <View style={[s.selectBtn, on ? s.selectBtnActive : s.selectBtnOutline]}>
                  <Text style={[s.selectBtnText, on && s.selectBtnTextActive]}>{on ? "Selected" : "Select"}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.disclaimer}>Card captured today. You won't be charged until your trial ends.</Text>

        <TouchableOpacity style={[s.startBtn, loading && { opacity: 0.7 }]} onPress={handleStartTrial} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.textOnPrimary} />
            : <><Ionicons name="arrow-forward" size={18} color={colors.textOnPrimary} /><Text style={s.startBtnText}>Start 7-Day Free Trial</Text></>}
        </TouchableOpacity>

        <Text style={s.termsText}>
          By subscribing you agree to our Terms of Service and Privacy Policy. Powered by Stripe.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  trialBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: colors.primaryDim, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, borderWidth: 0.5, borderColor: colors.borderStrong },
  trialBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: "800", marginBottom: 6 },
  sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  plansRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  planCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  planCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  saveBadge: { alignSelf: "flex-start", backgroundColor: colors.warning, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginBottom: 8 },
  saveBadgeText: { color: "#000", fontSize: 9, fontWeight: "800" },
  planLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  planLabelActive: { color: "rgba(255,255,255,0.8)" },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginBottom: 14 },
  planPrice: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  planPriceActive: { color: colors.textOnPrimary },
  planPeriod: { color: colors.textTertiary, fontSize: 12 },
  planPeriodActive: { color: "rgba(255,255,255,0.7)" },
  featureList: { gap: 8, marginBottom: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  featureText: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  featureTextActive: { color: colors.textOnPrimary },
  selectBtn: { borderRadius: 50, paddingVertical: 10, alignItems: "center" },
  selectBtnActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  selectBtnOutline: { borderWidth: 0.5, borderColor: colors.borderStrong },
  selectBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  selectBtnTextActive: { color: colors.textOnPrimary },
  disclaimer: { color: colors.textTertiary, fontSize: 12, textAlign: "center", marginBottom: 20 },
  startBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 18, marginBottom: 16 },
  startBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: "800" },
  termsText: { color: colors.textTertiary, fontSize: 11, textAlign: "center", lineHeight: 18 },
});