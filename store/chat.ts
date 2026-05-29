import { create } from "zustand";
import api from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string, userContext: Record<string, any>) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (text, userContext) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true,
    }));

    try {
      const { messages } = get();
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data } = await api.post("/api/chat", {
        message: text,
        history,
        userContext,
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || data.message,
        timestamp: new Date(),
      };

      set((s) => ({
        messages: [...s.messages, assistantMsg],
        isLoading: false,
      }));
    } catch (error) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      set((s) => ({
        messages: [...s.messages, errMsg],
        isLoading: false,
      }));
    }
  },

  clearChat: () => set({ messages: [] }),
}));
