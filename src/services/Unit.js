import axios from 'axios';

// Use environment variable with fallback to local development URL
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://https://inventorymanagementsystem-latest-37zl.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
  };
};

export const getUnits = async () => {
  try {
    const response = await axios.get(`${API_BASE}/units`, getAuthHeaders());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const addUnit = async (unit) => {
  try {
    const response = await axios.post(`${API_BASE}/units`, unit, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error adding unit:', error);
    throw error;
  }
};

export const updateUnit = async (id, unit) => {
  try {
    const response = await axios.put(`${API_BASE}/units/${id}`, unit, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

export const deleteUnit = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/units/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};