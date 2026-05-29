// import "../global.css";
import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { loadStoredUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadStoredUser();
      const state = useAuthStore.getState();
      if (state.isAuthenticated) {
        router.replace("/app/(tabs)/home");
      } else {
        router.replace("/auth/onboard");
      }
    };
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="app/admin/dashboard" />
          <Stack.Screen name="app/admin/users" />
          <Stack.Screen name="app/admin/user-detail" />
          <Stack.Screen name="index" />
          <Stack.Screen
            name="auth/onboard"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="auth/welcome"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="auth/login" options={{ gestureEnabled: true }} />
          <Stack.Screen name="auth/signup" options={{ gestureEnabled: true }} />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen name="app/(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="app/workout/active"
            options={{ animation: "slide_from_bottom", gestureEnabled: false }}
          />
          <Stack.Screen
            name="app/workout/complete"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="app/chat"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="app/settings/change-password" />
          <Stack.Screen name="app/program" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
