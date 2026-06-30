import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Our backend base URL
});

// Intercept requests to add the JWT token
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

// We can also add a response interceptor later to handle 401s (token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // In a real app, we might clear local storage and redirect to login
      // localStorage.removeItem('bus_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
