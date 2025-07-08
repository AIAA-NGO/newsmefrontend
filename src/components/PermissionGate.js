// src/components/PermissionGate.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PermissionGate = ({ children, requiredPermissions, fallback = null }) => {
  const { user } = useContext(AuthContext);

  const hasPermission = requiredPermissions.some(perm => 
    user?.permissions?.includes(perm)
  );

  return hasPermission ? children : fallback;
};

export default PermissionGate;