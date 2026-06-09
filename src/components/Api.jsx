import axios from "axios";

export const API_BASE_URL = "https://e-commerce-app-backend1.vercel.app/api";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;