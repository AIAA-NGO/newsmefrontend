// src/components/filters/PurchaseFilter.jsx

import React from 'react';

const PurchaseFilter = ({ filter, setFilter }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search sales..."
        className="px-4 py-2 border rounded-md w-full"
      />
    </div>
  );
};

export default PurchaseFilter;
