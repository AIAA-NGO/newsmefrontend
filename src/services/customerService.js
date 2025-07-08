import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/customers`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getAllCustomers = () => axios.get(API_BASE, getAuthHeader());
export const getCustomerById = (id) => axios.get(`${API_BASE}/${id}`, getAuthHeader());
export const createCustomer = (data) => axios.post(API_BASE, data, getAuthHeader());
export const updateCustomer = (id, data) => axios.put(`${API_BASE}/${id}`, data, getAuthHeader());
export const deleteCustomer = (id) => axios.delete(`${API_BASE}/${id}`, getAuthHeader());
export const searchCustomers = (query) => axios.get(`${API_BASE}/search?query=${query}`, getAuthHeader());