import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const TAX_RATE = 0.16;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const transformCartData = (cartData) => {
  // Calculate tax-exclusive amounts from the tax-inclusive totals
  const preTaxAmount = cartData.subtotal / (1 + TAX_RATE);
  const taxAmount = cartData.subtotal - preTaxAmount;
  
  return {
    ...cartData,
    preTaxAmount: parseFloat(preTaxAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    // Total remains the same as subtotal (tax-inclusive)
    total: cartData.subtotal
  };
};

export const cartService = {
  async getCart() {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: getAuthHeader()
      });
      return transformCartData(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  async addItemsToCart(items) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cart`, items, {
        headers: getAuthHeader()
      });
      return transformCartData(response.data);
    } catch (error) {
      console.error('Error adding items to cart:', error);
      throw error;
    }
  },

  async updateCartItemQuantity(productId, quantity) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cart/${productId}`,
        { quantity },
        { headers: getAuthHeader() }
      );
      return transformCartData(response.data);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  },

  async removeItemFromCart(productId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/${productId}`, {
        headers: getAuthHeader()
      });
      return transformCartData(response.data);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  async checkout(checkoutData) {
    try {
      // Transform data before sending to backend
      const backendCheckoutData = {
        ...checkoutData,
        // Ensure we're sending tax-inclusive amounts to backend
        subtotal: checkoutData.total,
        tax: checkoutData.taxAmount,
        // Total remains the same
        total: checkoutData.total
      };

      const response = await axios.post(
        `${API_BASE_URL}/cart/checkout`,
        backendCheckoutData,
        { headers: getAuthHeader() }
      );
      
      // Transform the response if needed
      return {
        ...response.data,
        // Include the frontend-calculated tax breakdown
        preTaxAmount: checkoutData.preTaxAmount,
        taxAmount: checkoutData.taxAmount
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  },

  // Helper method for calculating tax breakdown
  calculateTaxBreakdown(subtotal) {
    const preTaxAmount = subtotal / (1 + TAX_RATE);
    const taxAmount = subtotal - preTaxAmount;
    
    return {
      preTaxAmount: parseFloat(preTaxAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(subtotal.toFixed(2)) // Total remains same as subtotal
    };
  }
};