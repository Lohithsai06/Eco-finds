# 🚀 EcoFinds Deployment Guide - Fix Google Sign-in Issue

## 🔥 Firebase Configuration for Vercel Deployment

### 📋 **Step 1: Add Authorized Domains in Firebase Console**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your EcoFinds project**
3. **Navigate to Authentication > Settings > Authorized domains**
4. **Add these domains**:
   ```
   localhost (should already be there)
   your-app-name.vercel.app
   your-custom-domain.com (if you have one)
   ```

### 🔧 **Step 2: Update Environment Variables in Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your EcoFinds project**
3. **Go to Settings > Environment Variables**
4. **Add these variables**:

```env
# 🔥 Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 💳 Stripe Configuration (if using)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_key
STRIPE_SECRET_KEY=sk_live_or_test_key

# 🌐 App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 🛠️ **Step 3: Update Firebase Configuration (if needed)**

If you're still having issues, update your Firebase config to handle different environments:

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

### 🔍 **Step 4: Enhanced Error Handling**

Update your AuthContext with better error handling:

```typescript
// context/AuthContext.tsx - Enhanced signInWithGoogle function
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  // Add additional scopes if needed
  provider.addScope('email');
  provider.addScope('profile');
  
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error("Detailed Google sign-in error:", error);
    
    // Handle specific error codes
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in was cancelled. Please try again.');
      case 'auth/popup-blocked':
        throw new Error('Popup was blocked. Please allow popups and try again.');
      case 'auth/unauthorized-domain':
        throw new Error('This domain is not authorized. Please contact support.');
      case 'auth/operation-not-allowed':
        throw new Error('Google sign-in is not enabled. Please contact support.');
      default:
        throw new Error(`Sign-in failed: ${error.message}`);
    }
  }
};
```

### 🔄 **Step 5: Redeploy Your Application**

After making these changes:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "🔧 Fix Google sign-in for production"
   git push origin main
   ```

2. **Vercel will automatically redeploy**

### 🧪 **Step 6: Test the Fix**

1. **Visit your deployed app**: `https://your-app-name.vercel.app`
2. **Try Google sign-in**
3. **Check browser console** for any remaining errors

## 🚨 **Common Issues & Solutions**

### ❌ **Issue: "unauthorized-domain" error**
**Solution**: Make sure your Vercel domain is added to Firebase authorized domains

### ❌ **Issue: "popup-blocked" error**
**Solution**: User needs to allow popups in their browser

### ❌ **Issue: Environment variables not working**
**Solution**: 
- Make sure all env vars start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables in Vercel

### ❌ **Issue: "auth/operation-not-allowed"**
**Solution**: Enable Google sign-in in Firebase Console > Authentication > Sign-in method

## ✅ **Verification Checklist**

- [ ] Firebase project has Google sign-in enabled
- [ ] Vercel domain added to Firebase authorized domains
- [ ] All environment variables set in Vercel
- [ ] Environment variables have correct `NEXT_PUBLIC_` prefix
- [ ] Application redeployed after changes
- [ ] Browser allows popups for your domain

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard > Your Project > Functions tab
   - Look for any error logs

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for detailed error messages

3. **Test Locally First**:
   - Make sure Google sign-in works locally
   - Use the same environment variables

4. **Firebase Console Logs**:
   - Check Firebase Console > Authentication > Users
   - Look for any failed sign-in attempts

## 📞 **Need Help?**

If you're still stuck, please provide:
- Your Vercel domain URL
- Firebase project ID
- Exact error message from browser console
- Screenshots of Firebase authorized domains settings