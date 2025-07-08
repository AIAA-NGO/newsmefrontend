// src/services/authService.js
import { ROLE_PERMISSIONS } from '../constants/permissions';

export const getCurrentUserRole = () => {
  return localStorage.getItem('userRole');
};

export const hasPermission = (requiredPermission) => {
  const role = getCurrentUserRole();
  if (!role) return false;
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(requiredPermission);
};

export const checkPermission = (requiredPermission) => {
  if (!hasPermission(requiredPermission)) {
    throw new Error(`Missing required permission: ${requiredPermission}`);
  }
};