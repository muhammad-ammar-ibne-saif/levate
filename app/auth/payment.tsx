import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { colors, radius, spacing } from "@/lib/theme";
import api from "@/lib/api";

export default function PaymentScreen() {
  const { clientSecret, plan, price } = useLocalSearchParams<{
    clientSecret: string; plan: string; price: string;
  }>();
  const { user, updateProfile } = useAuthStore();

  const [cardNumber, setCardNumber]   = useState("");
  const [expiry, setExpiry]           = useState("");
  const [cvc, setCvc]                 = useState("");
  const [name, setName]               = useState(
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
  );
  const [loading, setLoading]         = useState(false);

  // Format card number with spaces every 4 digits
  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  // Format expiry as MM/YY
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const validate = () => {
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length < 16) { Alert.alert("Invalid card", "Enter a valid 16-digit card number."); return false; }
    if (expiry.length < 5)   { Alert.alert("Invalid expiry", "Enter expiry as MM/YY."); return false; }
    if (cvc.length < 3)      { Alert.alert("Invalid CVC", "Enter a valid 3-digit CVC."); return false; }
    if (!name.trim())        { Alert.alert("Name required", "Enter the cardholder name."); return false; }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const [expMonth, expYear] = expiry.split("/");
      const { data } = await api.post("/api/payments/confirm", {
        clientSecret,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expMonth: expMonth?.trim(),
        expYear:  expYear?.trim(),
        cvc: cvc.trim(),
        name: name.trim(),
      });

      if (data.success) {
        // Mark user as subscribed
        await updateProfile({ subscribed: true, plan } as any);
        router.replace("/auth/payment-success");
      } else {
        Alert.alert("Payment failed", data.message || "Please check your card details and try again.");
      }
    } catch (err: any) {
      Alert.alert("Payment error", err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          <Text style={s.backText}>Change Plan</Text>
        </TouchableOpacity>

        <Text style={s.title}>Start Your 7-Day Free Trial</Text>
        <Text style={s.sub}>No charge until day 8. Cancel any time.</Text>

        {/* Plan summary */}
        <View style={s.planSummary}>
          <View style={s.planSummaryLeft}>
            <Text style={s.planSummaryLabel}>Try L-Evate Membership</Text>
            <Text style={s.planSummaryName}>7 days free</Text>
            <Text style={s.planSummaryThen}>Then {price} starting after trial</Text>
            <Text style={s.planSummaryDesc}>
              Structured hybrid training programs, community runs, and member-only content.
            </Text>
          </View>
        </View>

        {/* Email display */}
        <View style={s.emailRow}>
          <Text style={s.emailLabel}>Email</Text>
          <Text style={s.emailVal}>{user?.email}</Text>
        </View>

        {/* Payment method */}
        <Text style={s.sectionLabel}>Payment Method</Text>

        <View style={s.cardIcons}>
          <Ionicons name="card-outline" size={24} color={colors.textTertiary} />
          <Text style={s.cardIconsText}>Visa · Mastercard · Amex</Text>
        </View>

        {/* Card fields */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>Cardholder Name</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Name on card"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Card Number</Text>
          <TextInput
            style={s.input}
            value={cardNumber}
            onChangeText={v => setCardNumber(formatCard(v))}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={s.fieldRow}>
          <View style={[s.field, { flex: 1 }]}>
            <Text style={s.fieldLabel}>Expiry</Text>
            <TextInput
              style={s.input}
              value={expiry}
              onChangeText={v => setExpiry(formatExpiry(v))}
              placeholder="MM/YY"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={[s.field, { flex: 1 }]}>
            <Text style={s.fieldLabel}>CVC</Text>
            <TextInput
              style={s.input}
              value={cvc}
              onChangeText={v => setCvc(v.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={s.saveRow}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textTertiary} />
          <Text style={s.saveText}>Payments are processed securely via Stripe. We never store card details.</Text>
        </View>

        <TouchableOpacity
          style={[s.payBtn, loading && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.textOnPrimary} />
            : <Text style={s.payBtnText}>Start Trial</Text>}
        </TouchableOpacity>

        <Text style={s.termsText}>
          By subscribing you authorise L-Evate to charge you according to the terms until you cancel.
          Powered by Stripe.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  planSummary: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: colors.border },
  planSummaryLabel: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  planSummaryName: { color: colors.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: 2 },
  planSummaryThen: { color: colors.primary, fontSize: 13, fontWeight: "600", marginBottom: 8 },
  planSummaryDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  emailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.sm, padding: 14, marginBottom: 20, borderWidth: 0.5, borderColor: colors.border },
  emailLabel: { color: colors.textTertiary, fontSize: 13 },
  emailVal: { color: colors.textPrimary, fontSize: 13, fontWeight: "500" },
  sectionLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "700", marginBottom: 12 },
  cardIcons: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardIconsText: { color: colors.textTertiary, fontSize: 12 },
  field: { marginBottom: 14 },
  fieldLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15 },
  fieldRow: { flexDirection: "row", gap: 12 },
  saveRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: colors.primaryDim, borderRadius: radius.sm, padding: 12, marginBottom: 20, borderWidth: 0.5, borderColor: colors.borderStrong },
  saveText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, flex: 1 },
  payBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 18, alignItems: "center", marginBottom: 16 },
  payBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: "800" },
  termsText: { color: colors.textTertiary, fontSize: 11, textAlign: "center", lineHeight: 18 },
});
