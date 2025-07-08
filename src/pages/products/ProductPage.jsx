import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Pencil, Trash2, Download, Printer, Save, X } from 'lucide-react';
import { 
  getAllProducts, 
  deleteProduct,
  getCategories,
  getBrands,
  getUnits,
  getSuppliers,
  updateProduct
} from '../../services/productServices';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES'
  }).format(amount || 0);
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [relationships, setRelationships] = useState({
    categories: [],
    brands: [],
    units: [],
    suppliers: []
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    price: 0,
    costPrice: 0,
    quantityInStock: 0,
    lowStockThreshold: 0,
    expiryDate: '',
    categoryId: '',
    brandId: '',
    unitId: '',
    supplierId: '',
    imageFile: null
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [productsData, categoriesData, brandsData, unitsData, suppliersData] = await Promise.all([
          getAllProducts(),
          getCategories(),
          getBrands(),
          getUnits(),
          getSuppliers()
        ]);

        if (isMounted) {
          setRelationships({
            categories: categoriesData,
            brands: brandsData,
            units: unitsData,
            suppliers: suppliersData
          });

          const processedProducts = productsData.map((product) => {
            let imageUrl = null;
            if (product.imageData) {
              const blob = new Blob([new Uint8Array(product.imageData)], { 
                type: product.imageContentType || 'image/jpeg' 
              });
              imageUrl = URL.createObjectURL(blob);
            }
            
            return {
              ...product,
              id: product.id,
              name: product.name || 'Unnamed Product',
              sku: product.sku || 'N/A',
              barcode: product.barcode || 'N/A',
              price: product.price || 0,
              costPrice: product.costPrice || product.cost_price || 0,
              quantityInStock: product.quantityInStock || product.quantity_in_stock || 0,
              lowStockThreshold: product.lowStockThreshold || product.low_stock_threshold || 0,
              expiryDate: product.expiryDate || product.expiry_date || null,
              description: product.description || '',
              imageUrl,
              categoryId: product.categoryId || product.category_id || '',
              brandId: product.brandId || product.brand_id || '',
              unitId: product.unitId || product.unit_id || '',
              supplierId: product.supplierId || product.supplier_id || '',
              categoryName: categoriesData.find(c => c.id === (product.categoryId || product.category_id))?.name || 'N/A',
              brandName: brandsData.find(b => b.id === (product.brandId || product.brand_id))?.name || 'N/A',
              unitName: unitsData.find(u => u.id === (product.unitId || product.unit_id))?.name || 'N/A',
              supplierName: suppliersData.find(s => s.id === (product.supplierId || product.supplier_id))?.name || 'N/A'
            };
          });

          setProducts(processedProducts);
          setFilteredProducts(processedProducts);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Data loading error:', err);
          toast.error('Failed to load product data. Please refresh the page.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    if (location.state?.success) {
      toast.success(location.state.success, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate(location.pathname, { replace: true, state: {} });
      
      if (location.state?.shouldRefresh) {
        fetchData();
      }
    }

    return () => {
      isMounted = false;
      products.forEach(product => {
        if (product.imageUrl) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, [navigate, location]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        (product.barcode && product.barcode.toLowerCase().includes(term))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setFilteredProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Product deleted successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete product. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setViewMode('edit');
    setEditFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      quantityInStock: product.quantityInStock,
      lowStockThreshold: product.lowStockThreshold,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      unitId: product.unitId || '',
      supplierId: product.supplierId || '',
      imageFile: null
    });
    setFormErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setEditFormData({
        ...editFormData,
        [name]: files[0]
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }

    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editFormData.name.trim()) errors.name = 'Name is required';
    if (!editFormData.sku.trim()) errors.sku = 'SKU is required';
    if (!editFormData.price || isNaN(editFormData.price) || editFormData.price <= 0) errors.price = 'Valid price is required';
    if (!editFormData.quantityInStock || isNaN(editFormData.quantityInStock) || editFormData.quantityInStock < 0) errors.quantityInStock = 'Valid quantity is required';
    if (!editFormData.categoryId) errors.categoryId = 'Category is required';
    if (!editFormData.supplierId) errors.supplierId = 'Supplier is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show a small toast for the first error found
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('sku', editFormData.sku);
      formData.append('barcode', editFormData.barcode);
      formData.append('description', editFormData.description);
      formData.append('price', editFormData.price);
      formData.append('costPrice', editFormData.costPrice);
      formData.append('quantityInStock', editFormData.quantityInStock);
      formData.append('lowStockThreshold', editFormData.lowStockThreshold);
      if (editFormData.expiryDate) {
        formData.append('expiryDate', editFormData.expiryDate);
      }
      formData.append('categoryId', editFormData.categoryId);
      if (editFormData.brandId) formData.append('brandId', editFormData.brandId);
      if (editFormData.unitId) formData.append('unitId', editFormData.unitId);
      formData.append('supplierId', editFormData.supplierId);
      if (editFormData.imageFile) {
        formData.append('imageFile', editFormData.imageFile);
      }

      const updatedProduct = await updateProduct(selectedProduct.id, formData);
      
      // Update the products list with the new data
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? { 
          ...p, 
          ...updatedProduct,
          name: updatedProduct.name || p.name,
          sku: updatedProduct.sku || p.sku,
          barcode: updatedProduct.barcode || p.barcode,
          description: updatedProduct.description || p.description,
          price: updatedProduct.price || p.price,
          costPrice: updatedProduct.costPrice || p.costPrice,
          quantityInStock: updatedProduct.quantityInStock || p.quantityInStock,
          lowStockThreshold: updatedProduct.lowStockThreshold || p.lowStockThreshold,
          expiryDate: updatedProduct.expiryDate || p.expiryDate,
          categoryId: updatedProduct.categoryId || p.categoryId,
          brandId: updatedProduct.brandId || p.brandId,
          unitId: updatedProduct.unitId || p.unitId,
          supplierId: updatedProduct.supplierId || p.supplierId,
          imageUrl: updatedProduct.imageUrl || p.imageUrl,
          categoryName: relationships.categories.find(c => c.id === (updatedProduct.categoryId || p.categoryId))?.name || p.categoryName,
          brandName: relationships.brands.find(b => b.id === (updatedProduct.brandId || p.brandId))?.name || p.brandName,
          unitName: relationships.units.find(u => u.id === (updatedProduct.unitId || p.unitId))?.name || p.unitName,
          supplierName: relationships.suppliers.find(s => s.id === (updatedProduct.supplierId || p.supplierId))?.name || p.supplierName
        } : p
      );
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      
      toast.success('Product updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setViewMode(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Brand', 'Price', 'Stock'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        `"${product.sku.replace(/"/g, '""')}"`,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${product.categoryName.replace(/"/g, '""')}"`,
        `"${product.brandName.replace(/"/g, '""')}"`,
        product.price,
        product.quantityInStock
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export started successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Product List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .low-stock { background-color: #fff3cd; }
            .very-low-stock { background-color: #f8d7da; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Product Inventory Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => `
                <tr class="${product.quantityInStock <= product.lowStockThreshold * 0.5 ? 'very-low-stock' : 
                  product.quantityInStock <= product.lowStockThreshold ? 'low-stock' : ''}">
                  <td>${product.sku}</td>
                  <td>${product.name}</td>
                  <td>${product.categoryName}</td>
                  <td>${product.brandName}</td>
                  <td>${formatCurrency(product.price)}</td>
                  <td>${product.quantityInStock} ${product.unitName ? `(${product.unitName})` : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Product Inventory</h1>
          <button
            onClick={() => navigate('/products/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm transition duration-200 text-sm sm:text-base w-full md:w-auto flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </button>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search products by name, SKU or barcode..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm sm:text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Export Products"
            >
              <Download size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded-md shadow-sm transition flex items-center justify-center"
              title="Print Products"
            >
              <Printer size={18} className="text-gray-700" />
              <span className="hidden sm:inline ml-1 text-sm">Print</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center items-center p-8 sm:p-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Brand</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = '';
                                  e.target.parentElement.classList.add('bg-gray-200');
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-900 font-medium">
                          <div className="text-xs sm:text-sm">{product.sku}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{product.name}</div>
                          {product.barcode && (
                            <div className="text-xs text-gray-500">Barcode: {product.barcode}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                          <div className="text-xs sm:text-sm">{product.categoryName}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-gray-500 hidden md:table-cell">
                          <div className="text-xs sm:text-sm">{product.brandName}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium text-gray-900">
                          <div className="text-xs sm:text-sm">{formatCurrency(product.price)}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                          <span className={`inline-flex px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold leading-4 ${
                            product.quantityInStock <= product.lowStockThreshold * 0.5 
                              ? 'bg-red-100 text-red-800' 
                              : product.quantityInStock <= product.lowStockThreshold 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {product.quantityInStock} {product.unitName && `(${product.unitName})`}
                          </span>
                          {product.lowStockThreshold > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">Threshold: {product.lowStockThreshold}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setViewMode('view');
                              }}
                              className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                              title="View"
                            >
                              <Eye size={16} className="sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(product)}
                              className="text-green-600 hover:text-green-800 transition p-1 rounded hover:bg-green-50"
                              title="Edit"
                            >
                              <Pencil size={16} className="sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={16} className="sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No products match your search' : 'No products available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewMode === 'view' && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setViewMode(null)}
                  className="text-gray-400 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-1 md:col-span-2 flex justify-center">
                  <div className="h-40 sm:h-48 md:h-64 w-40 sm:w-48 md:w-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedProduct.imageUrl ? (
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name} 
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Basic Information</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><span className="font-medium">Name:</span> {selectedProduct.name}</p>
                    <p><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
                    <p><span className="font-medium">Barcode:</span> {selectedProduct.barcode || 'N/A'}</p>
                    <p><span className="font-medium">Description:</span> {selectedProduct.description || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Pricing & Inventory</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><span className="font-medium">Price:</span> {formatCurrency(selectedProduct.price)}</p>
                    <p><span className="font-medium">Cost Price:</span> {formatCurrency(selectedProduct.costPrice)}</p>
                    <p><span className="font-medium">In Stock:</span> {selectedProduct.quantityInStock} {selectedProduct.unitName && `(${selectedProduct.unitName})`}</p>
                    <p><span className="font-medium">Low Stock Threshold:</span> {selectedProduct.lowStockThreshold}</p>
                    {selectedProduct.expiryDate && (
                      <p><span className="font-medium">Expiry Date:</span> {new Date(selectedProduct.expiryDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Relationships</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><span className="font-medium">Category:</span> {selectedProduct.categoryName}</p>
                    <p><span className="font-medium">Brand:</span> {selectedProduct.brandName}</p>
                    <p><span className="font-medium">Unit:</span> {selectedProduct.unitName}</p>
                    <p><span className="font-medium">Supplier:</span> {selectedProduct.supplierName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => handleEditClick(selectedProduct)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs sm:text-sm flex items-center gap-1"
                >
                  <Pencil size={14} />
                  Edit Product
                </button>
                <button
                  onClick={() => setViewMode(null)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-xs sm:text-sm flex items-center gap-1"
                >
                  <X size={14} />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {viewMode === 'edit' && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Product</h2>
                <button
                  onClick={() => setViewMode(null)}
                  className="text-gray-400 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm`}
                      required
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={editFormData.sku}
                      onChange={handleEditFormChange}
                      className={`w-full border ${formErrors.sku ? 'border-red-500' : 'border-gray-300'} px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm`}
                      required
                    />
                    {formErrors.sku && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.sku}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <input
                      type="text"
                      name="barcode"
                      value={editFormData.barcode}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                      className={`w-full border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm`}
                      step="0.01"
                      min="0"
                      required
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                    <input
                      type="number"
                      name="costPrice"
                      value={editFormData.costPrice}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Quantity in Stock *</label>
                    <input
                      type="number"
                      name="quantityInStock"
                      value={editFormData.quantityInStock}
                      onChange={handleEditFormChange}
                      className={`w-full border ${formErrors.quantityInStock ? 'border-red-500' : 'border-gray-300'} px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm`}
                      min="0"
                      required
                    />
                    {formErrors.quantityInStock && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.quantityInStock}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={editFormData.lowStockThreshold}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                      min="0"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={editFormData.expiryDate}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="categoryId"
                      value={editFormData.categoryId}
                      onChange={handleEditFormChange}
                      className={`w-full border ${formErrors.categoryId ? 'border-red-500' : 'border-gray-300'} px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm`}
                      required
                    >
                      <option value="">Select Category</option>
                      {relationships.categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.categoryId}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      name="brandId"
                      value={editFormData.brandId}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                    >
                      <option value="">Select Brand</option>
                      {relationships.brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      name="unitId"
                      value={editFormData.unitId}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                    >
                      <option value="">Select Unit</option>
                      {relationships.units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                    <select
                      name="supplierId"
                      value={editFormData.supplierId}
                      onChange={handleEditFormChange}
                      className={`w-full border ${formErrors.supplierId ? 'border-red-500' : 'border-gray-300'} px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm`}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {relationships.suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.supplierId && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.supplierId}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm"
                      rows="3"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <input
                      type="file"
                      name="imageFile"
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*"
                    />
                    {selectedProduct.imageUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                        <img 
                          src={selectedProduct.imageUrl} 
                          alt="Current product" 
                          className="h-20 w-20 object-contain border rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition flex items-center gap-1"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;