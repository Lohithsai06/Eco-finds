'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import Loader from '@/components/Shared/Loader';
import { useRouter } from 'next/navigation';

const CartView = () => {
  const { cartProducts, removeFromCart, getTotalPrice, loading, clearCart } = useCart();
  const { user } = useAuth();

  const router = useRouter();

  const handleCheckout = () => {
    if (!user) return;
    router.push('/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Please Log In</h1>
          <p className="text-slate-600 mb-6">You need to be logged in to view your cart</p>
          <Link
            href="/login"
            className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Shopping Cart
          </h1>
          <p className="text-slate-600">
            Review your eco-friendly selections
          </p>
        </div>

        {cartProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-md p-6 fade-in">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">
                        {product.category}
                      </p>
                      <p className="text-slate-500 text-sm line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent mb-2">
                        ${product.price}
                      </p>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-800">${getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-800">Free</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-slate-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                        ${getTotalPrice()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-sky-600 transition-all duration-200 hover:scale-105 shadow-lg mb-4"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Proceed to Checkout</span>
                  </div>
                </button>
                
                <Link
                  href="/"
                  className="block w-full text-center text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full">
                <ShoppingBag className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Your cart is empty
            </h3>
            <p className="text-slate-600 mb-6">
              Your cart is empty. Start exploring our eco-friendly products!
            </p>
            <Link
              href="/"
              className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;