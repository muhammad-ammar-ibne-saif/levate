import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import api from "@/lib/api";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  token: string;
  pushToken?: string;
  currentWeek?: number;
  currentProgram?: string;
  goals?: string[];
  notificationsEnabled?: boolean;
  isAdmin?: boolean;    // ← admin flag
  daysPerWeek?: number;       
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadStoredUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  clearError: () => set({ error: null }),

  loadStoredUser: async () => {
    try {
      const stored = await SecureStore.getItemAsync("user_data");
      const token  = await SecureStore.getItemAsync("auth_token");
      if (stored && token) {
        const user = JSON.parse(stored);
        set({ user: { ...user, token }, isAuthenticated: true });
      }
    } catch {}
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      const user: User = { ...data.user, token: data.token };
      await SecureStore.setItemAsync("auth_token", data.token);
      await SecureStore.setItemAsync("user_data", JSON.stringify(data.user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Invalid email or password.";
      set({ error: msg, isLoading: false });
    }
  },

  signup: async (firstName, lastName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/api/auth/register", { firstName, lastName, email, password });
      const user: User = { ...data.user, token: data.token };
      await SecureStore.setItemAsync("auth_token", data.token);
      await SecureStore.setItemAsync("user_data", JSON.stringify(data.user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Signup failed. Try again.";
      set({ error: msg, isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("user_data");
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true });
    try {
      const { data: updated } = await api.put("/api/user/profile", data);
      const newUser = { ...user, ...updated.user };
      await SecureStore.setItemAsync("user_data", JSON.stringify(newUser));
      set({ user: newUser, isLoading: false });
    } catch {
      set({ isLoading: false, error: "Failed to update profile." });
    }
  },
}));
