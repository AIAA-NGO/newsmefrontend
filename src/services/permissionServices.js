import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventorymanagementsystem-latest-37zl.onrender.com/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchAllRoles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles`, getAuthHeader());
    console.log('Roles API response:', response.data);
    return Array.isArray(response.data) ? response.data : response.data.roles || [];
  } catch (error) {
    console.error('Error fetching roles:', error.response?.data || error.message);
    throw error;
  }
};

export const assignRolePermissions = async (roleId, permissionNames) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/role-permissions/assign`,
      {
        roleId: roleId,
        permissionNames: permissionNames
      },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning permissions:', error);
    throw error;
  }
};

export const fetchAllPermissions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/permissions`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching all permissions:', error);
    throw error;
  }
};

export const getDefaultPermissionsForRole = (roleName) => {
  const defaultPermissions = {
    ADMIN: [
      'dashboard_access',
      'product_view', 'product_create',
      'category_view', 'brand_view', 'unit_view',
      'pos_access', 'supplier_view', 'customer_view',
      'user_view', 'user_create', 'user_update',
      'purchase_view', 'purchase_create', 'purchase_update',
      'sale_view', 'sale_return', 'discount_apply',
      'salesreports_view','productsreports_view','inventoryreports_view','financialreports_view','suppliersreports_view','finance_view', 'settings_manage',
      'role_manage', 'role_create',
      'inventory_view'
    ],
    MANAGER: [
      'dashboard_access',
      'category_view', 'product_view',
      'sale_view', 'sale_return',
      'purchase_view', 'inventory_view',
      'salesreports_view','productsreports_view','inventoryreports_view','financialreports_view','suppliersreports_view','finance_view',
    ],
    CASHIER: [
      'dashboard_access',
      'customer_view', 'product_view',
      'sale_view', 'sale_return',
      'pos_access'
    ],
    RECEIVING_CLERK:[
      'product_view', 'product_create',
      'category_view', 'brand_view', 'unit_view',
      'purchase_view', 'purchase_create',
      'purchase_update', 'inventory_view','supplier_view','user_view', 'user_create', 'user_update', 'user_create', 'user_update',
      'inventoryreports_view','financialreports_view','suppliersreports_view', 'settings_manage','role_manage','role_create',
    ]
  };

  return defaultPermissions[roleName?.toUpperCase()] || [];
};