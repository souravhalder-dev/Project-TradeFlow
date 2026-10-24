import { create } from 'zustand';

export interface UserSummary {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN';
  profile: {
    companyName?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
    jobTitle?: string | null;
    country?: string | null;
  } | null;
  businesses: Array<{
    id: string;
    name: string;
    slug: string;
    isVerified: boolean;
    logoUrl?: string | null;
  }>;
  cartCount: number;
  unreadNotifications: number;
}

interface AuthState {
  user: UserSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: UserSummary | null) => void;
  loginWithDemo: (role: 'BUYER' | 'SUPPLIER' | 'ADMIN') => Promise<boolean>;
  logout: () => Promise<void>;
  incrementCart: (amount?: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: Boolean(user), isLoading: false }),

  loginWithDemo: async (role) => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: `demo_token_${role.toLowerCase()}_123`,
          role,
        }),
      });

      if (res.ok) {
        await get().fetchUser();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, isAuthenticated: false });
      window.location.href = '/';
    }
  },

  incrementCart: (amount = 1) => {
    const cur = get().user;
    if (cur) {
      set({ user: { ...cur, cartCount: cur.cartCount + amount } });
    }
  },
}));
