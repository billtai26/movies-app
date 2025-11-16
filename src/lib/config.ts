// Toggle between mock data and real backend API
export const useMock = false
// Base URL for your backend when useMock = false
export const BASE_URL = "http://localhost:8017/v1" // change when backend is ready
export const AUTH_ENDPOINTS = {
  login: [
    "/users/login"
  ],
  register: [
    "/users/register"
  ],
  forgotPassword: [
    "/users/forgot-password"
  ]
}
