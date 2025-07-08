import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/users`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data?.message || 'Failed to fetch users';
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error.response?.data?.message || 'Failed to fetch user';
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_BASE, userData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response?.data?.message || 'Failed to create user';
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, userData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error.response?.data?.message || 'Failed to update user';
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error.response?.data?.message || 'Failed to delete user';
  }
};

export const fetchAllRoles = async () => {
  try {
    const response = await axios.get(`${API_BASE}/roles`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error.response?.data?.message || 'Failed to fetch roles';
  }
};

export const updateUserRoles = async (userId, roles) => {
  try {
    const response = await axios.put(
      `${API_BASE}/${userId}/roles`,
      { roles },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error.response?.data?.message || 'Failed to update roles';
  }
};