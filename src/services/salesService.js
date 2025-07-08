const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/sales`;
const REPORTS_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/reports`;

// Helper function to get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Fetch all sales with optional date filtering
 * @param {Date} startDate - Optional start date filter
 * @param {Date} endDate - Optional end date filter
 * @returns {Promise<Array>} - Array of sales
 */
export const getSales = async (startDate, endDate) => {
  try {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: getAuthHeader()
    });
    
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error in getSales:', error);
    throw error;
  }
};

/**
 * Get sale by ID
 * @param {number|string} id - Sale ID
 * @returns {Promise<Object>} - Sale details
 */
export const getSaleById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching sale with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create new sale
 * @param {Object} saleData - Sale data
 * @returns {Promise<Object>} - Created sale
 */
export const createSale = async (saleData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(saleData)
    });
    
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

/**
 * Cancel a sale
 * @param {number|string} id - Sale ID to cancel
 * @returns {Promise<Object>} - Updated sale
 */
export const cancelSale = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ status: 'CANCELLED' })
    });
    
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error cancelling sale with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get sales by customer ID
 * @param {number|string} customerId - Customer ID
 * @returns {Promise<Array>} - Array of sales
 */
export const getSalesByCustomer = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
      headers: getAuthHeader()
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching sales for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Get sales by status
 * @param {string} status - Sale status (COMPLETED, PENDING, CANCELLED, REFUNDED)
 * @returns {Promise<Array>} - Array of sales
 */
export const getSalesByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${status}`, {
      headers: getAuthHeader()
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching sales with status ${status}:`, error);
    throw error;
  }
};

/**
 * Get sales by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Array of sales
 */
export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/date-range?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
      {
        headers: getAuthHeader()
      }
    );
    
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    throw error;
  }
};

/**
 * Generate receipt for sale
 * @param {number|string} id - Sale ID
 * @returns {Promise<Object>} - Receipt data
 */
export const generateReceipt = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/receipt`, {
      headers: getAuthHeader()
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error generating receipt for sale ${id}:`, error);
    throw error;
  }
};

/**
 * Export sales to CSV
 * @param {Array} sales - Sales data to export
 * @returns {void}
 */
export const exportSalesToCSV = (sales) => {
  try {
    if (sales.length === 0) {
      console.warn('No sales data to export');
      return;
    }

    // Flatten nested objects for CSV export
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? `${prefix}.` : '';
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(acc, flattenObject(obj[key], pre + key));
        } else {
          acc[pre + key] = obj[key];
        }
        return acc;
      }, {});
    };

    const flattenedSales = sales.map(sale => flattenObject(sale));
    
    const headers = Object.keys(flattenedSales[0]).join(',');
    const rows = flattenedSales.map(sale =>
      Object.values(sale).map(v => 
        `"${v !== null && v !== undefined ? v.toString().replace(/"/g, '""') : ''}"`
      ).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting sales to CSV:', error);
    throw error;
  }
};

/**
 * Get daily sales summary
 * @param {Date} date - Optional date (defaults to today)
 * @returns {Promise<Object>} - Summary object
 */
export const getDailySummary = async (date = new Date()) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/daily-summary?date=${date.toISOString().split('T')[0]}`,
      {
        headers: getAuthHeader()
      }
    );
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    throw error;
  }
};

// ======================================
// REPORT-RELATED FUNCTIONS
// ======================================

/**
 * Get sales report data
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @returns {Promise<Array>} - Array of sales report items
 */
export const getSalesReport = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);

    const response = await fetch(`${REPORTS_BASE_URL}/sales?${params.toString()}`, {
      headers: getAuthHeader()
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

/**
 * Export sales report
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @param {string} format - Export format (CSV, PDF, etc.)
 * @returns {Promise<Blob>} - The exported file as a Blob
 */
export const exportSalesReport = async (startDate, endDate, format = 'CSV') => {
  try {
    const response = await fetch(`${REPORTS_BASE_URL}/export`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        reportType: 'SALES',
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        format
      })
    });

    await handleApiError(response);
    return await response.blob();
  } catch (error) {
    console.error('Error exporting sales report:', error);
    throw error;
  }
};

/**
 * Get product performance report
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @returns {Promise<Array>} - Array of product performance items
 */
export const getProductPerformanceReport = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);

    const response = await fetch(`${REPORTS_BASE_URL}/products?${params.toString()}`, {
      headers: getAuthHeader()
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching product performance report:', error);
    throw error;
  }
};

/**
 * Get profit and loss report
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @returns {Promise<Object>} - Profit and loss data
 */
export const getProfitLossReport = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
    if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);

    const response = await fetch(`${REPORTS_BASE_URL}/profit-loss?${params.toString()}`, {
      headers: getAuthHeader()
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching profit/loss report:', error);
    throw error;
  }
};

// Utility function to handle API errors
const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }
  return response;
};
/**
 * Delete a sale permanently
 * @param {number|string} id - Sale ID to delete
 * @returns {Promise<Object>} - Confirmation message
 */
export const deleteSale = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error(`Error deleting sale with ID ${id}:`, error);
    throw error;
  }
};
