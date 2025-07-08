import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addProduct, getCategories, getBrands, getUnits, getSuppliers } from '../../services/productServices';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: '',
    costPrice: '',
    quantityInStock: '0',
    lowStockThreshold: '10',
    supplierId: '',
    categoryId: '',
    brandId: '',
    unitId: '',
    expiryDate: '',
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [cat, brand, unit, supp] = await Promise.all([
          getCategories(),
          getBrands(),
          getUnits(),
          getSuppliers(),
        ]);
        setCategories(cat || []);
        setBrands(brand || []);
        setUnits(unit || []);
        setSuppliers(supp || []);
      } catch (err) {
        console.error('Error loading dropdowns:', err);
        setError('Failed to load dropdowns. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdowns();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.sku?.trim()) errors.sku = 'SKU is required';
    if (!formData.supplierId) errors.supplierId = 'Supplier is required';
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (!formData.unitId) errors.unitId = 'Unit is required';
    if (!formData.price || isNaN(formData.price)) errors.price = 'Valid price is required';
    if (formData.price && parseFloat(formData.price) <= 0) errors.price = 'Price must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Create the product request object
      const productRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || null,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        quantityInStock: parseInt(formData.quantityInStock, 10) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
        supplierId: parseInt(formData.supplierId, 10),
        categoryId: parseInt(formData.categoryId, 10),
        brandId: formData.brandId ? parseInt(formData.brandId, 10) : null,
        unitId: parseInt(formData.unitId, 10),
        expiryDate: formData.expiryDate || null
      };

      // Add the request as a JSON blob
      formDataToSend.append('request', new Blob([JSON.stringify(productRequest)], {
        type: 'application/json'
      }));

      // Add the image file if it exists
      if (imageFile) {
        formDataToSend.append('imageFile', imageFile);
      }

      const response = await addProduct(formDataToSend);

      navigate('/products', {
        state: {
          success: `Product "${response.name}" created successfully!`,
          shouldRefresh: true
        }
      });
    } catch (err) {
      console.error('Error creating product:', err);
      
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.field] = error.message || error.defaultMessage;
        });
        setFormErrors(backendErrors);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create product. Please check your data and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (name, label, type = 'text', required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className={`w-full border ${formErrors[name] ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={isLoading}
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className={`w-full border ${formErrors[name] ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={isLoading}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' && name.includes('Price') ? '0.01' : '1'}
        />
      )}
      {formErrors[name] && <p className="mt-1 text-sm text-red-600">{formErrors[name]}</p>}
    </div>
  );

  const renderDropdown = (name, label, options, required = false) => {
    const getOptionLabel = (opt) => {
      if (label === 'Supplier') {
        return opt.companyName || `Supplier ${opt.id}`;
      }
      return opt.name || opt.companyName || `Supplier ${opt.id}`;
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className={`w-full border ${formErrors[name] ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={isLoading || options.length === 0}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {getOptionLabel(opt)}{opt.abbreviation ? ` (${opt.abbreviation})` : ''}
            </option>
          ))}
        </select>
        {formErrors[name] && <p className="mt-1 text-sm text-red-600">{formErrors[name]}</p>}
        {options.length === 0 && !isLoading && (
          <p className="mt-1 text-sm text-red-600">
            No {label.toLowerCase()} found. <Link to={`/${label.toLowerCase()}s/create`} className="text-blue-600 underline">Create one</Link>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Product</h1>
        <Link to="/products" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
          Back to Products
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderInput('name', 'Product Name', 'text', true)}
            {renderInput('sku', 'SKU', 'text', true)}
            {renderInput('barcode', 'Barcode')}
            {renderInput('description', 'Description', 'textarea')}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                <img 
                  src={imagePreview}
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div>
            {renderInput('price', 'Selling Price', 'number', true)}
            {renderInput('costPrice', 'Cost Price', 'number')}
            {renderInput('quantityInStock', 'Initial Stock', 'number')}
            {renderInput('lowStockThreshold', 'Low Stock Threshold', 'number')}
            {renderInput('expiryDate', 'Expiry Date', 'date')}
            {renderDropdown('categoryId', 'Category', categories, true)}
            {renderDropdown('brandId', 'Brand', brands)}
            {renderDropdown('unitId', 'Unit', units, true)}
            {renderDropdown('supplierId', 'Supplier', suppliers, true)}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} flex items-center`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}