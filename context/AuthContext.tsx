'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = async (userData: Partial<User>) => {
    if (!firebaseUser) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, userData, { merge: true });

    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    // Add additional scopes for better user info
    provider.addScope('email');
    provider.addScope('profile');

    // Set custom parameters for better UX
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      return result;
    } catch (error: any) {
      console.error("Detailed Google sign-in error:", error);

      // Handle specific error codes for better user experience
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in was cancelled. Please try again.');
        case 'auth/popup-blocked':
          throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
        case 'auth/unauthorized-domain':
          throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
        case 'auth/operation-not-allowed':
          throw new Error('Google sign-in is not enabled. Please contact support.');
        case 'auth/cancelled-popup-request':
          throw new Error('Another sign-in popup is already open. Please close it and try again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection and try again.');
        default:
          throw new Error(`Failed to sign in with Google: ${error.message || 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        // Get or create user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: userData.email,
            username: userData.username,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        } else {
          // Create new user document for social auth
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.displayName || 'User',
            createdAt: new Date(),
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, updateUser, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}