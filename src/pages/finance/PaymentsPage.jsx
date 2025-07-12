import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  TextField,
  Autocomplete,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { fetchAllPayments, fetchWorkerPayments } from '../../services/paymentService';
import { fetchAllUsers } from '../../services/userService';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import CreatePaymentPage from './CreatePaymentPage'; // Import the create payment component

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [filterWorker, setFilterWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Load all workers and payments
  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      const [paymentsData, usersData] = await Promise.all([
        fetchAllPayments(),
        fetchAllUsers()
      ]);
      
      setPayments(paymentsData);
      // Filter users with WORKER role
      const workerUsers = usersData
        .filter(user => 
          user.roles?.includes('WORKER') || 
          user.roles?.some(role => role.includes('WORKER'))
        .map(worker => ({
          ...worker,
          label: worker.fullName || worker.username
        })));
      setWorkers(workerUsers);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter payments when worker is selected
  useEffect(() => {
    if (filterWorker) {
      const loadWorkerPayments = async () => {
        try {
          setLoading(true);
          const paymentsData = await fetchWorkerPayments(filterWorker._id);
          setPayments(paymentsData);
        } catch (err) {
          setError(err.message || 'Failed to load payments');
        } finally {
          setLoading(false);
        }
      };
      loadWorkerPayments();
    } else {
      loadPaymentsData();
    }
  }, [filterWorker]);

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    // Refresh payments when dialog closes (in case new payment was created)
    loadPaymentsData();
  };

  const handlePaymentCreated = (message) => {
    setSuccessMessage(message);
    handleCreateDialogClose();
    // Auto-hide success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleWorkerChange = (event, newValue) => {
    setFilterWorker(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleRefresh = () => {
    loadPaymentsData();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payments Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status-completed { background-color: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; }
            .status-pending { background-color: #FFC107; color: black; padding: 2px 6px; border-radius: 4px; }
            .status-failed { background-color: #F44336; color: white; padding: 2px 6px; border-radius: 4px; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Payments Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Worker</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.map(payment => `
                <tr>
                  <td>${payment.reference}</td>
                  <td>${payment.workerId?.fullName || payment.workerId?.username || 'N/A'}</td>
                  <td>$${payment.amount?.toFixed(2) || '0.00'}</td>
                  <td>${format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</td>
                  <td>${payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}</td>
                  <td>
                    <span class="status-${payment.status}">
                      ${payment.status?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPayments.map(payment => ({
      'Reference': payment.reference,
      'Worker': payment.workerId?.fullName || payment.workerId?.username || 'N/A',
      'Amount': `$${payment.amount?.toFixed(2) || '0.00'}`,
      'Date': format(new Date(payment.paymentDate), 'MMM dd, yyyy'),
      'Payment Method': payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A',
      'Status': payment.status?.toUpperCase() || 'N/A',
      'Processed By': payment.processedBy?.username || 'System'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, `payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  // Filter payments by search term and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm 
      ? (payment.workerId?.fullName?.toLowerCase().includes(searchTerm) ||
         payment.workerId?.username?.toLowerCase().includes(searchTerm) ||
         payment.reference?.toLowerCase().includes(searchTerm))
      : true;
    
    const matchesStatus = statusFilter !== 'all'
      ? payment.status === statusFilter
      : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1,
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Success message alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Payment History
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Create New Payment">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateDialogOpen}
              sx={{ 
                textTransform: 'none',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              New Payment
            </Button>
          </Tooltip>
          <Tooltip title="Refresh payments">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print report">
            <Button 
              onClick={handlePrint}
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              sx={{ textTransform: 'none' }}
            >
              Print
            </Button>
          </Tooltip>
          <Tooltip title="Export to Excel">
            <Button 
              onClick={handleExcelDownload}
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              sx={{ textTransform: 'none' }}
            >
              Excel
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        gap: 2,
        mb: 3
      }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search payments by worker name, username or reference..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            sx: {
              borderRadius: 2,
              backgroundColor: 'background.default'
            }
          }}
          sx={{ flexGrow: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 2, minWidth: { xs: '100%', sm: 'auto' } }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <Autocomplete
              options={workers}
              getOptionLabel={(option) => option.fullName || option.username}
              value={filterWorker}
              onChange={handleWorkerChange}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Filter by Worker" 
                  variant="outlined"
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              size="small"
            />
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Worker</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold' }}>Processed By</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSmallScreen ? 5 : 7} align="center">
                    {searchTerm || statusFilter !== 'all' || filterWorker
                      ? 'No payments match your search criteria'
                      : 'No payments found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map(payment => (
                  <TableRow key={payment._id} hover>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>
                      {payment.workerId?.fullName || payment.workerId?.username || 'N/A'}
                    </TableCell>
                    <TableCell>${payment.amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</TableCell>
                    {!isSmallScreen && (
                      <TableCell>
                        {payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={payment.status?.toUpperCase() || 'N/A'}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    {!isSmallScreen && (
                      <TableCell>
                        {payment.processedBy?.username || 'System'}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Payment Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCreateDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Payment</DialogTitle>
        <DialogContent>
          <CreatePaymentPage 
            onPaymentCreated={handlePaymentCreated}
            onCancel={handleCreateDialogClose}
            workers={workers}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;