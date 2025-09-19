'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/lib/types';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '@/components/Shared/Loader';

const MyListingsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (user) {
      loadUserProducts();
    }
  }, [user]);

  const loadUserProducts = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'products'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const originalProducts = products;

    // Optimistically update the UI
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast.success('Product deleted successfully');

    try {
      // Perform deletions in the background
      await deleteDoc(doc(db, 'products', product.id));

      if (product.imageUrl) {
        try {
          const imageRef = ref(storage, product.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.log('Image already deleted or not found');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Restoring product.');
      // Rollback UI on error
      setProducts(originalProducts);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Please Log In</h1>
          <p className="text-slate-600 mb-6">You need to be logged in to view your listings</p>
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

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              My Listings
            </h1>
            <p className="text-slate-600">
              Manage your eco-friendly products
            </p>
          </div>

          <Link
            href="/listings/add"
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative h-48">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/listings/edit/${product.id}`}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4 text-slate-700" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="bg-red-500/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                      ${product.price}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Listed {new Date(product.createdAt).toLocaleDateString()}
                  </div>
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
              No products listed yet
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't listed anything yet. Start by adding your first eco-friendly product!
            </p>
            <Link
              href="/listings/add"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Product</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;