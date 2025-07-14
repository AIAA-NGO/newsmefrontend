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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Enhanced response interceptor with consistent error handling
apiClient.interceptors.response.use(
  response => {
    // Normalize successful responses to always include data
    return {
      ...response,
      data: response.data || null
    };
  },
  error => {
    const errorData = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    };
    
    console.error('API Error:', errorData);
    
    // Return a consistent error structure
    return Promise.reject({
      ...errorData,
      isApiError: true
    });
  }
);

export const InventoryService = {
  async getInventoryStatus(search, categoryId, brandId, lowStockOnly, expiredOnly, pageable) {
    try {
      const params = {
        ...(pageable || {}),
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        lowStockOnly: lowStockOnly || undefined,
        expiredOnly: expiredOnly || undefined
      };
      
      const response = await apiClient.get('/inventory', { params });
      return Array.isArray(response.data) ? response.data : response.data?.content || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  async adjustInventory(request) {
    try {
      if (!request || !request.productId) {
        throw new Error('Invalid adjustment request');
      }
      
      const response = await apiClient.post('/inventory/adjust', request);
      return response.data || {};
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      throw error;
    }
  },

  async removeExpiredProducts() {
    try {
      const response = await apiClient.post('/inventory/remove-expired');
      return response.data || { success: true };
    } catch (error) {
      console.error('Error removing expired products:', error);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data || { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw {
        ...error,
        productId,
        isProductError: true
      };
    }
  },

  async getAdjustmentHistory(productId) {
    try {
      if (!productId) {
        return [];
      }
      
      const response = await apiClient.get(`/inventory/adjustments/${productId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching adjustment history:', error);
      throw error;
    }
  },

  async getLowStockSuggestions() {
    try {
      const response = await apiClient.get('/inventory/low-stock-suggestions');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching low stock suggestions:', error);
      throw error;
    }
  },

  async getLowStockItems() {
    try {
      const response = await apiClient.get('/dashboard/low-stock');
      
      if (!response.data) {
        console.warn('No data received from low stock endpoint');
        return [];
      }

      // Normalize the response structure
      return (Array.isArray(response.data) ? response.data : []).map(item => ({
        id: item.productId || Math.random().toString(36).substr(2, 9),
        name: item.productName || 'Unknown Product',
        sku: item.sku || '',
        quantityInStock: item.currentStock || 0,
        lowStockThreshold: item.threshold || 10,
        categoryName: item.category || 'Uncategorized',
        unitName: item.unitName || 'units',
        expiryDate: item.expiryDate || null,
        imageUrl: item.imageUrl || null
      }));
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  },

  async getExpiringProducts() {
    try {
      const response = await apiClient.get('/products/expiring');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching expiring products:', error);
      throw error;
    }
  },

  async searchProducts(query) {
    try {
      if (!query || typeof query !== 'string') {
        return [];
      }
      
      const response = await apiClient.get('/products/search', {
        params: { query }
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async getInventoryValuation() {
    try {
      const response = await apiClient.get('/inventory/valuation');
      return Array.isArray(response.data) ? response.data : response.data?.content || [];
    } catch (error) {
      console.error('Error fetching inventory valuation:', error);
      throw error;
    }
  },

  async getProductDetails(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      const response = await apiClient.get(`/products/${productId}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  async updateProductStock(productId, quantity) {
    try {
      if (!productId || typeof quantity !== 'number') {
        throw new Error('Invalid parameters for stock update');
      }
      
      const response = await apiClient.post(`/products/${productId}/stock`, { quantity });
      return response.data || {};
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  // New method to get combined inventory data
  async getFullInventoryReport() {
    try {
      const [products, inventory] = await Promise.all([
        apiClient.get('/products'),
        this.getInventoryValuation()
      ]);
      
      return {
        products: Array.isArray(products.data) ? products.data : [],
        inventory: Array.isArray(inventory) ? inventory : []
      };
    } catch (error) {
      console.error('Error fetching full inventory report:', error);
      throw error;
    }
  }
};

export default InventoryService;