import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Divider,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { getProfitLossReport } from '../../services/profitService';

const IncomeStatement = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dateError, setDateError] = useState(false);

  const fetchProfitData = async () => {
    if (!startDate || !endDate) {
      setDateError(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setDateError(false);
    
    try {
      const data = await getProfitLossReport(startDate, endDate);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching profit data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData();
  }, []);

  const handleDateSubmit = (e) => {
    e.preventDefault();
    fetchProfitData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Income Statement
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleDateSubmit}>
            <Stack direction="row" spacing={2} alignItems="center">
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                maxDate={endDate}
                slotProps={{
                  textField: { 
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined',
                    error: dateError,
                    helperText: dateError ? 'Please select a start date' : ''
                  }
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate}
                maxDate={new Date()}
                slotProps={{
                  textField: { 
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined',
                    error: dateError,
                    helperText: dateError ? 'Please select an end date' : ''
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ height: '40px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </Stack>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {reportData && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Income Statement: {format(new Date(startDate), 'MM/dd/yyyy')} to {format(new Date(endDate), 'MM/dd/yyyy')}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Revenue</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Gross Sales</TableCell>
                    <TableCell>{formatCurrency(reportData.totalRevenue)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Cost of Goods Sold</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Total COGS</TableCell>
                    <TableCell>{formatCurrency(reportData.totalCost)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Gross Profit</strong></TableCell>
                    <TableCell>{formatCurrency(reportData.grossProfit)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Operating Expenses</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Total Operating Expenses</TableCell>
                    <TableCell>{formatCurrency(reportData.expenses)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Operating Income</strong></TableCell>
                    <TableCell>{formatCurrency(reportData.grossProfit - reportData.expenses)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Other Income & Expenses</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Other Income</TableCell>
                    <TableCell>{formatCurrency(reportData.otherIncome)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Other Expenses</TableCell>
                    <TableCell>{formatCurrency(reportData.otherExpenses)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Net Income</strong></TableCell>
                    <TableCell>{formatCurrency(reportData.netProfit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default IncomeStatement;