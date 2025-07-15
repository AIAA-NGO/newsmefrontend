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

// Enhanced request interceptor with logging
apiClient.interceptors.request.use(config => {
  console.log(`[API] ${config.method?.toUpperCase()} to ${config.url}`);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

// Enhanced response interceptor
apiClient.interceptors.response.use(
  response => {
    console.log(`[API] ${response.status} from ${response.config.url}`);
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
    console.error('[API] Error:', errorDetails);
    return Promise.reject(error);
  }
);

export const InventoryService = {
  /**
   * Gets inventory status with filtering and pagination
   * @param {string} [search] - Search term
   * @param {string} [categoryId] - Category ID filter
   * @param {string} [brandId] - Brand ID filter
   * @param {boolean} [lowStockOnly] - Only show low stock items
   * @param {boolean} [expiredOnly] - Only show expired items
   * @param {Object} [pageable] - Pagination options
   * @returns {Promise<Array>} Array of inventory items
   */
  async getInventoryStatus(search, categoryId, brandId, lowStockOnly, expiredOnly, pageable) {
    try {
      const params = {
        ...pageable,
        search: search || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        lowStockOnly: lowStockOnly || undefined,
        expiredOnly: expiredOnly || undefined
      };
      
      const response = await apiClient.get('/inventory', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching inventory:', {
        search,
        categoryId,
        brandId,
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Adjusts inventory levels
   * @param {Object} request - Adjustment request
   * @param {string} request.productId - Product ID
   * @param {number} request.quantity - Adjustment quantity
   * @param {string} request.reason - Reason for adjustment
   * @returns {Promise<Object>} Updated inventory record
   */
  async adjustInventory(request) {
    try {
      if (!request?.productId || typeof request.quantity !== 'number') {
        throw new Error('Invalid adjustment request');
      }
      
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

  /**
   * Removes expired products from inventory
   * @returns {Promise<Object>} Removal summary
   */
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

  /**
   * Deletes a product
   * @param {string} productId - Product ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteProduct(productId) {
    try {
      if (!productId) throw new Error('Product ID is required');
      
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', {
        productId,
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      
      const enhancedError = new Error(error.message);
      enhancedError.response = error.response;
      enhancedError.productId = productId;
      throw enhancedError;
    }
  },

  /**
   * Gets adjustment history for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of adjustment records
   */
  async getAdjustmentHistory(productId) {
    try {
      if (!productId) throw new Error('Product ID is required');
      
      const response = await apiClient.get(`/inventory/adjustments/${productId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching adjustment history:', {
        productId,
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Gets low stock suggestions
   * @returns {Promise<Array>} Array of products needing restock
   */
  async getLowStockSuggestions() {
    try {
      const response = await apiClient.get('/inventory/low-stock-suggestions');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching low stock suggestions:', {
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Gets low stock items with detailed information
   * @returns {Promise<Array>} Array of low stock items
   */
  async getLowStockItems() {
    try {
      const response = await apiClient.get('/dashboard/low-stock');
      
      if (!response.data) {
        throw new Error('No data received from low stock endpoint');
      }

      return (Array.isArray(response.data) ? response.data : [response.data]).map(item => ({
        id: item.productId || Math.random().toString(36).substr(2, 9),
        name: item.productName || 'Unknown Product',
        sku: item.sku || '',
        quantityInStock: item.currentStock || 0,
        lowStockThreshold: item.threshold || 10,
        categoryName: item.category || 'Uncategorized',
        unitName: item.unit || 'units',
        expiryDate: item.expiryDate || null,
        imageUrl: item.imageUrl || null,
        lastUpdated: item.lastUpdated || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching low stock items:', {
        error: error.message,
        url: '/dashboard/low-stock',
        status: error.response?.status,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Gets products that will expire soon
   * @returns {Promise<Array>} Array of expiring products
   */
  async getExpiringProducts() {
    try {
      const response = await apiClient.get('/products/expiring');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching expiring products:', {
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Searches inventory products
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching products
   */
  async searchProducts(query) {
    try {
      if (!query || typeof query !== 'string') {
        return [];
      }
      
      const response = await apiClient.get('/products/search', {
        params: { query: query.trim() }
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error searching products:', {
        query,
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Gets inventory valuation report
   * @returns {Promise<Array>} Array of inventory valuation items
   */
  async getInventoryValuation() {
    try {
      const response = await apiClient.get('/inventory/valuation');
      
      if (!Array.isArray(response.data)) {
        console.warn('Valuation data is not an array:', response.data);
        return [];
      }
      
      return response.data.map(item => ({
        productId: item.productId,
        name: item.productName || 'Unknown',
        sku: item.sku || '',
        category: item.category || 'Uncategorized',
        quantity: item.quantity || 0,
        unitCost: item.unitCost || 0,
        totalValue: (item.quantity || 0) * (item.unitCost || 0),
        lastUpdated: item.lastUpdated || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching inventory valuation:', {
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  },

  /**
   * Gets detailed product information
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product details
   */
  async getProductDetails(productId) {
    try {
      if (!productId) throw new Error('Product ID is required');
      
      const response = await apiClient.get(`/products/${productId}`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching product details:', {
        productId,
        error: error.message,
        response: error.response?.data
      });
      return {};
    }
  },

  /**
   * Updates product stock levels
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated product record
   */
  async updateProductStock(productId, quantity) {
    try {
      if (!productId || typeof quantity !== 'number') {
        throw new Error('Invalid parameters');
      }
      
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
  },

  /**
   * Bulk update inventory levels
   * @param {Array} updates - Array of update objects
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateInventory(updates) {
    try {
      if (!Array.isArray(updates)) {
        throw new Error('Updates must be an array');
      }
      
      const response = await apiClient.post('/inventory/bulk-update', { updates });
      return response.data;
    } catch (error) {
      console.error('Bulk inventory update failed:', error);
      throw error;
    }
  }
};

export default InventoryService;