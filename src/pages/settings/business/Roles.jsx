import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchRoles, deleteRole, updateRole } from '../../../services/rolesServices';
import Modal from '../../../components/Modal';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const data = await fetchRoles();
        setRoles(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load roles');
        toast.error(err.message || 'Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await deleteRole(id);
        toast.success('Role deleted successfully');
        setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
      } catch (err) {
        toast.error(err.message || 'Failed to delete role');
      }
    }
  };

  const handleEditClick = (role) => {
    setCurrentRole(role);
    setEditName(role.name);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedRole = await updateRole(currentRole.id, { name: editName });
      toast.success('Role updated successfully');
      setRoles(prevRoles =>
        prevRoles.map(role => (role.id === currentRole.id ? updatedRole : role))
      );
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Role: ${currentRole?.name}`}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Roles Management</h1>
          <p className="text-gray-600 mt-1">Manage and organize system roles</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search roles..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link
            to="/roles/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-center transition duration-200"
          >
            Create New Role
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="font-medium">{role.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-3">
                      <button
                        onClick={() => handleEditClick(role)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1.5 rounded-md transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded-md transition duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-4 text-gray-500 font-medium">
                        {searchTerm ? 'No roles match your search' : 'No roles found'}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/roles/create"
                          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first role
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolesList;