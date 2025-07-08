import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const cartService = {
  async getCart() {
    const response = await axios.get(`${API_BASE_URL}/cart`);
    return response.data;
  },

  async addItemsToCart(items) {
    const response = await axios.post(`${API_BASE_URL}/cart`, items);
    return response.data;
  },

  async updateCartItemQuantity(productId, quantity) {
    const response = await axios.put(`${API_BASE_URL}/cart/${productId}`, { quantity });
    return response.data;
  },

  async removeItemFromCart(productId) {
    const response = await axios.delete(`${API_BASE_URL}/cart/${productId}`);
    return response.data;
  },

  async checkout(checkoutData) {
    const response = await axios.post(`${API_BASE_URL}/cart/checkout`, checkoutData);
    return response.data;
  }
};