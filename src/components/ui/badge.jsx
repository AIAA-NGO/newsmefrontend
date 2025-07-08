import React from 'react';

export const Badge = ({ children, className }) => {
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded ${className}`}>
      {children}
    </span>
  );
};
