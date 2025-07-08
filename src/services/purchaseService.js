const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/purchases`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getAllPurchases = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch purchases');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
};

export const createPurchase = async (purchaseData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(purchaseData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create purchase');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};

export const getPurchaseById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch purchase');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching purchase ${id}:`, error);
    throw error;
  }
};

export const receivePurchase = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/receive`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark purchase as received');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error receiving purchase ${id}:`, error);
    throw error;
  }
};

export const deletePurchase = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete purchase');
    }
  } catch (error) {
    console.error(`Error deleting purchase ${id}:`, error);
    throw error;
  }
};

export const updatePurchase = async (id, purchaseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(purchaseData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update purchase');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating purchase ${id}:`, error);
    throw error;
  }
};

export const applyDiscount = async (id, discountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/discount`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(discountData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to apply discount');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error applying discount to purchase ${id}:`, error);
    throw error;
  }
};

export const getPendingPurchases = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pending`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch pending purchases');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending purchases:', error);
    throw error;
  }
};

export const cancelPurchase = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel purchase');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error cancelling purchase ${id}:`, error);
    throw error;
  }
};