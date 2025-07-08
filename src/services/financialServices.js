import axios from 'axios';

// Configure API base URL
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'https://inventorymanagementsystem-latest-37zl.onrender.com/api'}/financial`;

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling errors
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response) {
    // Server responded with a status other than 2xx
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request
    console.error('Request setup error:', error.message);
  }
  return Promise.reject(error);
});

/**
 * Formats date to YYYY-MM-DD string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

/**
 * Fetches profit and loss report data
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @returns {Promise<Object>} Profit and loss data
 */
export const getProfitLossReport = async (startDate, endDate) => {
  try {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    // Remove undefined/null parameters
    Object.keys(params).forEach(key => params[key] == null && delete params[key]);

    const response = await api.get('/profit-loss', { 
      params,
      paramsSerializer: {
        indexes: null // Properly serialize array-like params if needed
      }
    });

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response structure from server');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching profit/loss report:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch profit/loss report');
  }
};

/**
 * Fetches supplier purchase report data
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @returns {Promise<Array>} Array of supplier purchase data
 */
export const getSupplierPurchaseReport = async (startDate, endDate) => {
  try {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    Object.keys(params).forEach(key => params[key] == null && delete params[key]);

    const response = await api.get('/suppliers', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching supplier purchase report:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier purchases');
  }
};

/**
 * Fetches sales report data
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @returns {Promise<Array>} Array of sales report data
 */
export const getSalesReport = async (startDate, endDate) => {
  try {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    Object.keys(params).forEach(key => params[key] == null && delete params[key]);

    const response = await api.get('/sales', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sales report');
  }
};

/**
 * Fetches product performance report data
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @returns {Promise<Array>} Array of product performance data
 */
export const getProductPerformanceReport = async (startDate, endDate) => {
  try {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    Object.keys(params).forEach(key => params[key] == null && delete params[key]);

    const response = await api.get('/products', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching product performance report:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product performance');
  }
};

/**
 * Fetches inventory valuation report data
 * @returns {Promise<Array>} Array of inventory valuation data
 */
export const getInventoryValuationReport = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching inventory valuation report:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch inventory valuation');
  }
};

/**
 * Fetches tax report data
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @returns {Promise<Object>} Tax report data
 */
export const getTaxReport = async (startDate, endDate) => {
  try {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    Object.keys(params).forEach(key => params[key] == null && delete params[key]);

    const response = await api.get('/tax', { params });
    return response.data || {};
  } catch (error) {
    console.error('Error fetching tax report:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch tax report');
  }
};

/**
 * Exports a report in the specified format
 * @param {Object} exportRequest - Export request parameters
 * @param {string} exportRequest.reportType - Type of report to export
 * @param {Date} exportRequest.startDate - Start date for the report
 * @param {Date} exportRequest.endDate - End date for the report
 * @param {string} exportRequest.format - Export format (CSV, PDF, EXCEL)
 * @returns {Promise<Blob>} The exported file as a Blob
 */
export const exportReport = async (exportRequest) => {
  try {
    const params = {
      reportType: exportRequest.reportType,
      startDate: formatDate(exportRequest.startDate),
      endDate: formatDate(exportRequest.endDate),
      format: exportRequest.format
    };

    const response = await api.post('/export', params, {
      responseType: 'blob',
    });

    if (!response.data) {
      throw new Error('No data received in export response');
    }

    return response.data;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw new Error(error.response?.data?.message || 'Failed to export report');
  }
};

/**
 * Fetches daily summary report
 * @param {Date} date - Date for the daily summary
 * @returns {Promise<Object>} Daily summary data
 */
export const getDailySummary = async (date = new Date()) => {
  try {
    const response = await api.get('/daily-summary', {
      params: { date: formatDate(date) }
    });
    return response.data || {};
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch daily summary');
  }
};

// Export all services
export default {
  getProfitLossReport,
  getSupplierPurchaseReport,
  getSalesReport,
  getProductPerformanceReport,
  getInventoryValuationReport,
  getTaxReport,
  exportReport,
  getDailySummary,
};