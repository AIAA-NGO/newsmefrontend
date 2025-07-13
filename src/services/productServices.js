import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data)
      return Promise.reject(new Error("Server error occurred. Please try again later."));
    }
    return Promise.reject(error);
  }
);

const extractArrayData = (data) => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const possibleKeys = ["content", "products", "data", "items", "results"];
    for (const key of possibleKeys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
    console.error("Invalid response format:", data);
    return [];
  }
  
  // Handle other possible array locations
  const possibleKeys = ["products", "data", "items", "results"];
  for (const key of possibleKeys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }
  
  // If it's already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // Fallback to empty array
  return [];
};

const transformProduct = (product) => ({
  id: product.id,
  name: product.name || "",
  description: product.description || "",
  quantityInStock: Number(product.quantityInStock || product.quantity_in_stock) || 0,
  categoryId: Number(product.categoryId || product.category_id) || 0,
  supplierId: product.supplierId || product.supplier_id || "",
  price: Number(product.price) || 0,
  imageUrl: product.imageUrl || product.image_url || null,
  sku: product.sku || "",
  barcode: product.barcode || "",
  brandId: product.brandId || product.brand_id || null,
  unitId: product.unitId || product.unit_id || null,
  costPrice: product.costPrice || product.cost_price || 0,
  lowStockThreshold: product.lowStockThreshold || product.low_stock_threshold || 0,
  expiryDate: product.expiryDate || product.expiry_date || null
});

// Update the getAllProducts function
export const getAllProducts = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/products?page=${page}&size=${size}`);
    return response.data; // Return the full response including pagination data
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return transformProduct(response.data);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const createProduct = async (formData) => {
  try {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return transformProduct(response.data);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.response?.data?.errors) {
      const validationErrors = {};
      error.response.data.errors.forEach(err => {
        validationErrors[err.field] = err.defaultMessage || err.message;
      });
      throw { validationErrors };
    }
    throw error;
  }
};

export const updateProduct = async (id, productData, imageFile) => {
  try {
    const formData = new FormData();
    
    // Create the product request object
    const productRequest = {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      barcode: productData.barcode,
      price: productData.price,
      costPrice: productData.costPrice,
      quantityInStock: productData.quantityInStock,
      lowStockThreshold: productData.lowStockThreshold,
      expiryDate: productData.expiryDate,
      supplierId: productData.supplierId,
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      unitId: productData.unitId
    };

    // Add the request as a JSON blob
    formData.append('request', new Blob([JSON.stringify(productRequest)], {
      type: 'application/json'
    }));

    // Add the image file if it exists
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return transformProduct(response.data);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const updateProductWithImage = async (id, formData) => {
  try {
    const response = await api.put(`/products/${id}/with-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return transformProduct(response.data);
  } catch (error) {
    console.error("Error updating product with image:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const deleteProductImage = async (id) => {
  try {
    const response = await api.delete(`/products/${id}/image`);
    return transformProduct(response.data);
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await api.get(`/products/search?query=${query}`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

export const getLowStockProducts = async () => {
  try {
    const response = await api.get('/products/low-stock');
    return response.data.map(transformProduct);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    throw error;
  }
};

export const getProductsBySupplier = async (supplierId) => {
  try {
    const response = await api.get(`/products/supplier/${supplierId}`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error("Error fetching products by supplier:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

export const getExpiringProducts = async (thresholdDate = null) => {
  try {
    const params = thresholdDate ? { params: { thresholdDate } } : {};
    const response = await api.get('/products/expiring', params);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error("Error fetching expiring products:", error);
    throw error;
  }
};

export const getProductCount = async () => {
  try {
    const response = await api.get('/products/count');
    return response.data;
  } catch (error) {
    console.error("Error fetching product count:", error);
    throw error;
  }
};

// Supporting Services
export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return extractArrayData(response.data).map(category => ({
      id: category.id,
      name: category.name || "Unnamed Category",
      description: category.description || ""
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getBrands = async () => {
  try {
    const response = await api.get("/brands");
    return extractArrayData(response.data).map(brand => ({
      id: brand.id,
      name: brand.name || "Unnamed Brand",
      description: brand.description || ""
    }));
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

export const getUnits = async () => {
  try {
    const response = await api.get("/units");
    return extractArrayData(response.data).map(unit => ({
      id: unit.id,
      name: unit.name || "Unnamed Unit",
      description: unit.description || "",
      abbreviation: unit.abbreviation || ""
    }));
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
};

export const getSuppliers = async () => {
  try {
    const response = await api.get("/suppliers");
    return extractArrayData(response.data).map(supplier => ({
      id: supplier.id,
      companyName: supplier.companyName || supplier.name || "Unnamed Supplier",
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || ""
    }));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

export const getProductImage = async (id) => {
  try {
    const response = await api.get(`/products/${id}/image`, {
      responseType: 'arraybuffer'
    });
    return new Blob([response.data], { type: response.headers['content-type'] });
  } catch (error) {
    console.error("Error fetching product image:", error);
    throw error;
  }
};

export const exportProductsToExcel = async () => {
  try {
    const response = await api.get('/products/export', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting products:", error);
    throw error;
  }
};

export const importProductsFromExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error importing products:", error);
    throw error;
  }

  
};


export const checkSkuExists = async (sku) => {
  try {
    const response = await api.get(`/products/check-sku`, {
      params: { sku }
    });
    return response.data.exists;
  } catch (error) {
    console.error("Error checking SKU:", error);
    // Return false if there's a server error to allow form submission
    // The server should validate again anyway
    return false;
  }
};

export const checkBarcodeExists = async (barcode) => {
  try {
    const response = await api.get(`/products/check-barcode`, {
      params: { barcode }
    });
    return response.data.exists;
  } catch (error) {
    console.error("Error checking barcode:", error);
    // Return false if there's a server error to allow form submission
    // The server should validate again anyway
    return false;
  }
};

export const addProduct = async (formData) => {
  try {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return transformProduct(response.data);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.response?.data?.errors) {
      const validationErrors = {};
      error.response.data.errors.forEach(err => {
        validationErrors[err.field] = err.defaultMessage || err.message;
      });
      throw { validationErrors };
    }
    throw error;
  }
};