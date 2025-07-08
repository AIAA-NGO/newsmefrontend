import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  fetchAllRoles,
  fetchRolePermissions,
  assignRolePermissions,
  fetchAllPermissions,
  getDefaultPermissionsForRole
} from '../services/permissionServices';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true); // Changed to true initially
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const rolePermissions = useMemo(() => ({
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
      
    ],
    CASHIER: [
      'dashboard_access',
      'customer_view', 'product_view',
      'sale_view', 'sale_return',
      'pos_access'
    ],
    RECEIVING_CLERK: [
      'product_view', 'product_create',
      'category_view', 'brand_view', 'unit_view',
      'purchase_view', 'purchase_create',
      'purchase_update', 'inventory_view','supplier_view','user_view', 'user_create', 'user_update', 'user_create', 'user_update',
      'inventoryreports_view','financialreports_view','suppliersreports_view', 'settings_manage','role_manage','role_create',
    ]
  }), []);

  const loadRolesAndPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        fetchAllRoles(),
        fetchAllPermissions()
      ]);
      setAllRoles(rolesData);
      setAllPermissions(permissionsData);
      setRolesLoaded(true);
    } catch (error) {
      console.error('Failed to load roles and permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissionsFromRoles = useCallback((roles) => {
    return roles.flatMap(role => rolePermissions[role] || []);
  }, [rolePermissions]);

  const hasPermission = useCallback((requiredPermission) => {
    if (!user) return false;
    return user.permissions?.includes(requiredPermission);
  }, [user]);

  const updateRolePermissions = useCallback(async (roleId, permissionNames) => {
    try {
      setLoading(true);
      await assignRolePermissions(roleId, permissionNames);
      if (user?.roles.some(role => role.id === roleId)) {
        const updatedPermissions = getPermissionsFromRoles(user.roles);
        setUser(prev => ({ ...prev, permissions: updatedPermissions }));
      }
      return true;
    } catch (error) {
      console.error('Failed to update role permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, getPermissionsFromRoles]);

  const login = (authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userName', authData.name || authData.username);
    localStorage.setItem('userRoles', JSON.stringify(authData.roles)); // Store roles
    const permissions = getPermissionsFromRoles(authData.roles);
    setUser({
      id: authData.id,
      username: authData.username,
      name: authData.name || authData.username,
      email: authData.email,
      roles: authData.roles,
      permissions,
      token: authData.token
    });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRoles');
    setUser(null);
    setAllRoles([]);
    setAllPermissions([]);
    setRolesLoaded(false);
  }, []);

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Check token expiration
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        // Try to get roles from localStorage first
        const storedRoles = JSON.parse(localStorage.getItem('userRoles')) || decoded.roles || [];
        const permissions = getPermissionsFromRoles(storedRoles);
        
        setUser({
          id: decoded.id,
          username: decoded.sub,
          name: decoded.name || decoded.sub,
          email: decoded.email,
          roles: storedRoles,
          permissions,
          token
        });

        // Load fresh roles and permissions in background
        await loadRolesAndPermissions();
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      }
    }
    setLoading(false);
  }, [getPermissionsFromRoles, logout, loadRolesAndPermissions]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const value = {
    user,
    allRoles,
    allPermissions,
    loading,
    rolesLoaded,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    updateRolePermissions,
    getDefaultPermissionsForRole,
    loadRolesAndPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};