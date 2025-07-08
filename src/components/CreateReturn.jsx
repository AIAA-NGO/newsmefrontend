// src/pages/returns/CreateReturn.jsx

import React, { useState } from "react";
import axios from "axios";

const CreateReturn = () => {
  const [orderId, setOrderId] = useState("");
  const [productId, setProductId] = useState("");
  const [qtyReturned, setQtyReturned] = useState(0);
  const [returnReason, setReturnReason] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/returns", {
        orderId,
        productId,
        qtyReturned,
        returnReason,
      });
      setMessage(res.data);
    } catch (err) {
      setMessage("Error processing return");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Return Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID"
          className="border p-2 w-full"
          required
        />
        <input
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Product Name"
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          value={qtyReturned}
          onChange={(e) => setQtyReturned(e.target.value)}
          placeholder="Quantity to Return"
          className="border p-2 w-full"
          required
        />
        <input
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          placeholder="Reason for Return"
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Return
        </button>
        <p className="text-sm mt-2">{message}</p>
      </form>
    </div>
  );
};

export default CreateReturn;
