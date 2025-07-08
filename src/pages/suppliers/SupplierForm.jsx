import React, { useEffect, useState } from 'react';
import { addSupplier } from '../../services/supplierService'; // adjust import based on your structure

const CreateSupplier = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    rating: '',
    categoryIds: []
  });

  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('REACT_APP_API_BASE_URL/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setCategories(data.content || data); // adapt for paged or flat list
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
    setFormData(prev => ({
      ...prev,
      categoryIds: selected
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await addSupplier(formData);
      setSuccess('Supplier created successfully!');
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        rating: '',
        categoryIds: []
      });
    } catch (err) {
      setError(err.message || 'Failed to create supplier');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 shadow-lg rounded-md">
      <h2 className="text-2xl font-bold mb-6">Add Supplier</h2>

      {success && <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">{success}</div>}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company Name *"
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
        <input
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          placeholder="Contact Person *"
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-2 rounded"
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border border-gray-300 p-2 rounded"
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border border-gray-300 p-2 rounded"
        />
        <input
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="Website"
          className="w-full border border-gray-300 p-2 rounded"
        />
        <input
          name="rating"
          type="number"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
          placeholder="Rating"
          className="w-full border border-gray-300 p-2 rounded"
        />

        <label className="block font-medium">Categories</label>
        <select
          multiple
          onChange={handleCategoryChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Save Supplier
        </button>
      </form>
    </div>
  );
};

export default CreateSupplier;
