import React from 'react';

const SearchBar = ({ value, onChange }) => (
  <div className="mb-4">
    <input
      type="text"
      placeholder="Search product..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    />
  </div>
);

export default SearchBar;