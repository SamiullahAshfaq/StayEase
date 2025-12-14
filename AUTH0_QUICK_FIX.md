# Auth0 "Unauthorized" Error - Quick Fix Guide

## The Problem
You're getting `Unauthorized` error because your frontend is configured to use `audience: 'https://stayease-api'`, but this API doesn't exist in your Auth0 account yet.

## ✅ Solution 1: Create Auth0 API (Recommended - 2 minutes)

### Step-by-Step:

1. **Go to Auth0 Dashboard**: https://manage.auth0.com

2. **Navigate to APIs**:
   - Click "Applications" in left sidebar
   - Click "APIs"

3. **Create New API**:
   - Click "+ Create API" button
   - **Name**: `StayEase API`
   - **Identifier**: `https://stayease-api` ⚠️ **MUST be exactly this**
   - **Signing Algorithm**: `RS256`
   - Click "Create"

4. **Configure Application to use API**:
   - Go to "Applications" → "Applications"
   - Click on your application (the one with Client ID: `VbSEaE4pZLPwIoGAd5N8ue23H8ci2wQs`)
   - Go to "APIs" tab
   - Make sure "StayEase API" is authorized

5. **Verify Callback URLs** (while you're there):
   - In your application settings, scroll to "Application URIs"
   - **Allowed Callback URLs**: `http://localhost:4200/callback`
   - **Allowed Logout URLs**: `http://localhost:4200`
   - **Allowed Web Origins**: `http://localhost:4200`
   - Click "Save Changes"

6. **Test Again**:
   - Clear browser cache/cookies
   - Try logging in with Google again

---

## 🔧 Solution 2: Quick Test Without Audience (Development Only)

If you just want to test quickly without creating the API, you can temporarily remove the audience requirement:

### Frontend Changes:

**File**: `frontend/src/environments/environment.development.ts`
```typescript
auth0: {
  domain: 'dev-k03ztn804p2l0zs8.us.auth0.com',
  clientId: 'VbSEaE4pZLPwIoGAd5N8ue23H8ci2wQs',
  // audience: 'https://stayease-api',  // ← Comment this out temporarily
  redirectUri: 'http://localhost:4200/callback'
}
```

**File**: `frontend/src/app/app.config.ts` (around line 31-42)
```typescript
provideAuth0({
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  authorizationParams: {
    redirect_uri: environment.auth0.redirectUri,
    // audience: environment.auth0.audience,  // ← Comment out
    scope: 'openid profile email'
  },
  httpInterceptor: {
    allowedList: [
      {
        uri: `${environment.apiUrl}/*`,
        tokenOptions: {
          authorizationParams: {
            // audience: environment.auth0.audience,  // ← Comment out
            scope: 'openid profile email'
          }
        }
      }
    ]
  }
})
```

### Backend Changes:

**File**: `backend/src/main/java/com/stayease/config/SecurityConfiguration.java`

Comment out the OAuth2 resource server (around line 87-90):
```java
// Temporarily disable Auth0 token validation for testing
// .oauth2ResourceServer(oauth2 -> oauth2
//         .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
//         .authenticationEntryPoint(customAuthenticationEntryPoint))
```

⚠️ **WARNING**: This is for testing only! The backend won't validate Auth0 tokens with this approach.

---

## 🎯 What Should Happen After Fix:

1. User clicks "Sign in with Google"
2. Auth0 shows Google login
3. User selects Google account
4. Auth0 redirects to `http://localhost:4200/callback`
5. Frontend gets Auth0 token ✅
6. Frontend calls `/api/auth/auth0/sync` with Auth0 token
7. Backend validates Auth0 token ✅
8. Backend creates user in database ✅
9. Backend returns LOCAL JWT token ✅
10. Frontend stores local token ✅
11. User is redirected to home page ✅
12. Username/profile shows in navbar ✅

---

## 🔍 Debugging Steps:

After implementing the fix, open browser DevTools (F12) and check:

### Console Logs (should see):
```
Auth0 authentication status: true
Auth0 user: {sub: "google-oauth2|...", email: "..."}
✅ Got Auth0 token, syncing with backend...
✅ User synced successfully
```

### Network Tab (should see):
```
POST http://localhost:8080/api/auth/auth0/sync
Status: 200 OK
Response: {
  success: true,
  data: {
    token: "eyJ...",
    user: { email: "...", firstName: "..." }
  }
}
```

### Application Tab → Local Storage:
```
auth_token: "eyJ..."  ← Local JWT token from your backend
current_user: "{...}"  ← User object with firstName, lastName, etc.
```

---

## ❓ Still Not Working?

Check these common issues:

1. **Wrong Callback URL in Auth0**
   - Must be exactly: `http://localhost:4200/callback`
   - No trailing slash

2. **Wrong API Identifier**
   - Must be exactly: `https://stayease-api`
   - Case-sensitive

3. **Social Connection Not Enabled**
   - Auth0 Dashboard → Authentication → Social
   - Enable Google
   - Connect it to your application

4. **Browser Cache**
   - Clear cookies and localStorage
   - Try incognito mode

5. **Backend Not Running**
   - Make sure Spring Boot is running on port 8080
   - Check: http://localhost:8080/actuator/health

---

## 📝 Recommended: Use Solution 1

Creating the API in Auth0 is the proper way and only takes 2 minutes. It's required for:
- ✅ Secure token validation
- ✅ Custom API permissions/scopes
- ✅ Production deployment
- ✅ Multiple applications using same API

Good luck! 🚀
