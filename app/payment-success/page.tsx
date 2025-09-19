"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    const generateRandomDeliveryDate = () => {
      const today = new Date();
      const minDays = 3;
      const maxDays = 7;
      const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
      const delivery = new Date(today);
      delivery.setDate(today.getDate() + randomDays);
      return delivery.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    setDeliveryDate(generateRandomDeliveryDate());
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewPurchases = () => {
    router.push('/purchases');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg mx-auto text-center shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="h-24 w-24 text-emerald-500" />
              <div className="absolute inset-0 h-24 w-24 text-emerald-500 animate-ping opacity-20">
                <CheckCircle className="h-24 w-24" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-slate-800 mb-4">
            Payment Successful! 🎉
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-lg font-medium text-slate-700">
              📦 Expected Delivery
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {deliveryDate || 'Calculating...'}
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              🔔 You will receive email updates about your order status and tracking information.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleGoHome}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-medium py-3"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={handleViewPurchases}
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium py-3"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
