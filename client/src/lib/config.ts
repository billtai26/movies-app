export const BASE_URL =
  (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8017');
