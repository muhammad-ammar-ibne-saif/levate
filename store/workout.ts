import { create } from "zustand";
import api from "@/lib/api";

export interface WorkoutSession {
  id: string;
  name: string;
  type: "lift" | "run" | "race";
  durationSeconds: number;
  setsCompleted: number;
  calories: number;
  completedAt: Date;
}

interface WorkoutState {
  // Active workout
  isActive: boolean;
  isPaused: boolean;
  currentWorkout: string;
  currentType: "lift" | "run" | "race";
  elapsedSeconds: number;
  setsCompleted: number;
  calories: number;

  // History
  sessions: WorkoutSession[];

  // Actions
  startWorkout: (name: string, type: "lift" | "run" | "race") => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  tickSecond: () => void;
  endWorkout: () => Promise<WorkoutSession>;
  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isActive: false,
  isPaused: false,
  currentWorkout: "",
  currentType: "lift",
  elapsedSeconds: 0,
  setsCompleted: 0,
  calories: 0,
  sessions: [],

  startWorkout: (name, type) => {
    set({
      isActive: true,
      isPaused: false,
      currentWorkout: name,
      currentType: type,
      elapsedSeconds: 0,
      setsCompleted: 0,
      calories: 0,
    });
  },

  pauseWorkout: () => set({ isPaused: true }),
  resumeWorkout: () => set({ isPaused: false }),

  tickSecond: () => {
    const { isPaused, elapsedSeconds, setsCompleted, calories } = get();
    if (isPaused) return;
    const newSecs = elapsedSeconds + 1;
    // Increment sets and cals every 15 seconds
    const newSets = newSecs % 15 === 0 ? setsCompleted + 1 : setsCompleted;
    const newCals = newSecs % 15 === 0 ? calories + 3 : calories;
    set({ elapsedSeconds: newSecs, setsCompleted: newSets, calories: newCals });
  },

  endWorkout: async () => {
    const { currentWorkout, currentType, elapsedSeconds, setsCompleted, calories } =
      get();
    const session: WorkoutSession = {
      id: Date.now().toString(),
      name: currentWorkout,
      type: currentType,
      durationSeconds: elapsedSeconds,
      setsCompleted,
      calories,
      completedAt: new Date(),
    };

    // Save to backend
    try {
      await api.post("/api/workouts/complete", {
        name: currentWorkout,
        type: currentType,
        durationMinutes: Math.round(elapsedSeconds / 60),
        setsCompleted,
        calories,
      });
    } catch (e) {
      // Fail silently — data saved locally in sessions array
    }

    set((s) => ({
      sessions: [session, ...s.sessions],
      isActive: false,
      isPaused: false,
    }));

    return session;
  },

  resetWorkout: () => {
    set({
      isActive: false,
      isPaused: false,
      elapsedSeconds: 0,
      setsCompleted: 0,
      calories: 0,
    });
  },
}));
