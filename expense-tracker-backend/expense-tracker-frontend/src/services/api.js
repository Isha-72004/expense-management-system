// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AI Helper Functions
export async function askFinancialCopilot(message) {
  const response = await API.post('/api/ai/copilot', { message });
  return response.data.data;
}

export async function parseExpenseText(text) {
  const response = await API.post('/api/ai/parse-text', { text, referenceDate: new Date().toISOString() });
  return response.data.data;
}

export async function parseReceiptImage(file) {
  const formData = new FormData();
  formData.append('receipt', file);
  const response = await API.post('/api/ai/parse-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export default API;