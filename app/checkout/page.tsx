'use client';

import React from 'react';
import PaymentForm from '@/components/Payment/PaymentForm';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Shared/Loader';

export default function CheckoutPage() {
  const { cartProducts, getTotalPrice, loading } = useCart();
  const router = useRouter();

  if (loading) {
    return <Loader />;
  }

  React.useEffect(() => {
    if (cartProducts.length === 0 && !loading) {
      router.push('/cart'); // Redirect to cart if empty
    }
  }, [cartProducts.length, loading, router]);

  if (cartProducts.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Checkout
            </h1>
            <p className="text-slate-600">
              Complete your secure purchase
            </p>
          </div>
          <PaymentForm cartProducts={cartProducts} totalPrice={getTotalPrice()} />
        </div>
      </div>
    </div>
  );
}