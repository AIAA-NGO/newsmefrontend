// /components/ProductRestockModal.jsx
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../ui/button';


export default function ProductRestockModal({ isOpen, onClose, onRestock, product }) {
  const [qty, setQty] = useState(0);

  const handleSubmit = () => {
    onRestock(product.productId, parseInt(qty));
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
          <Dialog.Title className="text-lg font-semibold">Restock Product</Dialog.Title>
          <p className="mt-2 text-gray-600">Restocking: {product?.productName}</p>
          <input
            type="number"
            className="mt-4 w-full p-2 border rounded"
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="Enter quantity to add"
          />
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Restock</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
