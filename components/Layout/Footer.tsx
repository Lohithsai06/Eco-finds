import React from 'react';
import Link from 'next/link';
import { Leaf, Heart, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-emerald-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                EcoFinds
              </span>
            </div>
            <p className="text-slate-600 mb-4 max-w-md">
              Discover sustainable products and connect with eco-conscious sellers in our green marketplace. 
              Together, we're building a more sustainable future.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-emerald-600">
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-sm">Made with love for the planet</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-600">Electronics</span>
              </li>
              <li>
                <span className="text-slate-600">Home & Garden</span>
              </li>
              <li>
                <span className="text-slate-600">Clothing</span>
              </li>
              <li>
                <span className="text-slate-600">Books</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm mb-4 md:mb-0">
              © 2024 EcoFinds. All rights reserved.
            </p>
            <div className="flex items-center text-slate-500 text-sm">
              <Globe className="h-4 w-4 mr-1" />
              <span>Building a sustainable marketplace</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;