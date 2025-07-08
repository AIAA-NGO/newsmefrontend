import React, { useState, useEffect, useRef } from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon,
  PrinterIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  getAllCustomers,
  deleteCustomer
} from '../../services/customerService';
import CustomerForm from './CustomerForm';
import Spinner from './Spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomersPage = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const componentRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle location state for notifications
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Clear the location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers();
      setCustomers(response.data || response); // Handle both array and object responses
    } catch (err) {
      toast.error('Failed to fetch customers. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCustomers = [...customers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setCustomers(sortedCustomers);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await deleteCustomer(id);
      setCustomers(customers.filter(customer => customer.id !== id));
      toast.success('Customer deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete customer.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Handle form success
  const handleFormSuccess = (message) => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
    toast.success(message || 'Customer saved successfully!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Print handler
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Customers List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Customers Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(customer => `
                <tr>
                  <td>${customer.id}</td>
                  <td>${customer.name || 'N/A'}</td>
                  <td>${customer.email || 'N/A'}</td>
                  <td>${customer.phone || 'N/A'}</td>
                  <td>${customer.address || 'N/A'}</td>
                  <td>${formatCreatedAt(customer.createdAt || customer.created_at)}</td>
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

  // Excel export
  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(customers.map(customer => ({
      ID: customer.id,
      Name: customer.name,
      Email: customer.email || 'N/A',
      Phone: customer.phone || 'N/A',
      Address: customer.address || 'N/A',
      'Created At': formatCreatedAt(customer.createdAt || customer.created_at)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "customers.xlsx");
    
    toast.success('Excel export started successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Format date
  const formatCreatedAt = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
            <p className="mt-1 text-gray-600">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} in total
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            >
              <PrinterIcon className="h-5 w-5 text-gray-700" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExcelDownload}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5 text-gray-700" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm flex items-center gap-2 transition-colors"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {loading && customers.length === 0 ? (
            <div className="flex justify-center items-center p-12">
              <Spinner size="lg" />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No customers found</p>
              <button
                onClick={fetchCustomers}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div ref={componentRef}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('id')}
                      >
                        <div className="flex items-center">
                          ID
                          {sortConfig.key === 'id' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {sortConfig.key === 'email' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('phone')}
                      >
                        <div className="flex items-center">
                          Phone
                          {sortConfig.key === 'phone' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('createdAt')}
                      >
                        <div className="flex items-center">
                          Created At
                          {sortConfig.key === 'createdAt' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                              <span className="text-blue-600 text-sm font-medium">
                                {customer.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCreatedAt(customer.createdAt || customer.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingCustomer(customer);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <CustomerForm 
                customer={editingCustomer} 
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;