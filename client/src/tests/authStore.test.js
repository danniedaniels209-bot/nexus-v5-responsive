import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import api from '../api/axios';
import useAuthStore from '../context/authStore';

// Helper to reset zustand store between tests
const resetStore = () => useAuthStore.setState({
  user: null, token: null, loading: true, error: null,
});

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with no user and loading true', () => {
    const { user, token, loading } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(loading).toBe(true);
  });

  it('login: stores token and user on success', async () => {
    const mockUser  = { id: '1', username: 'alice', email: 'alice@test.com' };
    const mockToken = 'jwt.abc.def';
    api.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });

    await act(async () => {
      await useAuthStore.getState().login('alice@test.com', 'password123');
    });

    const { user, token } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(token).toBe(mockToken);
    expect(localStorage.getItem('nexus_token')).toBe(mockToken);
  });

  it('login: does not update state on failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(
      act(async () => { await useAuthStore.getState().login('bad@test.com', 'wrong'); })
    ).rejects.toThrow();

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('register: stores token and user on success', async () => {
    const mockUser  = { id: '2', username: 'bob', email: 'bob@test.com' };
    const mockToken = 'jwt.reg.token';
    api.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });

    await act(async () => {
      await useAuthStore.getState().register('bob', 'bob@test.com', 'secure123');
    });

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(localStorage.getItem('nexus_token')).toBe(mockToken);
  });

  it('logout: clears user and token', async () => {
    // Seed state
    useAuthStore.setState({ user: { id: '1', username: 'alice' }, token: 'tok' });
    localStorage.setItem('nexus_token', 'tok');
    api.post.mockResolvedValueOnce({});

    await act(async () => { await useAuthStore.getState().logout(); });

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(localStorage.getItem('nexus_token')).toBeNull();
  });

  it('updateUser: merges partial updates into user', () => {
    useAuthStore.setState({ user: { id: '1', username: 'alice', bio: '' } });

    act(() => { useAuthStore.getState().updateUser({ bio: 'Hello world' }); });

    expect(useAuthStore.getState().user?.bio).toBe('Hello world');
    expect(useAuthStore.getState().user?.username).toBe('alice');
  });

  it('init: sets loading to false when no token stored', async () => {
    await act(async () => { await useAuthStore.getState().init(); });
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('init: fetches user when token exists', async () => {
    localStorage.setItem('nexus_token', 'valid.token');
    const mockUser = { id: '1', username: 'alice' };
    api.get.mockResolvedValueOnce({ data: { user: mockUser } });

    await act(async () => { await useAuthStore.getState().init(); });

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('init: clears token and user if /auth/me throws', async () => {
    localStorage.setItem('nexus_token', 'expired.token');
    api.get.mockRejectedValueOnce(new Error('401'));
    api.post.mockRejectedValueOnce(new Error('refresh failed'));

    await act(async () => { await useAuthStore.getState().init(); });

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().loading).toBe(false);
    expect(localStorage.getItem('nexus_token')).toBeNull();
  });
});