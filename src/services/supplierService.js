const API_BASE_URL = 'https://inventorymanagementsystem-latest-37zl.onrender.com/api';

// Get auth headers with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getSuppliers = async () => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch suppliers');
  return response.json();
};

export const getSupplierDetails = async (id) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error(`Failed to fetch supplier ${id}`);
  return response.json();
};

export const addSupplier = async (supplier) => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(supplier)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to add supplier');
  }

  return response.json();
};

export const updateSupplier = async (id, supplier) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(supplier)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update supplier');
  }

  return response.json();
};

export const deleteSupplier = async (id) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to delete supplier');
  }
  return true;
};
// Add this to your existing supplierService.js
export const getSupplierPurchases = async (id) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}/purchases`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error(`Failed to fetch purchases for supplier ${id}`);
  return response.json();
};