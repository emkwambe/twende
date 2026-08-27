import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const tokensRaw = localStorage.getItem('twende_tokens');
  if (tokensRaw) {
    try {
      const tokens = JSON.parse(tokensRaw);
      if (tokens.access_token) {
        config.headers.Authorization = `Bearer ${tokens.access_token}`;
      }
    } catch {
      // ignore malformed localStorage
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokensRaw = localStorage.getItem('twende_tokens');
        if (!tokensRaw) throw new Error('No tokens');
        const tokens = JSON.parse(tokensRaw);

        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: tokens.refresh_token,
        });
        const newTokens = refreshResponse.data;
        localStorage.setItem('twende_tokens', JSON.stringify(newTokens));
        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('twende_tokens');
        localStorage.removeItem('twende_user');
        window.location.href = '/#/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
