import React, { useState, useEffect } from 'react';
import { 
  getProfitLossReport, 
  getSalesReport, 
  getProductPerformanceReport, 
  getInventoryValuationReport,
  getSupplierPurchaseReport,
  getDailySummary,
  exportReport
} from '../../services/profitService';
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
  Chip,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays } from 'date-fns';
import { 
  Info as InfoIcon, 
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as CsvIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Chart from 'react-apexcharts';

const FinancialReports = () => {
  const theme = useTheme();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date('2024-07-15'));
  const [endDate, setEndDate] = useState(new Date('2025-07-15'));
  const [noData, setNoData] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [reportType, setReportType] = useState('PROFIT_LOSS');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      setDateError(true);
      return;
    }

    setLoading(true);
    setError(null);
    setNoData(false);
    setDateError(false);

    try {
      let data;
      switch (reportType) {
        case 'PROFIT_LOSS':
          data = await getProfitLossReport(startDate, endDate);
          break;
        case 'SALES':
          data = await getSalesReport(startDate, endDate);
          break;
        case 'PRODUCTS':
          data = await getProductPerformanceReport(startDate, endDate);
          break;
        case 'INVENTORY':
          data = await getInventoryValuationReport();
          break;
        case 'SUPPLIERS':
          data = await getSupplierPurchaseReport(startDate, endDate);
          break;
        case 'DAILY_SUMMARY':
          data = await getDailySummary(endDate);
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (!data || (Array.isArray(data) && data.length === 0) || 
          (typeof data === 'object' && Object.values(data).every(val => val === 0 || val === null))) {
        setNoData(true);
        setReportData(null);
      } else {
        setReportData(data);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to fetch report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted && startDate && endDate) {
        await fetchReportData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [reportType, startDate, endDate]);

  const handleDateSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const downloadPDF = async () => {
    try {
      const blob = await exportReport({
        reportType: reportType,
        startDate,
        endDate,
        format: 'PDF'
      });
      saveAs(blob, `report-${reportType.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      setError('Failed to export PDF');
    }
    handleMenuClose();
  };

  const downloadCSV = async () => {
    try {
      const blob = await exportReport({
        reportType: reportType,
        startDate,
        endDate,
        format: 'CSV'
      });
      saveAs(blob, `report-${reportType.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } catch (err) {
      setError('Failed to export CSV');
    }
    handleMenuClose();
  };

  const downloadExcel = async () => {
    try {
      const blob = await exportReport({
        reportType: reportType,
        startDate,
        endDate,
        format: 'EXCEL'
      });
      saveAs(blob, `report-${reportType.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (err) {
      setError('Failed to export Excel');
    }
    handleMenuClose();
  };

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: reportType === 'PROFIT_LOSS' ? ['Revenue', 'COGS', 'Gross Profit', 'Expenses', 'Net Profit'] : 
                 reportType === 'SALES' ? ['Total Sales', 'Gross Profit', 'Net Profit'] :
                 ['Value'],
    },
    yaxis: {
      title: { text: 'KES' },
      labels: {
        formatter: function(value) {
          return formatCurrency(value);
        }
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: function(val) {
          return formatCurrency(val);
        }
      }
    },
    colors: [theme.palette.primary.main, theme.palette.error.main, theme.palette.success.main]
  };

  const chartSeries = reportData ? [
    {
      name: 'Amount',
      data: reportType === 'PROFIT_LOSS' ? [
        reportData.totalRevenue || 0,
        reportData.totalCost || 0,
        reportData.grossProfit || 0,
        reportData.expenses || 0,
        reportData.netProfit || 0
      ] : reportType === 'SALES' ? [
        reportData.reduce((sum, item) => sum + (item.totalSales || 0), 0),
        reportData.reduce((sum, item) => sum + (item.grossProfit || 0), 0),
        reportData.reduce((sum, item) => sum + (item.netProfit || 0), 0)
      ] : [0]
    }
  ] : [];

  const renderProfitLossReport = () => (
    <Box id="report-content">
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], background: theme.palette.background.paper, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Income Statement
          </Typography>
          <Chip 
            label={`${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }} colSpan={2}>Revenue</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Gross Sales</TableCell>
                <TableCell align="right">{formatCurrency(reportData.totalRevenue)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Returns & Allowances</TableCell>
                <TableCell align="right">{formatCurrency(0)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Net Sales</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(reportData.totalRevenue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }} colSpan={2}>Cost of Goods Sold</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Beginning Inventory</TableCell>
                <TableCell align="right">{formatCurrency(0)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Purchases</TableCell>
                <TableCell align="right">{formatCurrency(reportData.totalCost)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Ending Inventory</TableCell>
                <TableCell align="right">{formatCurrency(0)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Total COGS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(reportData.totalCost)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Gross Profit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(reportData.grossProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }} colSpan={2}>Operating Expenses</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Total Operating Expenses</TableCell>
                <TableCell align="right">{formatCurrency(reportData.expenses)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Operating Income</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(reportData.grossProfit - reportData.expenses)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }} colSpan={2}>Other Income & Expenses</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Other Income</TableCell>
                <TableCell align="right">{formatCurrency(reportData.otherIncome)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Other Expenses</TableCell>
                <TableCell align="right">{formatCurrency(reportData.otherExpenses)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Taxes</TableCell>
                <TableCell align="right">{formatCurrency(0)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Net Income</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(reportData.netProfit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderSalesReport = () => (
    <Box id="report-content">
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], background: theme.palette.background.paper, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Sales Report
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total Sales</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Gross Profit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Net Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((item, index) => (
                <TableRow hover key={index}>
                  <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell align="right">{item.orderCount}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalSales)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.grossProfit)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.netProfit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderProductPerformanceReport = () => (
    <Box id="report-content">
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], background: theme.palette.background.paper, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWebg: 600, mb: 2 }}>
          Product Performance Report
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Units Sold</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Profit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Margin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((product, index) => (
                <TableRow hover key={index}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell align="right">{product.categoryName}</TableCell>
                  <TableCell align="right">{product.unitsSold}</TableCell>
                  <TableCell align="right">{formatCurrency(product.totalRevenue)}</TableCell>
                  <TableCell align="right" sx={{ 
                    color: product.grossProfit >= 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}>
                    {formatCurrency(Math.abs(product.grossProfit))}
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: product.grossProfit >= 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}>
                    {(product.profitMargin * 100 || 0).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderInventoryValuationReport = () => (
    <Box id="report-content">
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], background: theme.palette.background.paper, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Inventory Valuation Report
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Cost</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total Value</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Turnover</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((item, index) => (
                <TableRow hover key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell align="right">{(item.inventoryTurnover || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderSupplierPurchaseReport = () => (
    <Box id="report-content">
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], background: theme.palette.background.paper, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Supplier Purchase Report
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Purchase Count</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Avg. Order Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((item, index) => (
                <TableRow hover key={index}>
                  <TableCell>{item.supplierName}</TableCell>
                  <TableCell align="right">{item.purchaseCount}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalSpent)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.averageOrderValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderDailySummaryReport = () => (
    <Box id="report-content">
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], background: theme.palette.background.paper, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Daily Summary Report
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 600 }}>Metric</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>Total Sales Count</TableCell>
                <TableCell align="right">{reportData.totalSalesCount}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Total Revenue</TableCell>
                <TableCell align="right">{formatCurrency(reportData.totalRevenue)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Total Expenses</TableCell>
                <TableCell align="right">{formatCurrency(reportData.totalExpenses)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Net Profit</TableCell>
                <TableCell align="right">{formatCurrency(reportData.netProfit)}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Low Stock Items</TableCell>
                <TableCell align="right">{reportData.lowStockItemsCount}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Inventory Value</TableCell>
                <TableCell align="right">{formatCurrency(reportData.inventoryValue)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const handleShareReport = async () => {
    try {
      const blob = await exportReport({
        reportType: reportType,
        startDate,
        endDate,
        format: 'PDF'
      });
      // Implement actual email sending logic here
      console.log('Sharing report to:', shareEmail, 'with message:', shareMessage);
      setShareDialogOpen(false);
      setShareEmail('');
      setShareMessage('');
    } catch (err) {
      setError('Failed to share report');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Financial Reports Dashboard
          </Typography>
          {reportData && !loading && (
            <Box>
              <Tooltip title="More options">
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  color="primary"
                  sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff'
                    }
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                  style: {
                    width: '200px',
                  },
                }}
              >
                <MenuItem onClick={downloadPDF}>
                  <PdfIcon color="error" sx={{ mr: 1 }} />
                  Download PDF
                </MenuItem>
                <MenuItem onClick={downloadExcel}>
                  <CsvIcon color="success" sx={{ mr: 1 }} />
                  Download Excel
                </MenuItem>
                <MenuItem onClick={downloadCSV}>
                  <CsvIcon color="info" sx={{ mr: 1 }} />
                  Download CSV
                </MenuItem>
                <MenuItem onClick={() => { setChartDialogOpen(true); handleMenuClose(); }}>
                  <ChartIcon color="secondary" sx={{ mr: 1 }} />
                  View Chart
                </MenuItem>
                <MenuItem onClick={() => { setShareDialogOpen(true); handleMenuClose(); }}>
                  <ShareIcon color="primary" sx={{ mr: 1 }} />
                  Share Report
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
        
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            background: theme.palette.background.paper,
            border: dateError ? `1px solid ${theme.palette.error.main}` : 'none'
          }}
        >
          <form onSubmit={handleDateSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <FormControl fullWidth sx={{ maxWidth: 200 }}>
                <InputLabel id="report-type-label">Report Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="PROFIT_LOSS">Income Statement</MenuItem>
                  <MenuItem value="SALES">Sales Report</MenuItem>
                  <MenuItem value="PRODUCTS">Product Performance</MenuItem>
                  <MenuItem value="INVENTORY">Inventory Valuation</MenuItem>
                  <MenuItem value="SUPPLIERS">Supplier Purchases</MenuItem>
                  <MenuItem value="DAILY_SUMMARY">Daily Summary</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setDateError(false);
                }}
                maxDate={endDate}
                slotProps={{
                  textField: { 
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined',
                    error: dateError,
                    helperText: dateError ? 'Please select a start date' : ''
                  },
                  field: { clearable: true }
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  setDateError(false);
                }}
                minDate={startDate}
                maxDate={new Date()}
                slotProps={{
                  textField: { 
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined',
                    error: dateError,
                    helperText: dateError ? 'Please select an end date' : ''
                  },
                  field: { clearable: true }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ 
                  height: '40px', 
                  minWidth: '180px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    backgroundColor: theme.palette.primary.dark
                  }
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Stack>
          </form>
        </Paper>

        {dateError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }}
            onClose={() => setDateError(false)}
          >
            Please select both start and end dates to generate the report.
          </Alert>
        )}

        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '300px',
            borderRadius: 2,
            backgroundColor: theme.palette.background.default
          }}>
            <Box textAlign="center">
              <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Generating your financial report...
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }}
            onClose={() => setError(null)}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Error Loading Report</Typography>
            <Typography>{error}</Typography>
          </Alert>
        )}

        {noData && (
          <Alert 
            severity="info" 
            icon={<InfoIcon fontSize="large" />}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              No Data Available
            </Typography>
            <Typography>
              There are no records for the selected date range ({format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}).
              Please try a different date range or report type.
            </Typography>
          </Alert>
        )}

        {reportData && !loading && (
          <>
            {reportType === 'PROFIT_LOSS' && renderProfitLossReport()}
            {reportType === 'SALES' && renderSalesReport()}
            {reportType === 'PRODUCTS' && renderProductPerformanceReport()}
            {reportType === 'INVENTORY' && renderInventoryValuationReport()}
            {reportType === 'SUPPLIERS' && renderSupplierPurchaseReport()}
            {reportType === 'DAILY_SUMMARY' && renderDailySummaryReport()}
          </>
        )}

        <Dialog
          open={chartDialogOpen}
          onClose={() => setChartDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Financial Overview Chart</DialogTitle>
          <DialogContent>
            {reportData && (
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={350}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChartDialogOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Share Report</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Share this financial report via email or generate a shareable link.
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message (Optional)"
              variant="outlined"
              multiline
              rows={4}
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleShareReport} 
              variant="contained" 
              color="primary"
              disabled={!shareEmail}
            >
              Send Report
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default FinancialReports;