// This Context is wrapped in App.jsx
// Any component can access cart via useCart hook

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create React Context for cart state management
const CartContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export const CartProvider = ({ children }) => {

  const [cartItems,  setCartItems]  = useState([]);   // list of items in cart
  const [itemCount,  setItemCount]  = useState(0);    // total item quantity (for badge)
  const [cartTotal,  setCartTotal]  = useState(0);    // total price in LKR
  const [isOpen,     setIsOpen]     = useState(false); // cart drawer visibility
  const [addedId,    setAddedId]    = useState(null);  // product ID for add button feedback

  // ── Helpers ─────────────────────────────────────────────────

  // Recalculate total price and item count from cart items
  const recalculate = (items) => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    setCartTotal(Math.round(total * 100) / 100);
    setItemCount(count); // #44 — update navbar badge count
  };

  // ── Sync to localStorage ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('giftora_cart', JSON.stringify(cartItems));
    recalculate(cartItems);
  }, [cartItems]);

  // ── Load cart on mount ───────────────────────────────────────
  const loadCart = useCallback(async () => {
    try {
      const saved = localStorage.getItem('giftora_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCartItems(parsed);
        recalculate(parsed);
      }
    } catch (err) {
      console.error('Failed to parse cart from local storage:', err);
    }
  }, []);

  // ── Add to Cart (#43) ────────────────────────────────────────
  const addToCart = useCallback(async (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        name:      product.name,
        price:     product.price,
        quantity:  1,
        imageUrl:  product.imageUrl,
      }];
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }, []);

  // ── Remove item ──────────────────────────────────────────────
  const removeItem = useCallback(async (productId) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  // ── Update quantity ──────────────────────────────────────────
  const updateQty = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.productId !== productId));
      return;
    }
    setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }, []);

  // ── Clear cart ───────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([]);
    setItemCount(0);
    setCartTotal(0);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      itemCount,  
      cartTotal,  
      isOpen,
      addedId,    
      setIsOpen,
      addToCart,
      removeItem,
      updateQty,
      clearCart,
      loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context in any component
export const useCart = () => useContext(CartContext);