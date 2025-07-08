// hooks/usePermissions.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);
  
  const hasPermission = (requiredPermission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(requiredPermission);
  };
  
  return { hasPermission };
};