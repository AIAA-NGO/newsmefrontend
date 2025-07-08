import React from 'react';

const ProductGrid = ({ products, onAddToCart }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {products.map(product => (
      <div key={product.id} className="bg-white rounded shadow p-2 hover:shadow-lg">
        <img src={product.image} alt={product.name} className="w-full h-24 object-contain mb-2" />
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-orange-600 font-bold">${product.price}</p>
        <button onClick={() => onAddToCart(product)} className="mt-2 px-3 py-1 bg-green-500 text-white rounded">Add</button>
      </div>
    ))}
  </div>
);

export default ProductGrid;