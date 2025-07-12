import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/payments`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchAllPayments = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error.response?.data?.message || 'Failed to fetch payments';
  }
};

export const fetchWorkerPayments = async (workerId) => {
  try {
    const response = await axios.get(`${API_BASE}/worker/${workerId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching worker payments:', error);
    throw error.response?.data?.message || 'Failed to fetch worker payments';
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await axios.post(API_BASE, paymentData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error.response?.data?.message || 'Failed to create payment';
  }
};