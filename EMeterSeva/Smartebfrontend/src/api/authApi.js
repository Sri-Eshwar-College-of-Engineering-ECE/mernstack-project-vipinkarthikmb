// src/api/authApi.js
import httpClient from './httpClient';

const API_URL = '/auth';

export const signup = (data) => httpClient.post(`${API_URL}/signup`, data);
export const login = (data) => httpClient.post(`${API_URL}/login`, data);

