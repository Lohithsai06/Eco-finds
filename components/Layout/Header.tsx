'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Leaf,
  Plus,
  LogOut,
  Settings
} from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              EcoFinds
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-slate-600 hover:text-emerald-600 transition-colors duration-200"
            >
              Home
            </Link>
            {user && (
              <>
                <Link 
                  href="/listings" 
                  className="text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                >
                  My Listings
                </Link>
                <Link 
                  href="/purchases" 
                  className="text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                >
                  Purchases
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Add Product Button */}
            {user && (
              <Link
                href="/listings/add"
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Link>
            )}

            {/* Cart */}
            {user && (
              <Link 
                href="/cart" 
                className="relative p-2 text-slate-600 hover:text-emerald-600 transition-colors duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-emerald-50 transition-colors duration-200"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-emerald-100 py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 py-4">
            <div className="space-y-3">
              <Link
                href="/"
                className="block text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    href="/listings"
                    className="block text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Listings
                  </Link>
                  <Link
                    href="/purchases"
                    className="block text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Purchases
                  </Link>
                  <Link
                    href="/listings/add"
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2 rounded-xl w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-slate-600 hover:text-emerald-600 transition-colors duration-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2 rounded-xl w-fit text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button (Mobile) */}
      {user && (
        <Link
          href="/listings/add"
          className="sm:hidden fixed bottom-20 right-4 z-50 bg-gradient-to-r from-emerald-500 to-sky-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </header>
  );
};

export default Header;