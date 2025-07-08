import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create a single axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================
export const loginUser = async ({ username, password }) => {
  return await api.post('/auth/login', { username, password });
};

export const registerUser = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const refreshToken = async () => {
  return await api.post('/auth/refresh-token');
};

export const fetchCurrentUser = async () => {
  return await api.get('/auth/me');
};

// ==================== USER ENDPOINTS ====================
export const createUser = async (userData) => {
  return await api.post('/users', userData);
};

export const getAllUsers = async () => {
  return await api.get('/users');
};

export const getUserById = async (id) => {
  return await api.get(`/users/${id}`);
};

export const updateUser = async (id, userData) => {
  return await api.put(`/users/${id}`, userData);
};

export const deleteUser = async (id) => {
  return await api.delete(`/users/${id}`);
};

export const getAllRoles = async () => {
  return await api.get('/users/roles');
};

// ==================== DISCOUNT ENDPOINTS ====================
export const createDiscount = async (discountData) => {
  return await api.post('/discounts', discountData);
};

export const getAllDiscounts = async () => {
  return await api.get('/discounts');
};

export const getActiveDiscounts = async () => {
  return await api.get('/discounts/active');
};

export const deleteDiscount = async (id) => {
  return await api.delete(`/discounts/${id}`);
};

export default api;