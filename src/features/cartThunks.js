import { 
    getCart as getCartAPI,
    addToCart as addToCartAPI,
    updateCartItem as updateCartItemAPI,
    removeFromCart as removeFromCartAPI,
    checkoutCart as checkoutCartAPI,
    applyDiscount as applyDiscountAPI
  } from '../services/cartService';
  import { 
    setCart, 
    setLoading,
    setError
  } from './cartSlice';
  
  export const fetchCart = () => async (dispatch) => {
    try {
      dispatch(setLoading());
      const cartData = await getCartAPI();
      dispatch(setCart(cartData));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };
  
  export const addItemToCart = (productId, quantity = 1) => async (dispatch) => {
    try {
      dispatch(setLoading());
      const cartData = await addToCartAPI([{ productId, quantity }]);
      dispatch(setCart(cartData));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };
  
  export const updateItemQuantity = (productId, quantity) => async (dispatch) => {
    try {
      dispatch(setLoading());
      await updateCartItemAPI(productId, quantity);
      const cartData = await getCartAPI();
      dispatch(setCart(cartData));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };
  
  export const removeItemFromCart = (productId) => async (dispatch) => {
    try {
      dispatch(setLoading());
      await removeFromCartAPI(productId);
      const cartData = await getCartAPI();
      dispatch(setCart(cartData));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };
  
  export const completeCheckout = (checkoutData) => async (dispatch) => {
    try {
      dispatch(setLoading());
      const result = await checkoutCartAPI(checkoutData);
      dispatch(setCart({
        items: [],
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0
      }));
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };
  
  export const applyDiscountCode = (discountCode) => async (dispatch) => {
    try {
      dispatch(setLoading());
      const cartData = await applyDiscountAPI(discountCode);
      dispatch(setCart(cartData));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };