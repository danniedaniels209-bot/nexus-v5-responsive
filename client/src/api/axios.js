import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // send HTTP-only refresh-token cookie automatically
});

// ── Track in-flight refresh to prevent duplicate calls ──────────────────────
let _refreshing = false;
let _refreshQueue = [];

function flushQueue(token, error) {
  _refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  _refreshQueue = [];
}

// ── REQUEST: attach access token ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── RESPONSE: handle 401 → silent token refresh ──────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Only attempt refresh on 401, not already retried, not on auth endpoints
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes('/auth/refresh') &&
      !original.url.includes('/auth/login') &&
      !original.url.includes('/auth/register')
    ) {
      original._retry = true;

      if (_refreshing) {
        // Queue the request and wait for ongoing refresh
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      _refreshing = true;
      try {
        // Refresh token lives in HTTP-only cookie — no body needed
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;
        localStorage.setItem('nexus_token', newToken);

        // Update store token without importing the store (avoids circular dep)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        flushQueue(newToken, null);
        _refreshing = false;

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        flushQueue(null, refreshErr);
        _refreshing = false;
        localStorage.removeItem('nexus_token');
        // Dispatch a custom event so the auth store can react
        window.dispatchEvent(new Event('nexus:logout'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
