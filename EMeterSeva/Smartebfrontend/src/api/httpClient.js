import axios from 'axios';

// Axios instance that injects the JWT from localStorage into every request.
const httpClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

httpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default httpClient;
