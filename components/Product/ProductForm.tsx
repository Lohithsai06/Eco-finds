'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { categories } from '@/lib/types';
import toast from 'react-hot-toast';
import { saveProduct } from '@/lib/addproduct';
import { Upload, X } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductFormProps {
  initialProductData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProductData }) => {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialProductData?.imageUrl || null);
  const [formData, setFormData] = useState({
    title: initialProductData?.title || '',
    description: initialProductData?.description || '',
    category: initialProductData?.category || '',
    price: initialProductData?.price?.toString() || '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialProductData) {
      setFormData({
        title: initialProductData.title,
        description: initialProductData.description,
        category: initialProductData.category,
        price: initialProductData.price.toString(),
      });
      setImagePreview(initialProductData.imageUrl);
    }
  }, [initialProductData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firebaseUser) {
      toast.error('Please log in to continue');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const productId = await saveProduct(
        formData,
        imageFile,
        firebaseUser,
        initialProductData?.id,
        initialProductData?.imageUrl
      );

      toast.success(initialProductData ? 'Product updated successfully!' : 'Product added successfully!');
      router.push('/listings');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    if (initialProductData) {
      // If editing, revert to original image
      setImagePreview(initialProductData.imageUrl);
    } else {
      // If adding new product, remove preview entirely
      setImagePreview(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Please Log In</h1>
          <p className="text-slate-600 mb-6">You need to be logged in to add products</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent mb-4">
            {initialProductData ? 'Edit Your Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-600 text-lg">
            {initialProductData ? 'Update your product details' : 'Share your eco-friendly product with the community'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-emerald-100 pb-2">
                    Product Details
                  </h2>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
                      placeholder="Enter a catchy product title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-800 bg-white"
                      required
                    >
                      <option value="">Choose a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 resize-none"
                      placeholder="Describe your eco-friendly product, its benefits, and what makes it special..."
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 border-b border-emerald-100 pb-2 mb-4">
                    Product Image
                  </h2>

                  <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative group">
                        <div className="aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src={imagePreview}
                            alt="Product preview"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200"
                          title={initialProductData ? "Revert to original image" : "Remove image"}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {imageFile && (
                          <div className="absolute bottom-3 left-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg text-center">
                            ✨ New image selected
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload Area */}
                    <label className="block">
                      <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-50/50 ${imagePreview ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-300 bg-slate-50/50'}`}>
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full flex items-center justify-center">
                            <Upload className="h-8 w-8 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-slate-700">
                              {imagePreview ? 'Replace Image' : 'Upload Product Image'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              Drag and drop or click to browse
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              PNG, JPG, WEBP up to 5MB
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              ✨ Images are automatically optimized for fast loading
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </div>
                    </label>

                    {!imagePreview && !initialProductData && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          Product image is required
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="font-semibold text-slate-800 mb-3">📸 Photo Tips</h3>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• Use natural lighting for best results</li>
                    <li>• Show your product from multiple angles</li>
                    <li>• Keep the background clean and simple</li>
                    <li>• Highlight eco-friendly features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.push('/listings')}
                className="w-full sm:w-auto px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || (!imagePreview && !initialProductData)}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {initialProductData ? 'Updating...' : 'Publishing...'}
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    {initialProductData ? '✏️ Update Product' : '🚀 Publish Product'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;