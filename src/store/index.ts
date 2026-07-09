import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  examDate?: string;
  dailyGoalHours: number;
  role: string;
  totalXp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "dataprev-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      globalSearchOpen: false,
      setGlobalSearchOpen: (v) => set({ globalSearchOpen: v }),
    }),
    {
      name: "dataprev-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

interface TimerState {
  isRunning: boolean;
  mode: "pomodoro" | "free";
  seconds: number;
  pomodoroPhase: "work" | "break" | "long-break";
  pomodoroCount: number;
  selectedTopicId: string | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: "pomodoro" | "free") => void;
  setTopic: (id: string | null) => void;
}

export const useTimerStore = create<TimerState>()((set) => ({
  isRunning: false,
  mode: "pomodoro",
  seconds: 25 * 60,
  pomodoroPhase: "work",
  pomodoroCount: 0,
  selectedTopicId: null,
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () =>
    set({ isRunning: false, seconds: 25 * 60, pomodoroPhase: "work" }),
  tick: () =>
    set((state) => {
      if (state.seconds <= 0) {
        const nextPhase =
          state.pomodoroPhase === "work"
            ? state.pomodoroCount % 4 === 3
              ? "long-break"
              : "break"
            : "work";
        const nextSeconds =
          nextPhase === "work"
            ? 25 * 60
            : nextPhase === "break"
            ? 5 * 60
            : 15 * 60;
        return {
          pomodoroPhase: nextPhase,
          seconds: nextSeconds,
          pomodoroCount:
            state.pomodoroPhase === "work"
              ? state.pomodoroCount + 1
              : state.pomodoroCount,
          isRunning: false,
        };
      }
      return { seconds: state.seconds - 1 };
    }),
  setMode: (mode) =>
    set({
      mode,
      seconds: mode === "pomodoro" ? 25 * 60 : 0,
      isRunning: false,
    }),
  setTopic: (id) => set({ selectedTopicId: id }),
}));
