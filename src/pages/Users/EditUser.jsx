import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Container,
  IconButton
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: '',
    active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configure axios instance
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch user data and roles in parallel
        const [userResponse, rolesResponse] = await Promise.all([
          api.get(`/users/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          api.get('/users/roles', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        const user = userResponse.data;
        setFormData({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.roles[0], // Assuming single role per user
          active: user.active
        });

        setRoles(rolesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          if (error.response.status === 401) {
            setError('Session expired. Please login again.');
          } else if (error.response.status === 404) {
            setError('User not found');
          } else {
            setError(error.response.data?.message || 'Failed to load user data');
          }
        } else {
          setError(error.message || 'Failed to load user data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'active' ? e.target.checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        active: formData.active
      };

      await api.put(`/users/${id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      navigate('/users', { state: { userUpdated: true } });
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response) {
        if (error.response.status === 400) {
          setError(error.response.data || 'Validation error');
        } else if (error.response.status === 403) {
          setError('You are not authorized to perform this action');
        } else if (error.response.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError('Failed to update user. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Edit User
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  required
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active}
                    onChange={handleChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/users')}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}