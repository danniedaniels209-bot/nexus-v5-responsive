import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem('nexus_token') || null,
  loading: true,
  error:   null,

  // ── Boot: verify stored token with server ────────────────────────────────
  init: async () => {
    const token = localStorage.getItem('nexus_token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, loading: false, error: null });
    } catch {
      // Token invalid → try silent refresh via cookie
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('nexus_token', data.token);
        const me = await api.get('/auth/me');
        set({ user: me.data.user, token: data.token, loading: false, error: null });
      } catch {
        localStorage.removeItem('nexus_token');
        set({ user: null, token: null, loading: false, error: null });
      }
    }
  },

  // ── Register ─────────────────────────────────────────────────────────────
  register: async (username, email, password) => {
    set({ error: null });
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('nexus_token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ error: null });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('nexus_token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* best-effort */ }
    localStorage.removeItem('nexus_token');
    set({ user: null, token: null, error: null });
  },

  // ── Patch user in store after profile edits ───────────────────────────────
  updateUser: (updates) =>
    set((s) => ({ user: s.user ? { ...s.user, ...updates } : s.user })),

  // ── Update token (called by axios interceptor after refresh) ──────────────
  setToken: (token) => {
    localStorage.setItem('nexus_token', token);
    set({ token });
  },

  // ── Clear error ───────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));

export default useAuthStore;