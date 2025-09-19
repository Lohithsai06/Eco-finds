'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, Save, X } from 'lucide-react';

const DashboardForm = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (formData.username.length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }

    setLoading(true);

    try {
      // Update Firebase Auth profile
      if (auth.currentUser && formData.username !== user.username) {
        await updateProfile(auth.currentUser, {
          displayName: formData.username,
        });
      }

      // Update Firestore user document
      await updateUser({
        username: formData.username.trim(),
      });

      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Please Log In</h1>
          <p className="text-slate-600">You need to be logged in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full mb-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              User Dashboard
            </h1>
            <p className="text-slate-600">
              Keep your info updated for a better experience
            </p>
          </div>

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl transition-all duration-200 ${
                    editing 
                      ? 'focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white' 
                      : 'bg-slate-50 text-slate-700'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Member Since
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-sky-600 transition-all duration-200 disabled:opacity-50 hover:scale-105 shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-sky-600 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <User className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Account Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700 mb-1">—</div>
                <div className="text-sm text-emerald-600">Products Listed</div>
              </div>
              <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-sky-700 mb-1">—</div>
                <div className="text-sm text-sky-600">Items Purchased</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">—</div>
                <div className="text-sm text-purple-600">Cart Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardForm;