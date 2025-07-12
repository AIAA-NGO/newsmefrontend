import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Paper,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Chip
} from '@mui/material';
import { createPayment } from '../../services/paymentService';
import { fetchAllUsers } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    worker: null,
    amount: '',
    paymentDate: new Date(),
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: ''
  });

  // Load all workers on component mount
  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        const usersData = await fetchAllUsers();
        
        // Filter users with WORKER role and format for Autocomplete
        const workerUsers = usersData
          .filter(user => 
            user.roles?.includes('WORKER') || 
            user.roles?.some(role => role.includes('WORKER'))
          .map(worker => ({
            ...worker,
            label: `${worker.fullName || worker.username}${worker.email ? ` (${worker.email})` : ''}`
          })));
        
        setWorkers(workerUsers);
      } catch (err) {
        setError(err.message || 'Failed to load workers');
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, []);

  // Client-side filtering for search
  const filterWorkers = (options, { inputValue }) => {
    return options.filter(worker => 
      worker.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      worker.username.toLowerCase().includes(inputValue.toLowerCase()) ||
      (worker.email && worker.email.toLowerCase().includes(inputValue.toLowerCase()))
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkerChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      worker: newValue
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      paymentDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.worker) {
      setError('Please select a worker');
      setSubmitting(false);
      return;
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      setSubmitting(false);
      return;
    }

    try {
      const paymentData = {
        workerId: formData.worker._id,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
        status: 'completed'
      };

      await createPayment(paymentData);
      navigate('/finance/payments', { state: { successMessage: 'Payment created successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create payment');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Payment
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={workers}
                getOptionLabel={(option) => option.label}
                value={formData.worker}
                onChange={handleWorkerChange}
                filterOptions={filterWorkers}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Worker"
                    variant="outlined"
                    required
                    placeholder="Start typing to search workers..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="No workers found"
              />
            </Grid>

            {/* Rest of your form fields remain the same */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Payment Date"
                  value={formData.paymentDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            {/* ... rest of your form fields ... */}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/finance/payments')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || !formData.worker}
                  startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                  {submitting ? 'Processing...' : 'Create Payment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreatePaymentPage;