import React, { useEffect, useState, useCallback } from 'react';
import { FiShoppingCart, FiRefreshCw, FiAlertCircle, FiSearch, FiPlus, FiMinus } from 'react-icons/fi';
import { BsCartPlus, BsStarFill, BsStarHalf, BsStar } from 'react-icons/bs';
import { getAllProducts, getCategories } from '../../services/productServices';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, cartQuantity }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.quantity_in_stock) return;
    setQuantity(newQuantity);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<BsStarFill key={i} className="text-yellow-400 text-xs" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<BsStarHalf key={i} className="text-yellow-400 text-xs" />);
      } else {
        stars.push(<BsStar key={i} className="text-yellow-400 text-xs" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative pb-[100%] bg-gray-100">
        {!imageError && product.imageUrl ? (
          <img
            src={product.imageUrl.startsWith('/images/products/') ? product.imageUrl : `/images/products/${product.imageUrl}`}
            alt={product.name}
            className="absolute h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">No Image</span>
          </div>
        )}
        
        {/* Stock Badge */}
        {product.quantity_in_stock <= 0 ? (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Sold Out
          </div>
        ) : product.quantity_in_stock < 10 ? (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Low Stock
          </div>
        ) : null}
        
        {/* Quick Add Button */}
        {product.quantity_in_stock > 0 && (
          <button
            onClick={() => addToCart(product, quantity)}
            className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
            aria-label="Add to cart"
          >
            <BsCartPlus className="text-lg" />
          </button>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3 flex-grow flex flex-col">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-gray-500 text-xs mt-1">{product.brand}</p>
          )}
        </div>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex mr-1">
              {renderRatingStars(product.rating)}
            </div>
            <span className="text-gray-500 text-xs">({product.reviewCount || 0})</span>
          </div>
        )}
        
        <div className="mt-auto">
          {/* Price - Only showing unit price now */}
          <div className="mb-2">
            <p className="text-green-600 font-bold">
              Ksh {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          {/* Stock & Cart Info */}
          <div className="flex justify-between items-center text-xs mb-2">
            <span className={`px-2 py-1 rounded-full ${
              product.quantity_in_stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.quantity_in_stock > 0 ? 
                `${product.quantity_in_stock} in stock` : 
                'Out of stock'}
            </span>
            
            {cartQuantity > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {cartQuantity} in cart
              </span>
            )}
          </div>
          
          {/* Quantity Selector */}
          {product.quantity_in_stock > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                >
                  <FiMinus className="text-sm" />
                </button>
                <span className="px-2 py-1 text-sm">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.quantity_in_stock}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                >
                  <FiPlus className="text-sm" />
                </button>
              </div>
              
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex items-center justify-center px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <BsCartPlus className="mr-1" />
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1 rounded-lg text-sm ${
            !selectedCategory 
              ? 'bg-blue-600 text-white shadow' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="py-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div className="pb-[100%] bg-gray-200"></div>
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="bg-red-100 p-3 rounded-full mb-3">
      <FiAlertCircle className="text-red-500 text-2xl" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to load products</h3>
    <p className="text-gray-600 mb-4 max-w-md">{error}</p>
    <button
      onClick={onRetry}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
    >
      <FiRefreshCw />
      <span>Try Again</span>
    </button>
  </div>
);

const EmptyState = ({ selectedCategory }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="bg-blue-100 p-3 rounded-full mb-3">
      <FiShoppingCart className="text-blue-500 text-2xl" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-2">
      {selectedCategory ? 'No products in this category' : 'No products available'}
    </h3>
    <p className="text-gray-600 max-w-md">
      {selectedCategory
        ? 'Try selecting a different category or check back later'
        : 'Our inventory is currently empty. Please check back soon.'}
    </p>
  </div>
);

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useCart();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodResponse, catData] = await Promise.all([
        getAllProducts(),
        getCategories(),
      ]);
      
      // Extract products array from the response
      let productsArray = [];
      if (Array.isArray(prodResponse)) {
        productsArray = prodResponse;
      } else if (prodResponse && typeof prodResponse === 'object') {
        // Handle different response formats
        if (Array.isArray(prodResponse.content)) {
          productsArray = prodResponse.content;
        } else if (Array.isArray(prodResponse.data)) {
          productsArray = prodResponse.data;
        } else if (Array.isArray(prodResponse.products)) {
          productsArray = prodResponse.products;
        }
      }

      if (!Array.isArray(productsArray)) {
        throw new Error('Invalid products data format');
      }

      const processedProducts = productsArray.map(product => ({
        ...product,
        price: Number(product.price),
        costPrice: product.costPrice ? Number(product.costPrice) : null,
        quantity_in_stock: product.quantityInStock || product.quantity_in_stock || 0,
        category_id: product.categoryId || product.category_id,
        imageUrl: product.imageUrl ? 
          (product.imageUrl.startsWith('/images/products/') ? 
            product.imageUrl : 
            `/images/products/${product.imageUrl}`) 
          : null
      }));
      
      setProducts(processedProducts);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load products. Please try again.');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = products.filter(product => {
    const categoryMatch = !selectedCategory || product.category_id === selectedCategory;
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, SKU or barcode..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchData} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState selectedCategory={selectedCategory} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => {
              const cartItem = cart.items.find(item => item.id === product.id);
              const cartQuantity = cartItem ? cartItem.quantity : 0;
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartQuantity={cartQuantity}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}