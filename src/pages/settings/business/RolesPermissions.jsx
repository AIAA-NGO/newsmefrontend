import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const PermissionManagement = () => {
  const {
    allRoles,
    allPermissions,
    loading,
    rolesLoaded,
    updateRolePermissions,
    getDefaultPermissionsForRole,
    loadRolesAndPermissions,
    hasPermission
  } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [error, setError] = useState(null);

  const permissionCategories = [
    { name: 'Dashboard', permissions: ['dashboard_access'] },
    { name: 'Customer', permissions: ['customer_view'] },
    { name: 'Supplier', permissions: ['supplier_view'] },
    { name: 'Product', permissions: ['product_view', 'product_create'] },
    { name: 'Brand', permissions: ['brand_view'] },
    { name: 'Category', permissions: ['category_view'] },
    { name: 'Unit', permissions: ['unit_view'] },
    { name: 'Sale', permissions: ['sale_view', 'sale_return'] },
    { name: 'Purchase', permissions: ['purchase_view', 'purchase_create', 'purchase_update'] },
    { name: 'Report', permissions: [ 'salesreports_view','productsreports_view','inventoryreports_view','financialreports_view','suppliersreports_view','finance_view', 'settings_manage',
    ] },
    { name: 'Role', permissions: ['role_manage'] },
    { name: 'User', permissions: ['user_view', 'user_create', 'user_update'] },
    { name: 'Settings', permissions: ['settings_manage'] },
    { name: 'Inventory', permissions: ['inventory_view'] },
    { name: 'POS', permissions: ['pos_access'] },
    { name: 'Discount', permissions: ['discount_apply'] }
  ];

  useEffect(() => {
    if (!rolesLoaded) {
      loadRolesAndPermissions();
    }
  }, [rolesLoaded, loadRolesAndPermissions]);

  useEffect(() => {
    if (selectedRole) {
      const loadPermissions = async () => {
        try {
          const role = allRoles.find(r => r.id === selectedRole);
          if (!role) return;
          
          const allPermissionNames = permissionCategories.flatMap(cat => cat.permissions);
          const initialPermissions = Object.fromEntries(
            allPermissionNames.map(perm => [perm, false])
          );
          
          const rolePerms = getDefaultPermissionsForRole(role.name);
          rolePerms.forEach(perm => {
            initialPermissions[perm] = true;
          });
          
          setRolePermissions(initialPermissions);
        } catch (error) {
          setError(`Failed to load permissions for role`);
          console.error('Permission load error:', error);
        }
      };

      loadPermissions();
    }
  }, [selectedRole, allRoles]);

  const applyDefaultPermissions = async () => {
    if (!selectedRole) return;
    
    try {
      const role = allRoles.find(r => r.id === selectedRole);
      if (!role) return;
      
      const defaultPermissions = getDefaultPermissionsForRole(role.name);
      
      const newPermissions = {};
      Object.keys(rolePermissions).forEach(perm => {
        newPermissions[perm] = defaultPermissions.includes(perm);
      });
      
      setRolePermissions(newPermissions);
      toast.success(`Loaded default permissions for ${role.name}`);
    } catch (error) {
      toast.error('Failed to load default permissions');
      console.error(error);
    }
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      const enabledPermissions = Object.entries(rolePermissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      
      const success = await updateRolePermissions(selectedRole, enabledPermissions);
      if (success) {
        toast.success('Permissions saved successfully!');
        loadRolesAndPermissions();
      }
    } catch (error) {
      toast.error('Failed to save permissions');
      console.error('Save error:', error);
    }
  };

  const togglePermission = (permission) => {
    setRolePermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const toggleCategory = (category, enable) => {
    setRolePermissions(prev => {
      const newPermissions = {...prev};
      category.permissions.forEach(perm => {
        newPermissions[perm] = enable;
      });
      return newPermissions;
    });
  };

  if (!hasPermission('role_manage')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You don't have permission to manage role permissions.</p>
        </div>
      </div>
    );
  }

  if (loading && !rolesLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading roles...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Role Permissions</h1>
          <p className="text-blue-100">Manage permissions for each role</p>
        </div>

        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
                disabled={loading}
              >
                <option value="">Select a role</option>
                {allRoles.length > 0 ? (
                  allRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                ) : (
                  <option disabled>No roles available</option>
                )}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={applyDefaultPermissions}
                disabled={loading || !selectedRole}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Load Defaults
              </button>
              <button
                onClick={savePermissions}
                disabled={loading || !selectedRole}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!selectedRole ? (
            <div className="text-center py-8 text-gray-500">
              Please select a role to manage permissions
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {permissionCategories.map(category => {
                const allEnabled = category.permissions.every(perm => rolePermissions[perm]);
                const someEnabled = category.permissions.some(perm => rolePermissions[perm]);
                
                return (
                  <div key={category.name} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-200 px-4 py-2 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleCategory(category, true)}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          All
                        </button>
                        <button
                          onClick={() => toggleCategory(category, false)}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                        >
                          None
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {category.permissions.map(permission => (
                        <div key={permission} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span 
                              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                rolePermissions[permission] ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            ></span>
                            <span className="text-sm text-gray-700">
                              {permission.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={rolePermissions[permission] || false}
                              onChange={() => togglePermission(permission)}
                              disabled={loading}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;