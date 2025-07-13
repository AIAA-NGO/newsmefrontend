import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getCartFromStorage = () => {
    if (!user) return getEmptyCart();
    
    const userCartKey = `cart_${user.id}`;
    const cartData = sessionStorage.getItem(userCartKey);
    return cartData ? JSON.parse(cartData) : getEmptyCart();
  };

  const getEmptyCart = () => ({
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  const saveCartToStorage = (cart) => {
    if (user) {
      const userCartKey = `cart_${user.id}`;
      sessionStorage.setItem(userCartKey, JSON.stringify(cart));
    }
  };

const calculateCartTotals = (items) => {
  // Calculate subtotal (tax-exclusive)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount
  const discount = items.reduce((sum, item) => sum + ((item.discountAmount || 0) * item.quantity), 0);
  
  // Calculate taxable amount (subtotal - discount)
  const taxableAmount = subtotal - discount;
  
  // Calculate tax (16% of taxable amount)
  const tax = taxableAmount * 0.16;
  
  // Calculate total (taxable amount + tax)
  const total = taxableAmount + tax;
  
  return { 
    preTaxAmount: parseFloat(subtotal.toFixed(2)), // Same as subtotal in this case
    subtotal: parseFloat(taxableAmount.toFixed(2)), // Shows as "Subtotal (tax exclusive)"
    discount: parseFloat(discount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

  const [cart, setCart] = useState(getEmptyCart());

  // Update cart when user changes
  useEffect(() => {
    setCart(getCartFromStorage());
  }, [user]);

  const updateCart = (newCart) => {
    const cartWithTotals = {
      ...newCart,
      ...calculateCartTotals(newCart.items)
    };
    setCart(cartWithTotals);
    saveCartToStorage(cartWithTotals);
  };

  const addToCart = (product, quantity = 1) => {
    const productStock = product.quantity_in_stock || 0;
    const existingItem = cart.items.find(item => item.id === product.id);

    if (productStock < 1) return;

    const discountAmount = product.discountPercentage 
      ? (product.price * product.discountPercentage / 100)
      : 0;

    let updatedItems;
    if (existingItem) {
      if (existingItem.quantity + quantity > productStock) {
        return;
      }
      updatedItems = cart.items.map(item => 
        item.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + quantity,
              discountPercentage: product.discountPercentage,
              discountAmount
            }
          : item
      );
    } else {
      updatedItems = [
        ...cart.items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          discountPercentage: product.discountPercentage,
          discountAmount,
          imageUrl: product.hasImage ? `/api/products/${product.id}/image` : null,
          stock: product.quantity_in_stock,
          sku: product.sku || '',
          barcode: product.barcode || ''
        }
      ];
    }

    updateCart({
      items: updatedItems
    });
  };

  const removeFromCart = (id) => {
    const updatedItems = cart.items.filter(item => item.id !== id);
    updateCart({
      items: updatedItems
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    
    const updatedItems = cart.items.map(item => {
      if (item.id === id) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    updateCart({
      items: updatedItems
    });
  };

  const clearCart = () => {
    const emptyCart = getEmptyCart();
    setCart(emptyCart);
    saveCartToStorage(emptyCart);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};