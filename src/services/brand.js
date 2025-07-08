import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/brands`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
  };
};

export const getBrands = async () => {
  try {
    const response = await axios.get(API_BASE, {
      ...getAuthHeaders(),
      params: {
        page: 0,
        size: 100, // Get all brands by requesting a large page size
        sort: 'id,asc'
      }
    });
    // Return the content array from the paginated response
    return response.data.content || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

export const addBrand = async (brand) => {
  try {
    const response = await axios.post(API_BASE, brand, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error adding brand:', error);
    throw error;
  }
};

export const updateBrand = async (id, brand) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, brand, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
};

export const deleteBrand = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};