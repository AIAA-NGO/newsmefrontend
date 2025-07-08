import axios from 'axios';

// Configure API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventorymanagementsystem-latest-37zl.onrender.com';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Authentication failed - please login again';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 500:
          errorMessage = 'Server error - please try again later';
          break;
        default:
          errorMessage = error.response.data?.message || `Server returned status ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server - check your network connection';
    } else {
      errorMessage = error.message || 'Request setup error';
    }

    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Formats date to YYYY-MM-DD string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 * @throws {Error} If date is invalid
 */
const formatDate = (date) => {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date');
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Fetches profit/loss report data
 * @param {Date|string} startDate - Start date of report period
 * @param {Date|string} endDate - End date of report period
 * @param {Object} [options] - Optional parameters
 * @param {AbortSignal} [options.signal] - Abort signal for request cancellation
 * @returns {Promise<Object>} Report data
 * @throws {Error} If request fails or dates are invalid
 */
export const getProfitLossReport = async (startDate, endDate, options = {}) => {
  try {
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    if (new Date(params.startDate) > new Date(params.endDate)) {
      throw new Error('Start date must be before end date');
    }

    const response = await api.get('/reports/financial/profit-loss', {
      params,
      signal: options.signal
    });

    // Validate response structure with more flexible handling
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from server');
    }

    // Set default values if fields are missing
    const result = {
      totalRevenue: response.data.totalRevenue || 0,
      totalCosts: response.data.totalCosts || 0,
      netProfit: response.data.netProfit || 0,
      ...response.data // Include any additional fields from the response
    };

    // Convert all numeric fields to numbers
    result.totalRevenue = Number(result.totalRevenue);
    result.totalCosts = Number(result.totalCosts);
    result.netProfit = Number(result.netProfit);

    return result;
  } catch (error) {
    if (error.message.includes('date') || error.message.includes('Date')) {
      throw new Error(`Invalid date range: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Clears the cached authentication token
 */
export const clearAuthCache = () => {
  localStorage.removeItem('token');
};

export default {
  getProfitLossReport,
  clearAuthCache
};