import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../../services/categories';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Printer, Download } from 'lucide-react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategories();
      const data = Array.isArray(response) ? response : response.content || [];
      setCategories(data);
      setFilteredCategories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Failed to fetch categories. Please try again.');
      toast.error('Failed to fetch categories. Please try again.', {
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
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term)))
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError('Please enter a category name');
      toast.error('Please enter a category name', {
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
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim()
      });
      setCategories([...categories, newCategory]);
      setFilteredCategories([...filteredCategories, newCategory]);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setError(null);
      toast.success('Category added successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.response?.data?.message || 'Failed to add category. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to add category. Please try again.', {
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

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setLoading(true);
    try {
      await deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      setFilteredCategories(filteredCategories.filter(cat => cat.id !== id));
      setError(null);
      toast.success('Category deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Failed to delete category. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to delete category. Please try again.', {
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

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingDescription(category.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handleUpdateCategory = async () => {
    if (!editingName.trim()) {
      setError('Please enter a category name');
      toast.error('Please enter a category name', {
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
      const updatedCategory = await updateCategory(editingId, {
        name: editingName.trim(),
        description: editingDescription.trim()
      });
      setCategories(categories.map(cat => 
        cat.id === editingId ? updatedCategory : cat
      ));
      setFilteredCategories(filteredCategories.map(cat => 
        cat.id === editingId ? updatedCategory : cat
      ));
      cancelEditing();
      setError(null);
      toast.success('Category updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.response?.data?.message || 'Failed to update category. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update category. Please try again.', {
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Categories List</title>
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
          <h1>Categories Report</h1>
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
              ${filteredCategories.map(category => `
                <tr>
                  <td>${category.id}</td>
                  <td>${category.name}</td>
                  <td>${category.description || 'N/A'}</td>
                  <td>${formatCreatedAt(category.createdAt || category.created_at)}</td>
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
    if (filteredCategories.length === 0) {
      setError('There is nothing to export');
      toast.error('There is nothing to export', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCategories.map(category => ({
        ID: category.id,
        Name: category.name,
        Description: category.description || 'N/A',
        'Created At': formatCreatedAt(category.createdAt || category.created_at)
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "categories.xlsx");
    
    toast.success('Excel export started successfully', {
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
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Categories Management</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExcelDownload}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Export Categories"
            >
              <Download size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Print Categories"
            >
              <Printer size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Print</span>
            </button>
            <button
              onClick={() => document.getElementById('addCategoryModal').showModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm transition duration-200 text-sm sm:text-base flex items-center justify-center gap-1"
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm sm:text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {loading && filteredCategories.length === 0 ? (
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
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition">
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-900 font-medium">
                          <div className="text-xs sm:text-sm">{category.id}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          {editingId === category.id ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full border border-blue-400 px-2 py-1 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              required
                            />
                          ) : (
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{category.name}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                          {editingId === category.id ? (
                            <textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              className="w-full border border-blue-400 px-2 py-1 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              rows={2}
                            />
                          ) : (
                            <div className="text-xs sm:text-sm">{category.description || 'N/A'}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden md:table-cell">
                          <div className="text-xs sm:text-sm">{formatCreatedAt(category.createdAt || category.created_at)}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium">
                          {editingId === category.id ? (
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={handleUpdateCategory}
                                className="text-green-600 hover:text-green-800 transition p-1 rounded hover:bg-green-50 flex items-center gap-1"
                                disabled={loading}
                              >
                                {loading ? (
                                  <svg className="animate-spin h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className="hidden sm:inline">Save</span>
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-800 transition p-1 rounded hover:bg-gray-50 flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={() => startEditing(category)}
                                className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No categories match your search' : 'No categories available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      <dialog id="addCategoryModal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Add New Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter category description (optional)"
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
                onClick={() => document.getElementById('addCategoryModal').close()}
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
                ) : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default CategoriesPage;