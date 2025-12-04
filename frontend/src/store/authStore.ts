'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, Role } from '@/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;

  // Helpers
  hasRole: (roles: Role[]) => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isOperator: () => boolean;
  isClient: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      hasRole: (roles) => {
        const user = get().user;
        return user ? roles.includes(user.role) : false;
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isSupervisor: () => get().user?.role === 'SUPERVISOR',
      isOperator: () => get().user?.role === 'OPERATOR',
      isClient: () => get().user?.role === 'CLIENT',
      isStaff: () => {
        const role = get().user?.role;
        return role === 'ADMIN' || role === 'SUPERVISOR' || role === 'OPERATOR';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set hydration flag after rehydration is complete
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

