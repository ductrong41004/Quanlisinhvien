import axios from 'axios';

// Tính toán IP của backend dưa theo IP đang truy cập Frontend (Hỗ trợ truy cập từ Mobile trong mạng LAN)
const apiHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${apiHost}:8080`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
