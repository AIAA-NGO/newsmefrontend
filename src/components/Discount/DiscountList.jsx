import React, { useState, useEffect } from 'react';
import { getAllDiscounts, deleteDiscount } from '../../services/discountService';

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const discountsData = await getAllDiscounts();
        setDiscounts(discountsData);
      } catch (err) {
        setError('Failed to fetch discounts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscounts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id);
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError('Failed to delete discount');
    }
  };

  if (loading) return <div>Loading discounts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Existing Discounts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table headers */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          {/* Table body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {discounts.map(discount => (
              <tr key={discount.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{discount.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discount.percentage}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(discount.validFrom).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(discount.validTo).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{discount.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiscountList;