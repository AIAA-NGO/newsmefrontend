import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN', // Default role as per your example
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  // Configure axios instance
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/users/roles');
        setRoles(response.data);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to load roles. Please try again.');
      }
    };
    fetchRoles();
  }, []);

  // Check username availability
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (formData.username.length < 3) return;
      
      try {
        const response = await api.get('/users/check-username', {
          params: { username: formData.username }
        });
        setUsernameAvailable(response.data.available);
      } catch (err) {
        console.error('Username check failed:', err);
      }
    };

    const timer = setTimeout(() => {
      checkUsernameAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!formData.username.trim() || !formData.fullName.trim() || 
        !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!usernameAvailable) {
      setError('Username is already taken');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        active: formData.active
      };

      await api.post('/users', payload);
      setSuccess(true);
      setTimeout(() => navigate('/users'), 1500);
    } catch (err) {
      console.error('Create user error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
        } else if (err.response.status === 400) {
          setError(err.response.data?.message || 'Validation failed');
        } else {
          setError(err.response.data?.message || 'Failed to create user');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/users')}
              className="mr-4 p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">User created successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Redirecting to users list...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error creating user</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <div className="relative mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${usernameAvailable ? 'border-gray-300' : 'border-red-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                  minLength="3"
                />
                {formData.username && (
                  <span className={`absolute right-3 top-2 text-sm ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                    {usernameAvailable ? '✓ Available' : '✗ Taken'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                minLength="6"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !usernameAvailable}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading || !usernameAvailable ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;