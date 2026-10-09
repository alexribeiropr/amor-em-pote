import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'amor_em_pote_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      return { success: false, message: 'Este produto está esgotado!' };
    }

    let success = true;
    let message = 'Adicionado ao carrinho!';

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const desiredQty = currentQty + quantity;

      if (desiredQty > product.stock) {
        success = false;
        message = `Quantidade solicitada (${desiredQty}) ultrapassa o estoque disponível (${product.stock} un).`;
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: desiredQty }
            : item
        );
      } else {
        return [...prev, {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          stock: product.stock
        }];
      }
    });

    return { success, message };
  };

  const updateQuantity = (productId, newQuantity, availableStock) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    if (newQuantity > availableStock) {
      return {
        success: false,
        message: `Estoque insuficiente! Disponível: apenas ${availableStock} un.`
      };
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    return { success: true };
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}
