import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the context
const CartContext = createContext();

// 2. Create a custom hook for easy access to the context
export const useCart = () => {
  return useContext(CartContext);
};

// 3. Create the Provider component
export const CartProvider = ({ children }) => {
  // 4. State management
  const [cartItems, setCartItems] = useState(() => {
    // Load initial cart state from localStorage to persist cart across sessions
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart data from localStorage", error);
      return [];
    }
  });

  // 5. Persist cart state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- Core Cart Functions ---

  /**
   * Adds a product to the cart. If it already exists, increases the quantity.
   * @param {object} product - The product to add.
   * @param {number} quantity - The quantity to add.
   */
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If new, add it to the cart
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  /**
   * Removes an item completely from the cart.
   * @param {string} productId - The ID of the product to remove.
   */
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  /**
   * Updates the quantity of a specific item in the cart.
   * @param {string} productId - The ID of the product to update.
   * @param {number} newQuantity - The new quantity. If 0, removes the item.
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  /**
   * Clears the entire cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // --- Derived State Calculations ---

  // Calculate the total number of items in the cart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate the subtotal of the cart
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // 6. Value to be passed down to consuming components
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};