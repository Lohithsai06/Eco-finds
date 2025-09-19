'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mounted) {
      router.push(`/listings/edit/${product.id}`);
    }
  };

  const isOwnProduct = user?.uid === product.ownerId;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group fade-in">
      <Link href={`/product/${product.id}`}>
        <div className="relative h-40 sm:h-48 lg:h-56">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

          {/* Category Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isOwnProduct && (
              <button
                onClick={handleEditClick}
                className="bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            <button className="bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors duration-200">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-slate-700" />
            </button>
            {!isOwnProduct && user && (
              <button
                onClick={handleAddToCart}
                className="bg-emerald-500 hover:bg-emerald-600 p-1.5 sm:p-2 rounded-full transition-colors duration-200"
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-lg text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2">
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              ${product.price}
            </span>

            {!isOwnProduct && user && (
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md whitespace-nowrap w-full sm:w-auto"
              >
                Add to Cart
              </button>
            )}
          </div>

          <div className="mt-2 sm:mt-3 text-xs text-slate-500">
            Listed {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;