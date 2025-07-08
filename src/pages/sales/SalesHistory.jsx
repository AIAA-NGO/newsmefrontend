import React, { useEffect, useState } from 'react';
import { getSales } from '../../services/salesService';



export default function SalesHistory() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    setSales(getSales());
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Sales History</h2>
      {sales.length === 0 ? (
        <p>No sales recorded yet.</p>
      ) : (
        sales.map((sale) => (
          <div key={sale.sale_id} className="mb-4 border p-4 rounded shadow">
            <p><strong>Date:</strong> {new Date(sale.timestamp).toLocaleString()}</p>
            <p><strong>Cashier:</strong> {sale.cashierName}</p>
            <p><strong>Customer:</strong> {sale.customerName}</p>
            <p><strong>Total:</strong> Ksh {sale.total.toFixed(2)}</p>
            <p><strong>Payment:</strong> {sale.paymentMethod}</p>
            <ul className="ml-4 mt-2 list-disc">
              {sale.cart.map(item => (
                <li key={item.product_id}>
                  {item.product_name} - {item.qty} x Ksh {item.product_price}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
