import React, { useEffect, useState, useRef } from 'react';
import * as brandAPI from '../../services/brand';
import { Printer, Download } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await brandAPI.getBrands();
      const brandsData = Array.isArray(response) ? response : [];
      setBrands(brandsData);
      setFilteredBrands(brandsData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch brands', err);
      setError('Failed to fetch brands. Please try again.');
      setBrands([]);
      setFilteredBrands([]);
      toast.error('Failed to fetch brands. Please try again.', {
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

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.length > 0) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(term) ||
        (brand.description && brand.description.toLowerCase().includes(term)))
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Brand name is required');
      toast.error('Brand name is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const newBrand = await brandAPI.addBrand({
        name: name.trim(),
        description: description.trim()
      });
      setBrands(prevBrands => [...prevBrands, newBrand]);
      setFilteredBrands(prevBrands => [...prevBrands, newBrand]);
      setName('');
      setDescription('');
      setError('');
      document.getElementById('addBrandModal').close();
      toast.success('Brand added successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error adding brand:', err);
      setError(err.response?.data?.message || 'Failed to add brand. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to add brand. Please try again.', {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    setLoading(true);
    try {
      await brandAPI.deleteBrand(id);
      setBrands(prevBrands => prevBrands.filter(brand => brand.id !== id));
      setFilteredBrands(prevBrands => prevBrands.filter(brand => brand.id !== id));
      setError('');
      toast.success('Brand deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError(err.response?.data?.message || 'Failed to delete brand. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to delete brand. Please try again.', {
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

  const startEditing = (brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
    setEditingDescription(brand.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      setError('Brand name is required');
      toast.error('Brand name is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const updatedBrand = await brandAPI.updateBrand(editingId, {
        name: editingName.trim(),
        description: editingDescription.trim()
      });
      setBrands(prevBrands => 
        prevBrands.map(brand => brand.id === editingId ? updatedBrand : brand)
      );
      setFilteredBrands(prevBrands => 
        prevBrands.map(brand => brand.id === editingId ? updatedBrand : brand)
      );
      cancelEditing();
      setError('');
      toast.success('Brand updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error updating brand:', err);
      setError(err.response?.data?.message || 'Failed to update brand. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update brand. Please try again.', {
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

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Description', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredBrands.map(brand => [
        brand.id,
        `"${brand.name.replace(/"/g, '""')}"`,
        brand.description ? `"${brand.description.replace(/"/g, '""')}"` : 'N/A',
        formatCreatedAt(brand.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brands_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export started successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const formatCreatedAt = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Brands List</title>
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
          <h1>Brands Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBrands.map(brand => `
                <tr>
                  <td>${brand.id}</td>
                  <td>${brand.name}</td>
                  <td>${brand.description || 'N/A'}</td>
                  <td>${formatCreatedAt(brand.createdAt)}</td>
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
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Brands Management</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Export Brands"
            >
              <Download size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Print Brands"
            >
              <Printer size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Print</span>
            </button>
            <button
              onClick={() => document.getElementById('addBrandModal').showModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm transition duration-200 text-sm sm:text-base flex items-center justify-center gap-1"
            >
              Add Brand
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search brands by name or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm sm:text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {loading && filteredBrands.length === 0 ? (
            <div className="flex justify-center items-center p-8 sm:p-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Created At</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-gray-50 transition">
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-900 font-medium">
                          <div className="text-xs sm:text-sm">{brand.id}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{brand.name}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                          <div className="text-xs sm:text-sm">{brand.description || 'N/A'}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden md:table-cell">
                          <div className="text-xs sm:text-sm">{formatCreatedAt(brand.createdAt)}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => startEditing(brand)}
                              className="text-green-600 hover:text-green-800 transition p-1 rounded hover:bg-green-50"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(brand.id)}
                              className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No brands match your search' : 'No brands available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Brand Modal */}
      <dialog id="addBrandModal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Add New Brand</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter brand description (optional)"
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <div className="modal-action">
              <button
                type="button"
                onClick={() => document.getElementById('addBrandModal').close()}
                className="btn btn-ghost mr-2"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Adding...
                  </>
                ) : 'Add Brand'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Edit Brand</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsPage;