import { create } from "zustand"

import supabase from "src/utils/supabase"

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true, // Track loading state
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error('Google sign-in error:', error);
  },
  signInWithEmail: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('E-mail sign-in error:', error);
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}))

// Initialize auth state on app load
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({
    session,
    user: session?.user || null,
    isLoading: false,
  });
})

// Listen for auth changes (e.g., login, logout)
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user || null,
    isLoading: false,
  });
})

export default useAuthStore
