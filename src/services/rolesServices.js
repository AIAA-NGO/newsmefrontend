import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Basic permissions fallback
const BASIC_PERMISSIONS = [
  { id: 1, name: 'user.create' },
  { id: 2, name: 'user.update' },
  { id: 3, name: 'user.delete' },
  { id: 4, name: 'role.manage' }
];

export const fetchRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Roles fetch error:', error.response?.data || error.message);
    throw new Error('Failed to load roles');
  }
};

export const fetchPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    return response.data;
  } catch (error) {
    console.error('Permissions fetch error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config.url
    });
    return BASIC_PERMISSIONS;
  }
};

export const fetchRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('Role permissions fetch error:', error.response?.data || error.message);
    throw new Error('Failed to load role permissions');
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Role creation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create role');
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Role update error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update role');
  }
};

export const deleteRole = async (id) => {
  try {
    await api.delete(`/roles/${id}`);
  } catch (error) {
    console.error('Role deletion error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete role');
  }
};

export const updateRolePermissions = async (id, permissionIds) => {
  try {
    const response = await api.put(`/roles/${id}/permissions`, { permissionIds });
    return response.data;
  } catch (error) {
    console.error('Permissions update error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update permissions');
  }
};