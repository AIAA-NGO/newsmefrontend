import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  // Fetch cart from backend on initial load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await cartService.getCart();
        setCart(cartData);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };
    fetchCart();
  }, []);

  const syncWithBackend = async () => {
    try {
      const updatedCart = await cartService.getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const item = {
        productId: product.id,
        quantity,
        price: product.price,
        discountPercentage: product.discountPercentage || 0
      };
      await cartService.addItemsToCart([item]);
      await syncWithBackend();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await cartService.updateCartItemQuantity(productId, newQuantity);
      await syncWithBackend();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartService.removeItemFromCart(productId);
      await syncWithBackend();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const applyDiscount = async (discountCode) => {
    try {
      await cartService.applyDiscount(discountCode);
      await syncWithBackend();
    } catch (error) {
      console.error('Failed to apply discount:', error);
      throw error;
    }
  };

  const checkout = async (checkoutData) => {
    try {
      const result = await cartService.checkout(checkoutData);
      setCart({
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0
      });
      return result;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      removeFromCart,
      applyDiscount,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};