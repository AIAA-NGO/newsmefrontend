import React, { useEffect, useState, useRef } from 'react';
import { 
  getSales, 
  getSalesByDateRange, 
  getSalesByStatus, 
  generateReceipt, 
  exportSalesToCSV
} from '../../services/salesService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiPrinter,
  FiDownload,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiDollarSign,
  FiShoppingBag,
  FiCalendar
} from 'react-icons/fi';

// Date formatting utilities
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return 'Invalid Date';
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US');
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return '';
  }
  
  // Convert to YYYY-MM-DD format for date inputs
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalSale, setModalSale] = useState(null);
  const [modalType, setModalType] = useState('details');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;
  const printRef = useRef();
  const printAllRef = useRef();

  // Real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        let data;
        if (startDate && endDate) {
          // Create dates at start and end of day
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          
          data = await getSalesByDateRange(start, end);
        } else if (statusFilter) {
          data = await getSalesByStatus(statusFilter);
        } else {
          data = await getSales();
        }
        
        const sorted = data.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        setSales(sorted);
        setFilteredSales(sorted);
      } catch (err) {
        console.error('Failed to load sales', err);
        toast.error('Failed to load sales data', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [startDate, endDate, statusFilter]);

  useEffect(() => {
    let result = [...sales];
    
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(sale =>
        (sale.customerName && sale.customerName.toLowerCase().includes(lower)) ||
        (sale.customer?.name?.toLowerCase().includes(lower)) ||
        (sale.id.toString().includes(search))
      );
    }

    setFilteredSales(result);
    setCurrentPage(1);
  }, [search, sales]);

  // Calculate totals
  const totals = filteredSales.reduce(
    (acc, sale) => {
      acc.all += sale.total || 0;
      if (sale.status === 'COMPLETED') {
        acc.completed += sale.total;
        acc.completedCount++;
      }
      return acc;
    },
    { 
      completed: 0, 
      all: 0, 
      completedCount: 0,
    }
  );

  const exportCSV = async () => {
    try {
      await exportSalesToCSV(filteredSales);
      toast.success('CSV export started successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Failed to export data', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${modalType === 'receipt' ? 'Receipt' : 'Sale Details'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 5px; }
              .header p { font-size: 0.9rem; color: #555; margin: 2px 0; }
              .details { margin-bottom: 20px; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .section-title { font-weight: bold; font-size: 1.1rem; margin: 15px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              .items-table th { text-align: left; padding: 8px; background-color: #f5f5f5; border-bottom: 1px solid #ddd; }
              .items-table td { padding: 8px; border-bottom: 1px solid #eee; }
              .items-table td:last-child { text-align: right; }
              .totals { margin-top: 20px; text-align: right; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .grand-total { font-weight: bold; font-size: 1.2rem; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; }
              .footer { margin-top: 30px; font-size: 0.8rem; text-align: center; color: #777; }
              .status { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; }
              .status-completed { background-color: #d4edda; color: #155724; }
              .status-cancelled { background-color: #f8d7da; color: #721c24; }
              .status-pending { background-color: #fff3cd; color: #856404; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handlePrintAllSales = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { font-size: 1.8rem; font-weight: bold; margin-bottom: 5px; }
            .header p { font-size: 0.9rem; color: #555; margin: 2px 0; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
            .summary-card { background: #f8f9fa; border-radius: 8px; padding: 15px; }
            .summary-card h3 { font-size: 0.9rem; color: #6c757d; margin-bottom: 10px; }
            .summary-card p { font-size: 1.2rem; font-weight: bold; color: #212529; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; background-color: #f1f3f5; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e9ecef; }
            .status { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; }
            .status-completed { background-color: #d4edda; color: #155724; }
            .status-cancelled { background-color: #f8d7da; color: #721c24; }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .totals { margin-top: 20px; text-align: right; font-weight: bold; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            ${startDate && endDate ? `<p>Date Range: ${formatDateOnly(startDate)} to ${formatDateOnly(endDate)}</p>` : ''}
            ${statusFilter ? `<p>Status: ${statusFilter}</p>` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Sales</h3>
              <p>${filteredSales.length}</p>
            </div>
            <div class="summary-card">
              <h3>Completed Sales</h3>
              <p>${totals.completedCount}</p>
            </div>
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <p>Ksh ${totals.all.toFixed(2)}</p>
            </div>
            <div class="summary-card">
              <h3>Completed Revenue</h3>
              <p>Ksh ${totals.completed.toFixed(2)}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales.map(sale => `
                <tr>
                  <td>${sale.id}</td>
                  <td>${sale.customerName || sale.customer?.name || 'Walk-in'}</td>
                  <td>${formatDate(sale.saleDate)}</td>
                  <td>${sale.items?.length || 0}</td>
                  <td>Ksh ${sale.total?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span class="status ${
                      sale.status === 'COMPLETED' ? 'status-completed' :
                      sale.status === 'CANCELLED' ? 'status-cancelled' :
                      'status-pending'
                    }">
                      ${sale.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Total Sales Value: Ksh ${totals.all.toFixed(2)}</p>
            <p>Completed Sales Value: Ksh ${totals.completed.toFixed(2)}</p>
          </div>
          
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

  const pageSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sales Records</h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <FiCalendar className="text-blue-600" />
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 flex items-center justify-between shadow-md transition-all duration-300"
          >
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            <FiFilter className="ml-2" />
          </button>
        </div>

        {/* Filters - hidden on mobile unless toggled */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-100`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or ID"
                className="pl-10 p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={exportCSV} 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-600 w-full shadow-md transition-all duration-300"
              >
                <FiDownload /> Export
              </button>
              <button
                onClick={handlePrintAllSales}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 w-full shadow-md transition-all duration-300"
              >
                <FiPrinter /> Print
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white shadow rounded-lg p-4 border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FiShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Sales</p>
                    <p className="text-lg font-bold text-gray-800">
                      {totals.completedCount} sales - Ksh {totals.completed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg p-4 border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FiDollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-lg font-bold text-gray-800">
                      {filteredSales.length} sales - Ksh {totals.all.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">ID</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">Items</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">Status</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700 hidden md:table-cell">Date</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pageSales.length > 0 ? (
                      pageSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="p-3 hidden sm:table-cell text-sm text-gray-500">{sale.id}</td>
                          <td className="p-3">
                            <div className="font-medium text-gray-900">
                              {sale.customerName || sale.customer?.name || 'Walk-in Customer'}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {formatDateOnly(sale.saleDate)}
                            </div>
                          </td>
                          <td className="p-3 hidden sm:table-cell text-sm text-gray-500">
                            {sale.items?.length || 0}
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            Ksh {sale.total?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              sale.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="p-3 hidden md:table-cell text-sm text-gray-500">
                            {formatDate(sale.saleDate)}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { 
                                  setModalSale(sale); 
                                  setModalType('details'); 
                                }} 
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors duration-200"
                              >
                                <FiFileText size={14} /> Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-500">
                          No sales records found. Try adjusting your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 flex items-center gap-1 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FiChevronLeft size={16} /> Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg border ${
                        currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 flex items-center gap-1 hover:bg-gray-50 transition-colors duration-200"
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            )}

            {modalSale && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl relative" ref={printRef}>
                  <button 
                    onClick={() => setModalSale(null)} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {modalType === 'details' && (
                    <>
                      <div className="header">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Sale Details</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Sale ID:</span> {modalSale.id}
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span> {formatDate(modalSale.saleDate)}
                          </div>
                        </div>
                      </div>

                      <div className="details my-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-3">Customer Information</h3>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-medium text-gray-600">Name:</span> {modalSale.customerName || modalSale.customer?.name || 'Walk-in Customer'}
                              </p>
                              {modalSale.customer?.phone && (
                                <p>
                                  <span className="font-medium text-gray-600">Phone:</span> {modalSale.customer.phone}
                                </p>
                              )}
                              {modalSale.customer?.email && (
                                <p>
                                  <span className="font-medium text-gray-600">Email:</span> {modalSale.customer.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-3">Sale Information</h3>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-medium text-gray-600">Status:</span> 
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                  modalSale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  modalSale.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {modalSale.status}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-600">Subtotal:</span> Ksh {modalSale.subtotal?.toFixed(2) || '0.00'}
                              </p>
                              <p>
                                <span className="font-medium text-gray-600">Tax:</span> Ksh {modalSale.taxAmount?.toFixed(2) || '0.00'}
                              </p>
                              <p>
                                <span className="font-medium text-gray-600">Discount:</span> Ksh {modalSale.discountAmount?.toFixed(2) || '0.00'}
                              </p>
                              <p className="font-semibold">
                                <span className="text-gray-600">Total:</span> Ksh {modalSale.total?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="section-title text-gray-800">Items Purchased</div>
                      <div className="overflow-x-auto">
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th className="text-right">Qty</th>
                              <th className="text-right">Price</th>
                              <th className="text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modalSale.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div className="font-medium">{item.productName}</div>
                                  {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                                </td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">Ksh {item.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td className="text-right">Ksh {item.totalPrice?.toFixed(2) || '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {modalSale.notes && (
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-700 mb-2">Additional Notes</h3>
                          <p className="text-sm text-gray-600">{modalSale.notes}</p>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end gap-4 no-print">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-md transition-all duration-300"
                        >
                          <FiPrinter /> Print Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}