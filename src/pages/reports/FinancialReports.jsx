import React, { useState, useEffect } from 'react';
import { getProfitLossReport } from '../../services/profitService';
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
  TextField
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
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [noData, setNoData] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [dateError, setDateError] = useState(false);

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchProfitData = async () => {
    if (!startDate || !endDate) {
      setDateError(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setNoData(false);
    setDateError(false);
    
    try {
      const data = await getProfitLossReport(startDate, endDate);
      if (data && data.totalRevenue === 0 && data.totalCosts === 0) {
        setNoData(true);
        setReportData(null);
      } else {
        setReportData(data);
      }
    } catch (err) {
      console.error('Error fetching profit data:', err);
      setError(err.message || 'Failed to fetch report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        if (startDate && endDate) {
          await fetchProfitData();
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in initial load:', err);
          setError(err.message || 'Failed to load initial data');
        }
      }
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
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
    }).format(amount);
  };

  const downloadPDF = () => {
    const input = document.getElementById('report-content');
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`profit-loss-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    });
    handleMenuClose();
  };

  const downloadCSV = () => {
    if (!reportData) return;
    
    const csvData = [
      ['Metric', 'Amount (KES)'],
      ['Total Revenue', reportData.totalRevenue],
      ['Total Costs', reportData.totalCosts],
      ['Net Profit', reportData.netProfit],
      ['Profit Margin', `${((reportData.netProfit / reportData.totalRevenue) * 100 || 0).toFixed(2)}%`]
    ];
    
    const csvContent = csvData.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `profit-loss-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    handleMenuClose();
  };

  const downloadExcel = () => {
    if (!reportData) return;
    
    const ws = XLSX.utils.json_to_sheet([
      { Metric: 'Total Revenue', 'Amount (KES)': reportData.totalRevenue },
      { Metric: 'Total Costs', 'Amount (KES)': reportData.totalCosts },
      { Metric: 'Net Profit', 'Amount (KES)': reportData.netProfit },
      { Metric: 'Profit Margin', 'Amount (KES)': `${((reportData.netProfit / reportData.totalRevenue) * 100 || 0).toFixed(2)}%` }
    ]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
    XLSX.writeFile(wb, `profit-loss-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    handleMenuClose();
  };

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Revenue', 'Costs', 'Profit'],
    },
    yaxis: {
      title: {
        text: 'KES'
      },
      labels: {
        formatter: function(value) {
          return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value);
        }
      }
    },
    fill: {
      opacity: 1
    },
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
      data: [reportData.totalRevenue, reportData.totalCosts, reportData.netProfit]
    }
  ] : [];

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
              There are no sales records for the selected date range ({format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}).
              Please try a different date range.
            </Typography>
          </Alert>
        )}

        {reportData && !loading && (
          <Box id="report-content">
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                background: theme.palette.background.paper,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Profit & Loss Summary
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
                      <TableCell sx={{ fontWeight: 600 }}>Metric</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>Total Revenue</TableCell>
                      <TableCell align="right">
                        {formatCurrency(reportData.totalRevenue)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>Total Costs</TableCell>
                      <TableCell align="right">
                        {formatCurrency(reportData.totalCosts)}
                      </TableCell>
                    </TableRow>
                    <TableRow 
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: theme.palette.grey[50]
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        Net Profit
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {formatCurrency(reportData.netProfit)}
                          <Chip
                            label={`${((reportData.netProfit / reportData.totalRevenue) * 100 || 0).toFixed(2)}%`}
                            size="small"
                            sx={{ 
                              ml: 1,
                              backgroundColor: reportData.netProfit >= 0 ? 
                                theme.palette.success.light : 
                                theme.palette.error.light,
                              color: reportData.netProfit >= 0 ? 
                                theme.palette.success.dark : 
                                theme.palette.error.dark,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {reportData.categoryBreakdown?.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Category Performance
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Costs</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Profit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Margin</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.categoryBreakdown.map((category) => (
                        <TableRow hover key={category.categoryId || category.categoryName}>
                          <TableCell>{category.categoryName}</TableCell>
                          <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(category.costs)}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: category.profit >= 0 ? 
                                theme.palette.success.main : 
                                theme.palette.error.main,
                              fontWeight: 500
                            }}
                          >
                            {formatCurrency(Math.abs(category.profit))}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: category.profit >= 0 ? 
                                theme.palette.success.main : 
                                theme.palette.error.main,
                              fontWeight: 500
                            }}
                          >
                            {((category.profit / category.revenue) * 100 || 0).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {reportData.topPerformingProducts?.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Top Selling Products
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Profit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Units Sold</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Margin</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.topPerformingProducts.map((product) => (
                        <TableRow hover key={product.productId}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: product.profit >= 0 ? 
                                theme.palette.success.main : 
                                theme.palette.error.main,
                              fontWeight: 500
                            }}
                          >
                            {formatCurrency(Math.abs(product.profit))}
                          </TableCell>
                          <TableCell align="right">{product.quantitySold}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: product.profit >= 0 ? 
                                theme.palette.success.main : 
                                theme.palette.error.main,
                              fontWeight: 500
                            }}
                          >
                            {((product.profit / product.revenue) * 100 || 0).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        )}

        {/* Chart Dialog */}
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

        {/* Share Dialog */}
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
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message (Optional)"
              variant="outlined"
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => setShareDialogOpen(false)} 
              variant="contained" 
              color="primary"
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