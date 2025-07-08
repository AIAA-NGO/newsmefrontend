// /components/ProductFormModal.jsx
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../ui/button';


export default function ProductFormModal({ isOpen, onClose, onSave, editingProduct }) {
  const [formData, setFormData] = useState({
    productName: '',
    productDesc: '',
    productQty: 0,
    productPrice: 0,
    categoryId: '',
    supplierId: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        productName: '',
        productDesc: '',
        productQty: 0,
        productPrice: 0,
        categoryId: '',
        supplierId: '',
      });
    }
  }, [editingProduct]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </Dialog.Title>

          <div className="space-y-3">
            <input type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" className="w-full p-2 border rounded" />
            <input type="text" name="productDesc" value={formData.productDesc} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
            <input type="number" name="productQty" value={formData.productQty} onChange={handleChange} placeholder="Quantity" className="w-full p-2 border rounded" />
            <input type="number" step="0.01" name="productPrice" value={formData.productPrice} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded" />
            <input type="text" name="categoryId" value={formData.categoryId} onChange={handleChange} placeholder="Category ID" className="w-full p-2 border rounded" />
            <input type="text" name="supplierId" value={formData.supplierId} onChange={handleChange} placeholder="Supplier ID" className="w-full p-2 border rounded" />
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingProduct ? 'Update' : 'Add'}</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
