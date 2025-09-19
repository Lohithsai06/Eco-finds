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
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // The onAuthStateChanged listener will handle success cases.
      // Errors can be handled here, e.g., by showing a toast notification.
      throw error; // Re-throw to be caught by the UI component if needed
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