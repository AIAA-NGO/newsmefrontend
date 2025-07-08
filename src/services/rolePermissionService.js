import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventorymanagementsystem-latest-37zl.onrender.com/api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const fetchRolePermissions = async (roleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/${roleId}/permissions`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Permissions fetch error:', error);
    throw error;
  }
};

export const assignRolePermissions = async (roleId, permissions) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/roles/${roleId}/permissions`,
      { permissions },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Permissions assignment error:', error);
    throw error;
  }
};

export const removeRolePermissions = async (roleId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/roles/${roleId}/permissions`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Permissions removal error:', error);
    throw error;
  }
};