import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://fixmymohalla.onrender.com",
});

// Request interceptor: har request ke saath JWT token attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: agar 401 aaya, auto-logout + redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;