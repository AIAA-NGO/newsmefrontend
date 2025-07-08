import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelect }) => (
  <div className="flex gap-2 mb-4 overflow-auto">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`px-3 py-1 rounded ${selectedCategory === cat ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CategoryFilter;
