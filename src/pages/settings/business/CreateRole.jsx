import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchRoles, createRole } from '../../../services/rolesServices';

const CreateRole = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRoles, setExistingRoles] = useState([]);
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExistingRoles = async () => {
      try {
        const roles = await fetchRoles();
        setExistingRoles(roles);
      } catch (error) {
        toast.error('Failed to load existing roles');
        console.error('Error loading roles:', error);
      } finally {
        setFetchingRoles(false);
      }
    };

    loadExistingRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const roleName = name.trim();
    
    if (existingRoles.some(role => role.name.toLowerCase() === roleName.toLowerCase())) {
      toast.error('Role already exists');
      return;
    }

    setLoading(true);

    try {
      const response = await createRole({ name: roleName });
      toast.success('Role created successfully');
      navigate(`/settings/roles/${response.id}/permissions`);
    } catch (error) {
      if (error.message.includes('already exists') || error.response?.status === 409) {
        toast.error('Role already exists');
      } else {
        toast.error(error.message || 'Failed to create role');
        console.error('Error creating role:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Create New Role</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Role Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter role name (e.g., ADMIN, MANAGER)"
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/settings/roles')}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRole;