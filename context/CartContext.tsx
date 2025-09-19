'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartItem, Product } from '@/lib/types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  cartProducts: Product[];
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setCartProducts([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        setCartItems(cartData.products || []);
        
        // Load product details
        const productPromises = cartData.products.map(async (item: CartItem) => {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            return { id: productSnap.id, ...productSnap.data() } as Product;
          }
          return null;
        });
        
        const products = await Promise.all(productPromises);
        setCartProducts(products.filter(Boolean) as Product[]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    if (!user) return;
    
    try {
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, { userId: user.uid, products: items });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem) {
      toast.error('Item already in cart');
      return;
    }

    const newItems = [...cartItems, { productId, quantity: 1 }];
    setCartItems(newItems);
    await saveCart(newItems);
    
    // Load the product details
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const product = { id: productSnap.id, ...productSnap.data() } as Product;
      setCartProducts(prev => [...prev, product]);
    }
    
    toast.success('Added to cart');
  };

  const removeFromCart = async (productId: string) => {
    const newItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(newItems);
    setCartProducts(prev => prev.filter(product => product.id !== productId));
    await saveCart(newItems);
    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    setCartItems([]);
    setCartProducts([]);
    await saveCart([]);
  };

  const getTotalPrice = () => {
    return cartProducts.reduce((total, product) => total + product.price, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartProducts,
      loading,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}