import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/auth";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  const { loadStoredUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadStoredUser();
      const state = useAuthStore.getState();

      if (!state.isAuthenticated) {
        router.replace("/auth/onboard");
        return;
      }

      const user = state.user as any;

      // Not onboarded yet — complete onboarding first
      if (!user?.onboardingComplete) {
        router.replace("/auth/personalize");
        return;
      }

      // Onboarded but not subscribed — go to plan selection
      if (!user?.subscribed) {
        router.replace("/auth/choose-plan");
        return;
      }

      // Fully set up — go to main app
      router.replace("/app/(tabs)/home");
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade", gestureEnabled: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/onboard"           options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/welcome"           options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/login"             options={{ gestureEnabled: true }} />
        <Stack.Screen name="auth/signup"            options={{ gestureEnabled: true }} />
        <Stack.Screen name="auth/forgot-password"   options={{ gestureEnabled: true }} />
        <Stack.Screen name="auth/personalize"       options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/choose-plan"       options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/payment"           options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/payment-success"   options={{ gestureEnabled: false }} />
        <Stack.Screen name="app/(tabs)"             options={{ gestureEnabled: false }} />
        <Stack.Screen name="app/workout/active"     options={{ animation: "slide_from_bottom", gestureEnabled: false }} />
        <Stack.Screen name="app/workout/complete"   options={{ gestureEnabled: false }} />
        <Stack.Screen name="app/chat"               options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="app/settings/change-password" />
        <Stack.Screen name="app/program" />
        <Stack.Screen name="app/admin/dashboard" />
        <Stack.Screen name="app/admin/users" />
        <Stack.Screen name="app/admin/user-detail" />
      </Stack>
    </GestureHandlerRootView>
  );
}
