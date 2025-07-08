import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper
} from '@mui/material';
import { LockReset as PasswordIcon, ArrowBack as BackIcon } from '@mui/icons-material';

export default function ChangePassword() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Configure axios instance
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await api.put(
        `/users/${id}/password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => navigate('/users'), 1500);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response) {
        if (error.response.status === 400) {
          setError(error.response.data || 'Incorrect old password');
        } else if (error.response.status === 401) {
          setError('Session expired. Please login again.');
        } else if (error.response.status === 403) {
          setError('You are not authorized to perform this action');
        } else if (error.response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to update password. Please try again.');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Change Password
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password updated successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            name="oldPassword"
            type="password"
            value={passwordData.oldPassword}
            onChange={handleChange}
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handleChange}
            required
            inputProps={{ minLength: 6 }}
            variant="outlined"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            required
            inputProps={{ minLength: 6 }}
            variant="outlined"
          />

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <PasswordIcon />}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}