import React, { useEffect, useState } from 'react';
import * as unitAPI from '../../services/Unit';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Printer, Download } from 'lucide-react';

const UnitsPage = () => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({
    name: '',
    abbreviation: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editingUnit, setEditingUnit] = useState({
    name: '',
    abbreviation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Format date for display
  const formatCreatedAt = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Fetch units from API
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await unitAPI.getUnits();
      // Extract the units array from the response
      const unitsData = response.content || [];
      setUnits(unitsData);
      setFilteredUnits(unitsData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch units', err);
      setError('Failed to fetch units. Please try again.');
      setUnits([]);
      setFilteredUnits([]);
      toast.error('Failed to fetch units. Please try again.', {
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
      const filtered = units.filter(unit =>
        unit.name.toLowerCase().includes(term) ||
        (unit.abbreviation && unit.abbreviation.toLowerCase().includes(term)))
      setFilteredUnits(filtered);
    } else {
      setFilteredUnits(units);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnit.name.trim() || !newUnit.abbreviation.trim()) {
      setError('Both name and abbreviation are required');
      toast.error('Both name and abbreviation are required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Check if unit already exists
    const unitExists = units.some(
      unit => unit.name.toLowerCase() === newUnit.name.toLowerCase() || 
             unit.abbreviation.toLowerCase() === newUnit.abbreviation.toLowerCase()
    );

    if (unitExists) {
      setError('A unit with this name or abbreviation already exists');
      toast.error('A unit with this name or abbreviation already exists', {
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
      const addedUnit = await unitAPI.addUnit(newUnit);
      setUnits(prevUnits => [...prevUnits, addedUnit]);
      setFilteredUnits(prevUnits => [...prevUnits, addedUnit]);
      setNewUnit({ name: '', abbreviation: '' });
      setShowAddModal(false);
      setError('');
      toast.success('Unit added successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error adding unit:', err);
      setError(err.response?.data?.message || 'Failed to add unit. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to add unit. Please try again.', {
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
    if (!window.confirm('Are you sure you want to delete this unit?')) return;

    setLoading(true);
    try {
      await unitAPI.deleteUnit(id);
      setUnits(prevUnits => prevUnits.filter(unit => unit.id !== id));
      setFilteredUnits(prevUnits => prevUnits.filter(unit => unit.id !== id));
      setError('');
      toast.success('Unit deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError(err.response?.data?.message || 'Failed to delete unit. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to delete unit. Please try again.', {
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

  const startEditing = (unit) => {
    setEditingId(unit.id);
    setEditingUnit({
      name: unit.name,
      abbreviation: unit.abbreviation
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingUnit({ name: '', abbreviation: '' });
  };

  const handleUpdate = async () => {
    if (!editingUnit.name.trim() || !editingUnit.abbreviation.trim()) {
      setError('Both name and abbreviation are required');
      toast.error('Both name and abbreviation are required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Check if another unit already has this name or abbreviation
    const unitExists = units.some(
      unit => unit.id !== editingId && 
             (unit.name.toLowerCase() === editingUnit.name.toLowerCase() || 
              unit.abbreviation.toLowerCase() === editingUnit.abbreviation.toLowerCase())
    );

    if (unitExists) {
      setError('Another unit with this name or abbreviation already exists');
      toast.error('Another unit with this name or abbreviation already exists', {
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
      const updatedUnit = await unitAPI.updateUnit(editingId, editingUnit);
      setUnits(prevUnits => 
        prevUnits.map(unit => unit.id === editingId ? updatedUnit : unit)
      );
      setFilteredUnits(prevUnits => 
        prevUnits.map(unit => unit.id === editingId ? updatedUnit : unit)
      );
      cancelEditing();
      setError('');
      toast.success('Unit updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error updating unit:', err);
      setError(err.response?.data?.message || 'Failed to update unit. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update unit. Please try again.', {
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
          <title>Units List</title>
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
          <h1>Units Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Abbreviation</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUnits.map(unit => `
                <tr>
                  <td>${unit.id}</td>
                  <td>${unit.name}</td>
                  <td>${unit.abbreviation || 'N/A'}</td>
                  <td>${formatCreatedAt(unit.createdAt)}</td>
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
    if (filteredUnits.length === 0) {
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
      filteredUnits.map(unit => ({
        ID: unit.id,
        Name: unit.name,
        Abbreviation: unit.abbreviation,
        'Created At': formatCreatedAt(unit.createdAt)
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Units");
    XLSX.writeFile(workbook, "units.xlsx");
    
    toast.success('Excel export started successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Measurement Units</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExcelDownload}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Export Units"
            >
              <Download size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Print Units"
            >
              <Printer size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Print</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm transition duration-200 text-sm sm:text-base flex items-center justify-center gap-1"
            >
              Add Unit
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search units by name or abbreviation..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm sm:text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Units Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {loading && filteredUnits.length === 0 ? (
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
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abbreviation</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Created At</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.length > 0 ? (
                    filteredUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50 transition">
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-900 font-medium">
                          <div className="text-xs sm:text-sm">{unit.id}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          {editingId === unit.id ? (
                            <input
                              type="text"
                              value={editingUnit.name}
                              onChange={(e) => setEditingUnit({...editingUnit, name: e.target.value})}
                              className="w-full border border-blue-400 px-2 py-1 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              required
                            />
                          ) : (
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{unit.name}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          {editingId === unit.id ? (
                            <input
                              type="text"
                              value={editingUnit.abbreviation}
                              onChange={(e) => setEditingUnit({...editingUnit, abbreviation: e.target.value})}
                              className="w-full border border-blue-400 px-2 py-1 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              required
                            />
                          ) : (
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{unit.abbreviation}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden md:table-cell">
                          <div className="text-xs sm:text-sm">{formatCreatedAt(unit.createdAt)}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium">
                          {editingId === unit.id ? (
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={handleUpdate}
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
                                onClick={() => startEditing(unit)}
                                className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(unit.id)}
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
                        {searchTerm ? 'No units match your search' : 'No units available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Unit</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name *</label>
                <input
                  type="text"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                  placeholder="e.g. Kilograms"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation *</label>
                <input
                  type="text"
                  value={newUnit.abbreviation}
                  onChange={(e) => setNewUnit({...newUnit, abbreviation: e.target.value})}
                  placeholder="e.g. KG"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : 'Add Unit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsPage;