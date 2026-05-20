import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;
  if (user) {
    // Force refresh=false for speed; Firebase refreshes automatically when near expiry
    const token = await user.getIdToken(false);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Token expired or missing — sign out and redirect to login
      import('./firebase').then(({ auth: firebaseAuth }) => {
        if (firebaseAuth?.currentUser) {
          firebaseAuth.signOut().catch(() => {});
        }
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

