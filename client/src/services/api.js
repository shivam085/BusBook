import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Our backend base URL
  withCredentials: true, // Important for sending/receiving cookies
});

// Intercept requests to add the JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s (token expiry) and retry with new token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh-token', {}, { withCredentials: true });
        
        // Save the new access token
        localStorage.setItem('bus_token', data.data.accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out
        localStorage.removeItem('bus_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
