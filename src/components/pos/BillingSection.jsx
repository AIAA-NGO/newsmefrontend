import React, { useRef } from 'react';
import { placeOrder } from '../../api/orders';
import { useReactToPrint } from 'react-to-print';

export default function BillingSection({ cart, updateQuantity, removeItem, clearCart }) {
  const receiptRef = useRef();

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    const orderData = {
      items: cart,
      total: totalAmount,
      createdAt: new Date().toISOString(),
    };

    const res = await placeOrder(orderData);
    alert(res.message);

    if (res.status === 200) {
      clearCart();
      localStorage.removeItem('pos_cart');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  return (
    <div className="bg-white p-4 shadow rounded space-y-3">
      <h3 className="text-lg font-bold">Cart</h3>

      <div className="max-h-64 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-sm text-gray-500">Cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b py-2 text-sm">
              <span>{item.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)} className="text-red-500">x</button>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="border-t pt-2 text-sm">
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>Ksh {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-4">
        <button onClick={clearCart} className="bg-gray-300 px-3 py-1 text-sm rounded">Clear</button>
        <button onClick={handlePlaceOrder} className="bg-green-600 text-white px-3 py-1 text-sm rounded">
          Place Order
        </button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">
          Print
        </button>
      </div>

      {/* Hidden printable receipt */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef} className="p-4 text-sm w-[300px]">
          <h2 className="text-center font-bold text-lg mb-2">RECEIPT</h2>
          <p>Date: {new Date().toLocaleString()}</p>
          <hr />
          {cart.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x{item.quantity}</span>
              <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between font-bold mt-2">
            <span>Total:</span>
            <span>Ksh {totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-center mt-4">Thank you!</p>
        </div>
      </div>
    </div>
  );
}
