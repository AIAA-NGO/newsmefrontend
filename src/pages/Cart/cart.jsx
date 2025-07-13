import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaSpinner } from 'react-icons/fa';
import { MdCheckCircle, MdError, MdPending } from 'react-icons/md';

const Cart = ({ onCloseCart }) => {
  const { cart, updateQuantity, removeFromCart, checkout } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [checkoutError, setCheckoutError] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      setCheckoutError(null);
      
      const checkoutData = {
        customerId: null, // You would get this from your customer selection
        paymentMethod,
        mpesaNumber: paymentMethod === 'MPESA' ? mpesaNumber : null
      };

      await checkout(checkoutData);
      
      // Show success message or redirect
      alert('Checkout successful!');
      
    } catch (error) {
      setCheckoutError(error.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart-container">
      {/* Cart header */}
      <div className="cart-header">
        <h2>Cart</h2>
        <button onClick={onCloseCart}>×</button>
      </div>

      {/* Cart items */}
      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.productId} className="cart-item">
            <div className="item-info">
              <h4>{item.productName}</h4>
              <p>Ksh {item.price.toFixed(2)} × {item.quantity}</p>
            </div>
            <div className="item-actions">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              <button onClick={() => removeFromCart(item.productId)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart summary */}
      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>Ksh {cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Discount:</span>
          <span>Ksh {cart.discount.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (16%):</span>
          <span>Ksh {cart.tax.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>Ksh {cart.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="payment-method">
        <h3>Payment Method</h3>
        <div className="method-options">
          <button 
            className={paymentMethod === 'CASH' ? 'active' : ''}
            onClick={() => setPaymentMethod('CASH')}
          >
            <FaMoneyBillWave /> Cash
          </button>
          <button 
            className={paymentMethod === 'MPESA' ? 'active' : ''}
            onClick={() => setPaymentMethod('MPESA')}
          >
            <FaMobileAlt /> M-Pesa
          </button>
        </div>

        {paymentMethod === 'MPESA' && (
          <div className="mpesa-input">
            <label>M-Pesa Number</label>
            <input
              type="text"
              placeholder="07XXXXXXXX"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Checkout button */}
      <button 
        className="checkout-button"
        onClick={handleCheckout}
        disabled={isCheckingOut || cart.items.length === 0}
      >
        {isCheckingOut ? (
          <>
            <FaSpinner className="spinner" /> Processing...
          </>
        ) : (
          `Checkout Ksh ${cart.total.toFixed(2)}`
        )}
      </button>

      {checkoutError && (
        <div className="error-message">
          <MdError /> {checkoutError}
        </div>
      )}
    </div>
  );
};

export default Cart;