import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Chore APIs
export const choreAPI = {
  getAll: () => api.get('/chores'),
  create: (choreData) => api.post('/chores', choreData),
  complete: (choreId) => api.put(`/chores/${choreId}/complete`),
};

// Expense APIs
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  create: (expenseData) => api.post('/expenses', expenseData),
  settle: (expenseId) => api.put(`/expenses/${expenseId}/settle`),
};

// Balance APIs
export const balanceAPI = {
  getAll: () => api.get('/balances'),
  getMyDebts: () => api.get('/balances/my-debts'),
};

export default api;
