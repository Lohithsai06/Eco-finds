'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ShoppingCart, Calendar, Tag } from 'lucide-react';
import Loader from '@/components/Shared/Loader';

interface ProductDetailProps {
  productId: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        const productData = {
          id: productDoc.id,
          ...productDoc.data(),
          createdAt: productDoc.data().createdAt?.toDate() || new Date(),
        } as Product;
        
        setProduct(productData);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h1>
          <p className="text-slate-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwnProduct = user?.uid === product.ownerId;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600 font-medium">{product.category}</span>
              </div>
              
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                {product.title}
              </h1>
              
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent mb-6">
                ${product.price}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Listed on {new Date(product.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              {!isOwnProduct && user ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-4 rounded-xl font-medium hover:from-emerald-600 hover:to-sky-600 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </div>
                </button>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-slate-600 text-center">
                    Please log in to add products to your cart
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-4 rounded-xl font-medium hover:from-emerald-600 hover:to-sky-600 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-700 text-center">
                    This is your product listing
                  </p>
                </div>
              )}
            </div>

            {/* Product Features */}
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-slate-800 mb-3">Eco-Friendly Features</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Sustainable sourcing</li>
                <li>• Environmentally conscious design</li>
                <li>• Minimal environmental impact</li>
                <li>• Supporting green initiatives</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;