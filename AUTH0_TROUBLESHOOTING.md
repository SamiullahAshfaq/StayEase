# Auth0 Unauthorized Error - Troubleshooting Guide

Since the API `https://stayease-api` already exists, the "Unauthorized" error is likely due to one of these configuration issues:

## 🔍 Issue 1: Application Not Authorized to Use API (Most Common)

### Steps to Fix:

1. **Go to Auth0 Dashboard**: https://manage.auth0.com

2. **Navigate to APIs**:
   - Applications → APIs
   - Click on "StayEase API" (identifier: `https://stayease-api`)

3. **Check Machine to Machine Applications Tab**:
   - Click on the "Machine to Machine Applications" tab
   - Look for your application with Client ID: `VbSEaE4pZLPwIoGAd5N8ue23H8ci2wQs`
   - **Make sure the toggle is ON** ✅
   - If it's OFF or not listed, click "Authorize" button

4. **Grant Permissions** (if prompted):
   - You may need to select specific scopes/permissions
   - For testing, you can select all or leave default

---

## 🔍 Issue 2: Callback URL Not Configured

### Steps to Fix:

1. **Go to Auth0 Dashboard**: https://manage.auth0.com

2. **Navigate to Your Application**:
   - Applications → Applications
   - Click on your application

3. **Update Application URIs** (scroll down to this section):
   ```
   Allowed Callback URLs:
   http://localhost:4200/callback
   
   Allowed Logout URLs:
   http://localhost:4200
   
   Allowed Web Origins:
   http://localhost:4200
   
   Allowed Origins (CORS):
   http://localhost:4200
   ```
   
4. **Save Changes**

---

## 🔍 Issue 3: Wrong Token Request Settings

The API might be configured for different authentication flows.

### Steps to Fix:

1. **Go to Auth0 Dashboard** → Applications → APIs → StayEase API

2. **Settings Tab**:
   - **Allow Offline Access**: ON
   - **Allow Skipping User Consent**: ON (for development)
   - **Token Expiration**: 86400 (or your preference)

3. **Permissions Tab**:
   - Make sure there are some permissions defined (even if empty, the tab should exist)

---

## 🔍 Issue 4: Social Connection Not Properly Configured

### Steps to Fix:

1. **Go to Auth0 Dashboard** → Authentication → Social

2. **Google Connection**:
   - Make sure it's enabled (toggle ON)
   - Click on the Google connection
   - Go to "Applications" tab
   - **Make sure your application is enabled** ✅

---

## 🔍 Issue 5: Browser Cache/Cookies

Auth0 tokens and state might be cached incorrectly.

### Steps to Fix:

1. **Clear browser data**:
   - Press `F12` to open DevTools
   - Go to Application tab
   - Clear Storage:
     - Local Storage → Delete all
     - Session Storage → Delete all
     - Cookies → Delete all from `localhost:4200` and `dev-k03ztn804p2l0zs8.us.auth0.com`

2. **Try Incognito/Private Mode**:
   - This ensures no cached credentials interfere

---

## 🔍 Issue 6: API Permissions/Scopes Mismatch

### Steps to Fix:

1. **Check API Permissions** (Auth0 Dashboard → APIs → StayEase API → Permissions):
   - If you have custom permissions/scopes defined, they must match what your app requests
   - Try removing all custom scopes temporarily for testing

2. **Check Frontend Configuration** is requesting correct scopes:
   ```typescript
   // frontend/src/app/app.config.ts
   scope: 'openid profile email'  // These are standard scopes
   ```

---

## 🧪 Diagnostic Steps

### Step 1: Check Browser Console

After trying to login with Google, check the browser console (F12) for detailed error:

```javascript
// You should see:
🔴 Auth0 error details: {
  message: "...",
  error: "...",
  error_description: "...",
  fullError: {...}
}
```

**Common error_description values:**

- `"Audience is not allowed"` → Your app is not authorized for that API
- `"Invalid callback URL"` → Callback URL not in allowed list
- `"Access denied"` → User denied permissions or scope issue
- `"Invalid state"` → CSRF check failed (clear cookies and try again)

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Try login again
3. Look for requests to `auth0.com`
4. Check the failed request:
   - Look at Request Headers → check `redirect_uri`
   - Look at Response → check error details

### Step 3: Test Without Audience

Temporarily remove the audience to isolate the issue:

**File**: `frontend/src/environments/environment.development.ts`
```typescript
auth0: {
  domain: 'dev-k03ztn804p2l0zs8.us.auth0.com',
  clientId: 'VbSEaE4pZLPwIoGAd5N8ue23H8ci2wQs',
  // audience: 'https://stayease-api',  // ← Comment out temporarily
  redirectUri: 'http://localhost:4200/callback'
}
```

**File**: `frontend/src/app/app.config.ts`
```typescript
authorizationParams: {
  redirect_uri: environment.auth0.redirectUri,
  // audience: environment.auth0.audience,  // ← Comment out
  scope: 'openid profile email'
}
```

If this works, the issue is definitely with API authorization.

---

## ✅ Expected Console Output (After Fix)

When everything works correctly, you should see:

```
Auth0 authentication status: true
Auth0 user: {
  sub: "google-oauth2|123456789",
  email: "your-email@gmail.com",
  email_verified: true,
  name: "Your Name",
  picture: "https://...",
  ...
}
✅ Got Auth0 token, syncing with backend...
✅ User synced successfully
```

Then user is created in database and redirected to home page.

---

## 🎯 Quick Checklist

Before trying again, verify:

- [ ] API `https://stayease-api` exists in Auth0
- [ ] Your application is **authorized** to use the API (toggle ON)
- [ ] Callback URL `http://localhost:4200/callback` is in allowed list
- [ ] Google social connection is enabled for your application
- [ ] Browser cache/cookies cleared
- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:4200`

---

## 🆘 Still Stuck?

Run this in browser console after the error occurs:

```javascript
// Check Auth0 state
console.log('Current URL:', window.location.href);
console.log('LocalStorage:', {...localStorage});
console.log('SessionStorage:', {...sessionStorage});
```

Share the output for further debugging.

---

## 📞 Next Steps

1. **Fix the authorization issue** (Issue #1 above - most common)
2. **Clear browser cache**
3. **Restart frontend dev server**: `npm run start` in frontend folder
4. **Try login again**
5. **Check browser console** for the detailed logs

The updated callback component now shows much more detailed error information!
