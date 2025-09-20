# 🔧 Fix Google Sign-In on Vercel Deployment

## 🎯 **Problem**
Google Sign-In works on `localhost:3000` but fails on your deployed Vercel app with errors like:
- "This domain is not authorized"
- "Popup blocked" or "unauthorized-domain"
- "Failed to sign in with Google"

## ✅ **Solution: 3-Step Configuration**

---

## 📋 **Step 1: Firebase Console - Add Authorized Domains**

### 🔥 **Firebase Authentication Settings**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your EcoFinds project**
3. **Navigate to**: `Authentication` → `Settings` → `Authorized domains` tab
4. **Click "Add domain"** and add these domains:

```
✅ localhost (should already be there)
✅ your-app-name.vercel.app (replace with your actual Vercel domain)
✅ your-custom-domain.com (if you have a custom domain)
```

### 📸 **Visual Guide:**
```
Firebase Console → Authentication → Settings → Authorized domains

Current domains:
┌─────────────────────────────────┐
│ ✅ localhost                    │
│ ✅ your-project.firebaseapp.com │
│ ➕ ADD: your-app.vercel.app     │ ← Add this!
│ ➕ ADD: your-custom-domain.com  │ ← If you have one
└─────────────────────────────────┘
```

---

## 🌐 **Step 2: Google Cloud Console - OAuth Configuration**

### 🔑 **Google Cloud OAuth Client Settings**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select the same project** (linked to your Firebase project)
3. **Navigate to**: `APIs & Services` → `Credentials`
4. **Find your OAuth 2.0 Client ID** (usually named "Web client (auto created by Google Service)")
5. **Click the edit icon** (pencil) to edit the OAuth client
6. **In "Authorized redirect URIs"**, add these URIs:

```
✅ http://localhost:3000/__/auth/handler (for local development)
✅ https://your-app-name.vercel.app/__/auth/handler (for production)
✅ https://your-custom-domain.com/__/auth/handler (if using custom domain)
```

### 📸 **Visual Guide:**
```
Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs

Authorized redirect URIs:
┌─────────────────────────────────────────────────────────────┐
│ ✅ http://localhost:3000/__/auth/handler                    │
│ ➕ ADD: https://your-app.vercel.app/__/auth/handler         │
│ ➕ ADD: https://your-custom-domain.com/__/auth/handler      │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ **Important Notes:**
- Use `https://` for production domains (not `http://`)
- The path must be exactly `/__/auth/handler`
- Replace `your-app-name` with your actual Vercel app name

---

## ⚙️ **Step 3: Verify Environment Variables**

### 🔍 **Check Your Firebase Configuration**

Let me verify your current Firebase config is using environment variables correctly:

✅ **Your Firebase config looks correct!** It's using environment variables properly.

### 📋 **Verify Vercel Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your EcoFinds project**
3. **Go to**: `Settings` → `Environment Variables`
4. **Ensure these variables are set**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### ⚠️ **Critical Check:**
Make sure `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is set to:
```
your-project-id.firebaseapp.com
```
**NOT** your Vercel domain!

---

## 🚀 **Step 4: Deploy and Test**

### 📤 **Redeploy Your App**

After making the above changes:

1. **Commit any changes** (if you made any):
   ```bash
   git add .
   git commit -m "🔧 Configure Google Sign-in for production"
   git push origin main
   ```

2. **Vercel will auto-deploy**, or manually trigger a redeploy

### 🧪 **Test Google Sign-In**

1. **Visit your production app**: `https://your-app.vercel.app`
2. **Try Google Sign-In**
3. **Check browser console** for any errors

---

## 🔍 **Troubleshooting Common Issues**

### ❌ **Error: "This domain is not authorized"**
**Solution**: Double-check that your Vercel domain is added to Firebase authorized domains

### ❌ **Error: "Popup blocked"**
**Solution**: User needs to allow popups, or the domain isn't properly configured

### ❌ **Error: "redirect_uri_mismatch"**
**Solution**: Check Google Cloud Console OAuth redirect URIs - must include `/__/auth/handler`

### ❌ **Still not working?**
**Debug steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try Google Sign-In
4. Look for failed requests and error messages

---

## 📋 **Quick Checklist**

Before testing, ensure:

- [ ] ✅ Firebase authorized domains includes your Vercel domain
- [ ] ✅ Google Cloud OAuth redirect URIs includes `https://your-app.vercel.app/__/auth/handler`
- [ ] ✅ Vercel environment variables are set correctly
- [ ] ✅ `authDomain` in env vars is `your-project.firebaseapp.com` (not Vercel domain)
- [ ] ✅ App has been redeployed after changes
- [ ] ✅ Browser allows popups for your domain

---

## 🆘 **Still Having Issues?**

### 🔍 **Debug Information to Check:**

1. **Your exact Vercel domain**: `https://your-app-name.vercel.app`
2. **Firebase project ID**: Found in Firebase Console → Project Settings
3. **Error message**: Exact error from browser console
4. **Network requests**: Check if auth requests are failing

### 📞 **Common Solutions:**

| Error | Solution |
|-------|----------|
| `unauthorized-domain` | Add domain to Firebase authorized domains |
| `redirect_uri_mismatch` | Add redirect URI to Google Cloud OAuth |
| `popup-blocked` | User needs to allow popups |
| `operation-not-allowed` | Enable Google sign-in in Firebase Console |

---

## 🎯 **Expected Result**

After following these steps:
- ✅ Google Sign-In works on production
- ✅ No console errors
- ✅ Users can sign in with Google successfully
- ✅ User data is properly stored in Firestore

---

## 📝 **Quick Reference URLs**

- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**🎉 After completing these steps, your Google Sign-In should work perfectly on your deployed Vercel app!**