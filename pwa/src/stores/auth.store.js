import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

import { initializeGoogleAuth } from 'src/utils/google';
import { checkSession, loginWithGoogle, logout } from 'src/utils/django';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      sessionId: null,
      csrfToken: null,
      isLoading: false,
      error: null,

      // Setters
      setUser: (user) => set({ user }),
      setSessionId: (sessionId) => set({ sessionId }),
      setCsrfToken: (csrfToken) => set({ csrfToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Initialize Google Auth
      initGoogleAuth: (callback) => {
        initializeGoogleAuth(async (credentialResponse) => {
          try {
            set({ isLoading: true, error: null });
            const response = await loginWithGoogle(credentialResponse.credential);
            set({
              user: response.data.user,
              sessionId: Cookies.get('sessionid'),
              csrfToken: Cookies.get('csrftoken'),
              isLoading: false,
            });
            callback();
          } catch (err) {
            set({ error: err.message, isLoading: false });
          } finally {
            set({ isLoading: false })
          }
        });
      },

      // Check session on app load
      checkSession: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await checkSession();
          set({
            user: response.data.user || null,
            sessionId: Cookies.get('sessionid') || null,
            csrfToken: Cookies.get('csrftoken') || null,
            isLoading: false
          });
          return response.data;
        } catch (err) {
          set({ error: err?.message, isLoading: false });
          return null;
        } finally {
          set({ isLoading: false })
        }
      },

      // Logout
      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await logout();
          set({ user: null, sessionId: null, csrfToken: null, isLoading: false });
        } catch (err) {
          set({ error: err?.message, isLoading: false });
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage', // Persist in localStorage for PWA
      getStorage: () => localStorage,
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['isLoading, error'].includes(key)),
      ),
    }
  )
);

// Initialize session on app load
useAuthStore.getState().checkSession();

export default useAuthStore;
