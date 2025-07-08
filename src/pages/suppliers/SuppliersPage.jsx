import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FiEdit2, FiTrash2, FiPrinter, FiDownload, FiPlus, FiSearch } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  addSupplier, 
  getSuppliers, 
  updateSupplier, 
  deleteSupplier 
} from '../../services/supplierService';
import { getAllCategories } from '../../services/categories';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    rating: '',
    categoryIds: []
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data.content || data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      toast.error('Failed to fetch categories', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSuppliers();
      setSuppliers(data.content || data);
    } catch (err) {
      setError('Failed to fetch suppliers.');
      toast.error('Failed to fetch suppliers', {
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

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
    setFormData(prev => ({ ...prev, categoryIds: selected }));
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      rating: '',
      categoryIds: []
    });
    setEditingSupplier(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const supplierData = {
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        website: formData.website || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        categoryIds: formData.categoryIds
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        setSuccess('Supplier updated successfully!');
        toast.success('Supplier updated successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        await addSupplier(supplierData);
        setSuccess('Supplier created successfully!');
        toast.success('Supplier created successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      resetForm();
      setShowForm(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.message || 'Failed to save supplier');
      toast.error(err.message || 'Failed to save supplier', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Edit supplier
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      companyName: supplier.companyName || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      website: supplier.website || '',
      rating: supplier.rating ? supplier.rating.toString() : '',
      categoryIds: supplier.categories?.map(c => c.id) || []
    });
    setShowForm(true);
  };

  // Delete supplier
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        setSuccess('Supplier deleted successfully!');
        fetchSuppliers();
        toast.success('Supplier deleted successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        setError('Failed to delete supplier');
        toast.error('Failed to delete supplier', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  // Excel download
  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSuppliers.map(supplier => ({
      'Company Name': supplier.companyName,
      'Contact Person': supplier.contactPerson,
      'Email': supplier.email || 'N/A',
      'Phone': supplier.phone || 'N/A',
      'Address': supplier.address || 'N/A',
      'Website': supplier.website || 'N/A',
      'Rating': supplier.rating || 'N/A',
      'Categories': supplier.categories?.map(c => c.name).join(', ') || 'N/A',
      'Created At': formatDate(supplier.createdAt),
      'Updated At': formatDate(supplier.updatedAt)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    XLSX.writeFile(workbook, "suppliers_" + new Date().toISOString().split('T')[0] + ".xlsx");
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
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  // Render star rating
  const renderRating = (rating) => {
    if (rating === null || rating === undefined) return <span className="text-gray-400">N/A</span>;
    
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400 text-sm" />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className="text-yellow-400 text-sm" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-yellow-400 text-sm" />
        ))}
        <span className="ml-1 text-xs text-gray-600">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    return (
      supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Print handler - matches your BrandsPage style
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Suppliers List</title>
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
          <h1>Suppliers Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Rating</th>
                <th>Categories</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSuppliers.map(supplier => `
                <tr>
                  <td>${supplier.companyName}</td>
                  <td>${supplier.contactPerson || 'N/A'}</td>
                  <td>${supplier.email || 'N/A'}</td>
                  <td>${supplier.phone || 'N/A'}</td>
                  <td>${supplier.rating ? supplier.rating.toFixed(1) + '/5' : 'N/A'}</td>
                  <td>${supplier.categories?.map(c => c.name).join(', ') || 'N/A'}</td>
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

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Suppliers Management</h1>
            <p className="text-gray-600 text-sm">Manage your suppliers and their details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExcelDownload}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Export Suppliers"
            >
              <FiDownload size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Print Suppliers"
            >
              <FiPrinter size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Print</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-sm transition duration-200 text-sm sm:text-base flex items-center justify-center gap-1"
            >
              <FiPlus size={16} />
              <span>Add Supplier</span>
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm sm:text-base"
            />
            <FiSearch className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {loading && filteredSuppliers.length === 0 ? (
            <div className="flex justify-center items-center p-8 sm:p-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Categories</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 transition">
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 text-sm font-medium">
                                {supplier.companyName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{supplier.companyName}</div>
                              <div className="text-xs text-gray-500 sm:hidden">{supplier.email}</div>
                              <div className="text-xs sm:hidden mt-1">
                                {renderRating(supplier.rating)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">{supplier.contactPerson}</div>
                          <div className="text-xs text-gray-500 md:hidden">{supplier.phone}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                          {supplier.email ? (
                            <a href={`mailto:${supplier.email}`} className="text-indigo-600 hover:text-indigo-900">
                              {supplier.email}
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          {supplier.phone || 'N/A'}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 hidden lg:table-cell">
                          {renderRating(supplier.rating)}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {supplier.categories?.length > 0 ? (
                              supplier.categories.map(category => (
                                <span 
                                  key={category.id} 
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {category.name}
                                </span>
                              ))
                            ) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(supplier)}
                              className="text-indigo-600 hover:text-indigo-800 transition p-1 rounded hover:bg-indigo-50"
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No suppliers match your search' : 'No suppliers available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Supplier Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="font-bold text-lg mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="example.com"
                      className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories *
                  </label>
                  <select
                    multiple
                    name="categoryIds"
                    value={formData.categoryIds}
                    onChange={handleCategoryChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 h-auto min-h-[100px]"
                    required
                    disabled={loading}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple categories
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      {editingSupplier ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;