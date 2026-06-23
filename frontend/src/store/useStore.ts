import { create } from "zustand";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
    set({ token });
  },
  
  logout: () => {
    localStorage.removeItem("access_token");
    set({ user: null, token: null });
  },
  
  isAuthenticated: () => {
    const state = get();
    return !!state.token && !!state.user;
  },
}));

interface NotificationState {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    timestamp: number;
  }>;
  addNotification: (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (title, message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Math.random().toString(36).substr(2, 9),
          title,
          message,
          type,
          timestamp: Date.now(),
        },
      ],
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

interface ScanState {
  scans: Array<{
    scan_id: string;
    cancer_type: string;
    prediction: string;
    confidence: number;
    created_at: string;
  }>;
  setScans: (scans: any[]) => void;
  addScan: (scan: any) => void;
}

export const useScanStore = create<ScanState>((set) => ({
  scans: [],
  
  setScans: (scans) => set({ scans }),
  
  addScan: (scan) =>
    set((state) => ({
      scans: [scan, ...state.scans],
    })),
}));
