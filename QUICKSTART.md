# Auth0 Integration - Quick Start

## ✅ What's Done

All code changes for Auth0 integration are **COMPLETE**. The application is ready to use Auth0 once you provide credentials.

### Backend ✅
- Auth0 JWT validation configured
- `/api/auth/auth0/sync` endpoint created
- User sync logic implemented
- RBAC maintained

### Frontend ✅
- Auth0 Angular SDK configured
- Login/Register components updated
- Callback handler created
- User sync mechanism implemented

---

## ⚡ Next Steps (5 minutes)

### 1. Get Auth0 Credentials

1. Go to https://auth0.com (sign up if needed - it's free)
2. Create a new **Single Page Application**
3. Copy these values:
   - **Domain:** (looks like `dev-abc123.us.auth0.com`)
   - **Client ID:** (long string like `AbC123XyZ...`)

### 2. Configure Auth0 App

In your Auth0 app settings, paste:

```
Allowed Callback URLs:
http://localhost:4200/callback

Allowed Logout URLs:
http://localhost:4200

Allowed Web Origins:
http://localhost:4200
```

### 3. Create Auth0 API

In Auth0 Dashboard → APIs → Create API:
```
Name: StayEase API
Identifier: https://stayease-api
```

### 4. Enable Social Connections

In Auth0 Dashboard → Authentication → Social:
- ✅ Enable Google
- ✅ Enable Facebook
- (Use Auth0's dev keys for testing)

### 5. Update Config Files

**Replace these 4 placeholders:**

#### Frontend: `frontend/src/environments/environment.development.ts`
```typescript
auth0: {
  domain: 'YOUR_DOMAIN.auth0.com',     // ← Paste your domain here
  clientId: 'YOUR_CLIENT_ID',           // ← Paste your client ID here
  audience: 'https://stayease-api',
  redirectUri: 'http://localhost:4200/callback'
}
```

#### Backend: `backend/src/main/resources/application.yml`
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://YOUR_DOMAIN.auth0.com/  # ← Paste your domain
          audiences: https://stayease-api
```

### 6. Start & Test

```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm start
```

**Test:**
1. Open http://localhost:4200/login
2. Click "Continue with Google"
3. Complete Auth0 login
4. You should be redirected and logged in ✅

---

## 📁 Files You Need to Edit

Only **2 files** need your credentials:

1. `frontend/src/environments/environment.development.ts` (lines 10-11)
2. `backend/src/main/resources/application.yml` (line 49)

Search for `YOUR_AUTH0_DOMAIN` and `YOUR_CLIENT_ID` and replace them.

---

## 🔍 Troubleshooting

### "Invalid token" error
- Check `issuer-uri` matches your Auth0 domain exactly
- Ensure API identifier is `https://stayease-api`

### "CORS error"
- Verify callback URLs in Auth0 app settings
- Ensure `http://localhost:4200` is in Allowed Origins

### Social login button does nothing
- Check browser console for errors
- Verify Auth0 credentials are correct
- Ensure social connections are enabled in Auth0

---

## 📚 Full Documentation

- **Setup Guide:** `AUTH0_SETUP.md` - Detailed step-by-step
- **Implementation Details:** `AUTH0_IMPLEMENTATION.md` - Technical overview
- **This File:** Quick start only

---

## ✨ Features Ready to Use

Once credentials are added:

✅ Google login  
✅ Facebook login  
✅ Automatic user creation  
✅ Profile sync (name, email, picture)  
✅ JWT authentication  
✅ Role-based access (TENANT/LANDLORD/ADMIN)  
✅ Email verification (via Auth0)  

---

## 🎯 Summary

1. Create Auth0 account (2 min)
2. Create app and API (2 min)
3. Copy credentials into 2 files (1 min)
4. Start servers and test (1 min)

**Total time: ~5 minutes** ⏱️

---

**Status:** Code Complete ✅ | Credentials Needed ⏳

Need help? See `AUTH0_SETUP.md` for detailed instructions.
