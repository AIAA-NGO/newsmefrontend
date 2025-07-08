import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('Authentication token not available');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Enhanced data fetcher with timeout
const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      ...getAuthHeader(),
      params,
      timeout: 10000 // 10 second timeout
    });
    
    // Handle paginated and non-paginated responses
    return response.data.content || response.data || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// PRODUCT SERVICES
export const getProducts = async (params = {}) => {
  return fetchData('products', params);
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const addProduct = async (productData) => {
  try {
    // Convert numeric fields and handle relationships
    const formattedData = {
      ...productData,
      price: parseFloat(productData.price),
      costPrice: productData.costPrice ? parseFloat(productData.costPrice) : null,
      quantityInStock: parseInt(productData.quantityInStock) || 0,
      lowStockThreshold: productData.lowStockThreshold ? parseInt(productData.lowStockThreshold) : null,
      brandId: productData.brandId ? parseInt(productData.brandId) : null,
      categoryId: productData.categoryId ? parseInt(productData.categoryId) : null,
      unitId: productData.unitId ? parseInt(productData.unitId) : null,
      supplierId: productData.supplierId ? parseInt(productData.supplierId) : null
    };

    const response = await axios.post(`${API_BASE_URL}/products`, formattedData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
    throw error;
  }
};

// CATEGORY SERVICES
export const getCategories = async () => fetchData('categories');

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/categories`, categoryData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error.response?.data || error.message);
    throw error;
  }
};

// BRAND SERVICES
export const getBrands = async () => fetchData('brands');

export const addBrand = async (brandData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/brands`, brandData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating brand:', error.response?.data || error.message);
    throw error;
  }
};

// UNIT SERVICES
export const getUnits = async () => fetchData('units');

export const addUnit = async (unitData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/units`, unitData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating unit:', error.response?.data || error.message);
    throw error;
  }
};

// SUPPLIER SERVICES
export const getSuppliers = async () => fetchData('suppliers');

export const addSupplier = async (supplierData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/suppliers`, supplierData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error.response?.data || error.message);
    throw error;
  }
};