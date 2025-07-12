import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventorymanagementsystem-we5x.onrender.com/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Enhanced request interceptor
apiClient.interceptors.request.use(config => {
  console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  response => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    const errorDetails = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      responseData: error.response?.data,
      headers: error.response?.headers
    };
    console.error('API Error:', errorDetails);
    return Promise.reject(error);
  }
);

export const InventoryService = {
async getInventoryStatus(search, categoryId, brandId, lowStockOnly, expiredOnly, pageable) {
  try {
    // Declare params object properly
    const params = {
      ...pageable,  // This spreads the pageable properties
      search: search || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      lowStockOnly: lowStockOnly || undefined,
      expiredOnly: expiredOnly || undefined
    };
    
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }

  },

  async adjustInventory(request) {
    try {
      const response = await apiClient.post('/inventory/adjust', request);
      return response.data;
    } catch (error) {
      console.error('Error adjusting inventory:', {
        request,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async removeExpiredProducts() {
    try {
      const response = await apiClient.post('/inventory/remove-expired');
      return response.data;
    } catch (error) {
      console.error('Error removing expired products:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', {
        productId,
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      
      // Enhance the error message before throwing
      const enhancedError = new Error(error.message);
      enhancedError.response = error.response;
      enhancedError.productId = productId;
      throw enhancedError;
    }
  },

  async getAdjustmentHistory(productId) {
    try {
      const response = await apiClient.get(`/inventory/adjustments/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching adjustment history:', {
        productId,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async getLowStockSuggestions() {
    try {
      const response = await apiClient.get('/inventory/low-stock-suggestions');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock suggestions:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

async getLowStockItems() {
  try {
    const response = await apiClient.get('/dashboard/low-stock');
    
    if (!response.data) {
      throw new Error('No data received from low stock endpoint');
    }

    // Map the dashboard response to match expected structure
    return response.data.map(item => ({
      id: item.productId || Math.random().toString(36).substr(2, 9),
      name: item.productName || 'Unknown Product',
      sku: item.sku || '',
      quantityInStock: item.currentStock || 0,
      lowStockThreshold: item.threshold || 10,
      categoryName: item.category || 'Uncategorized',
      unitName: 'units', // Default unit
      expiryDate: item.expiryDate || null,
      imageUrl: item.imageUrl || null
    }));
  } catch (error) {
    console.error('Error fetching low stock items:', {
      error: error.message,
      url: '/dashboard/low-stock',
      status: error.response?.status,
      response: error.response?.data
    });
    
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
},

  async getExpiringProducts() {
    try {
      const response = await apiClient.get('/products/expiring');
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring products:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async searchProducts(query) {
    try {
      const response = await apiClient.get('/products/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', {
        query,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async getInventoryValuation() {
    try {
      const response = await apiClient.get('/inventory/valuation');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory valuation:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async getProductDetails(productId) {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', {
        productId,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async updateProductStock(productId, quantity) {
    try {
      const response = await apiClient.post(`/products/${productId}/stock`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating product stock:', {
        productId,
        quantity,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }
};

export default InventoryService;