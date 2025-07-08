// src/pages/Pos/PosWithCart.js
import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import PosPage from './PosPage';
import Cart from '../Cart/cart';
import { CartProvider } from '../../context/CartContext';

const PosWithCart = () => {
  const [showCart, setShowCart] = useState(false);

  return (
    <CartProvider>
      <div className="flex font-sans bg-gray-100 min-h-screen">
        {/* Mobile Cart Toggle Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCart(!showCart)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
            aria-label={showCart ? "Hide cart" : "Show cart"}
          >
            <FaShoppingCart className="text-lg" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {/* Cart item count would go here */}
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 p-4 gap-4">
          {/* Products Section */}
          <div className={`${showCart ? 'hidden lg:block lg:w-3/5' : 'block w-full lg:w-3/5'}`}>
            <PosPage />
          </div>
          
          {/* Cart Section */}
          <div className={`${showCart ? 'block w-full lg:w-2/5' : 'hidden lg:block lg:w-2/5'}`}>
            <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
              <Cart onCloseCart={() => setShowCart(false)} />
            </div>
          </div>
        </div>
      </div>
    </CartProvider>
  );
};

export default PosWithCart;