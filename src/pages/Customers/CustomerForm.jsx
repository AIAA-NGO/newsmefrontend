import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer, updateCustomer } from '../../services/customerService';

export default function CustomerForm({ customer, onSuccess, onCancel }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false
  });

  // Initialize form with customer data if editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\d\s+-]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setTouched({
        name: true,
        email: true,
        phone: true
      });
      setIsLoading(false);
      return;
    }

    try {
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      let response;
      if (customer?.id) {
        response = await updateCustomer(customer.id, customerData);
      } else {
        response = await createCustomer(customerData);
      }

      if (response.status >= 200 && response.status < 300) {
        const successMessage = customer?.id 
          ? 'Customer updated successfully!' 
          : 'Customer created successfully!';
        
        // Call the onSuccess callback from parent
        if (onSuccess) {
          onSuccess(successMessage);
        } else {
          // Fallback navigation if onSuccess isn't provided
          navigate('/customers', { 
            state: { 
              success: true,
              message: successMessage
            } 
          });
        }
      } else if (response.status === 409) {
        setError('Customer already exists!');
        setIsLoading(false);
      } else {
        throw new Error(response.data?.message || 'Failed to save customer');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setError('Customer already exists!');
      } else {
        console.error('Save failed:', error);
        setError(error.response?.data?.message || error.message || 'Failed to save customer. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const errors = validateForm();

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">
        {customer?.id ? 'Edit Customer' : 'Create Customer'}
      </h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md ${
              touched.name && errors.name ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md ${
              touched.email && errors.email ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md ${
              touched.phone && errors.phone ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
            placeholder="e.g. +254 712 345678"
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            disabled={isLoading}
            rows={3}
            placeholder="Physical address"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel || (() => navigate('/customers'))}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}