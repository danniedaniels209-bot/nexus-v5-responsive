import axios from 'axios';

// Use build-time Vite variable, fallback to your specific Render backend, or local /api.
const base = import.meta.env.VITE_API_URL || 'https://nexus-v5-responsiv.onrender.com/api';

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let _refreshing = false;
let _refreshQueue = [];

function flushQueue(token, error) {
  _refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  _refreshQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes('/auth/refresh') &&
      !original.url.includes('/auth/login') &&
      !original.url.includes('/auth/register')
    ) {
      original._retry = true;

      if (_refreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      _refreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;
        localStorage.setItem('nexus_token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        flushQueue(newToken, null);
        _refreshing = false;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        flushQueue(null, refreshErr);
        _refreshing = false;
        localStorage.removeItem('nexus_token');
        window.dispatchEvent(new Event('nexus:logout'));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
