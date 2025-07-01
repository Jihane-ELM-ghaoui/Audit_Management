import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Backend FastAPI
});

api.interceptors.request.use(async (config) => {
  const token = keycloak?.token;

  if (token) {
    try {
      await keycloak.updateToken(5); // rafraîchir si nécessaire
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (err) {
      console.error('Token refresh failed', err);
    }
  }

  return config;
});

export default api;
