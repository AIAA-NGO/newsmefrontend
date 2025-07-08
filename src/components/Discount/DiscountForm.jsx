import React, { useState, useEffect } from 'react';
import { createDiscount } from '../../services/discountService';
import { getAllProducts } from '../../services/productServices';

const DiscountForm = () => {
  const [discount, setDiscount] = useState({
    code: '',
    percentage: 10.0,
    validFrom: '',
    validTo: '',
    description: '',
    productIds: []
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (err) {
        setError('Failed to fetch products');
      }
    };
    
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDiscount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSelect = (productId, isChecked) => {
    setDiscount(prev => ({
      ...prev,
      productIds: isChecked 
        ? [...prev.productIds, productId]
        : prev.productIds.filter(id => id !== productId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await createDiscount(discount);
      setSuccess('Discount created and applied successfully!');
      
      // Reset form
      setDiscount({
        code: '',
        percentage: 10.0,
        validFrom: '',
        validTo: '',
        description: '',
        productIds: []
      });
    } catch (err) {
      setError(err.message || 'Failed to create discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Discount</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code *
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={discount.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SUMMER2023"
            />
          </div>
          
          {/* Discount Percentage */}
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage *
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id="percentage"
                name="percentage"
                min="0"
                max="100"
                step="0.1"
                value={discount.percentage}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="10.0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          {/* Valid From */}
          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Valid From *
            </label>
            <input
              type="datetime-local"
              id="validFrom"
              name="validFrom"
              value={discount.validFrom}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Valid To */}
          <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-1">
              Valid To *
            </label>
            <input
              type="datetime-local"
              id="validTo"
              name="validTo"
              value={discount.validTo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={discount.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Summer sale discount"
          />
        </div>
        
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apply to Products *
          </label>
          {products.length === 0 ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {products.map(product => (
                <div key={product.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`product-${product.id}`}
                    checked={discount.productIds.includes(product.id)}
                    onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`product-${product.id}`} className="ml-2 text-sm text-gray-700">
                    {product.name} (ID: {product.id})
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Discount'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;