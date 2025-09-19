'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Purchase } from '@/lib/types';
import { Package, Calendar, DollarSign, Trash2 } from 'lucide-react';
import Loader from '@/components/Shared/Loader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PurchaseHistory = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);

  const loadPurchases = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'purchases'),
        where('userId', '==', user.uid),
        orderBy('purchasedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const purchasesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          purchasedAt: data.purchasedAt?.toDate() || new Date(),
          items: data.items || [], // Ensure items array exists
        };
      }) as Purchase[];

      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase history.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string, purchaseUserId: string) => {
    if (!user || user.uid !== purchaseUserId) {
      toast({
        title: 'Permission Denied',
        description: 'You can only delete your own purchases.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteDoc(doc(db, 'purchases', purchaseId));
      toast({
        title: 'Purchase Deleted',
        description: 'The purchase has been successfully removed.',
      });
      loadPurchases(); // Refresh the list
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the purchase.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Please Log In</h1>
          <p className="text-slate-600 mb-6">You need to be logged in to view your purchase history</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Purchase History
          </h1>
          <p className="text-slate-600">
            View your eco-friendly purchases
          </p>
        </div>

        {loading ? (
          <Loader />
        ) : purchases.length > 0 ? (
          <div className="space-y-6">
            {purchases.map(purchase => (
              <div key={purchase.id} className="bg-white rounded-2xl shadow-md p-6 fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">
                        Order #{purchase.id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center space-x-2 text-slate-600 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(purchase.purchasedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-slate-600 text-sm mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Amount</span>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                        ${purchase.totalAmount}
                      </div>
                    </div>
                    {user && user.uid === purchase.userId && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeletePurchase(purchase.id, purchase.userId)}
                        className="ml-4"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-md text-slate-700 mb-2">Items:</h4>
                  {purchase.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-slate-600">
                      <span>{item.productName}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full">
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No purchases yet
            </h3>
            <p className="text-slate-600 mb-6">
              You havent made any purchases yet. Start exploring our eco-friendly products!
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;