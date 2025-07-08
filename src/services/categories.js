import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/categories`,
      categoryData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      headers: getAuthHeader(),
    });
    return response.data.content || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/categories/${id}`,
      categoryData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/search`, {
      params: { query },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};
