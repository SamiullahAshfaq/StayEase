# Auth0 Integration Setup Guide

## Overview
StayEase has been configured to use Auth0 for authentication with social login support (Google, Facebook). This guide will help you complete the setup.

## Frontend Configuration ✅ COMPLETED

The following frontend files have been updated to use Auth0:

1. **app.config.ts** - Auth0 provider configured
2. **environment files** - Auth0 configuration added (needs your credentials)
3. **login.component.ts** - Updated to use Auth0 SDK
4. **register.component.ts** - Updated to use Auth0 SDK
5. **auth0-callback.component.ts** - New callback handler created
6. **auth.service.ts** - syncAuth0User method added
7. **app.routes.ts** - `/callback` route added

## Backend Configuration ✅ COMPLETED

The following backend files have been updated:

1. **AuthController.java** - `/api/auth/auth0/sync` endpoint added
2. **AuthService.java** - `syncAuth0User` method implemented
3. **application.yml** - Auth0 JWT resource server configured
4. **SecurityConfiguration.java** - Already supports OAuth2 JWT validation

## Required Steps to Complete Setup

### 1. Create Auth0 Account and Application

1. Go to [Auth0](https://auth0.com) and sign up for a free account
2. Create a new **Single Page Application** in your Auth0 dashboard
3. Note down your:
   - **Domain** (e.g., `dev-abc123.us.auth0.com`)
   - **Client ID** (e.g., `AbC123XyZ456...`)

### 2. Configure Auth0 Application Settings

In your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:4200/callback
```

**Allowed Logout URLs:**
```
http://localhost:4200
```

**Allowed Web Origins:**
```
http://localhost:4200
```

**Allowed Origins (CORS):**
```
http://localhost:4200
```

### 3. Enable Social Connections

In Auth0 Dashboard → Authentication → Social:

1. **Google:**
   - Enable Google connection
   - Add your Google OAuth credentials (or use Auth0's dev keys for testing)

2. **Facebook:**
   - Enable Facebook connection
   - Add your Facebook App credentials (or use Auth0's dev keys for testing)

### 4. Create Auth0 API

1. Go to Applications → APIs in Auth0 Dashboard
2. Create a new API:
   - **Name:** StayEase API
   - **Identifier:** `https://stayease-api` (must match exactly)
   - **Signing Algorithm:** RS256

### 5. Update Frontend Environment Files

Replace the placeholders in these files:

**frontend/src/environments/environment.ts:**
```typescript
auth0: {
  domain: 'YOUR_DOMAIN.auth0.com',  // Replace with your Auth0 domain
  clientId: 'YOUR_CLIENT_ID',        // Replace with your Client ID
  audience: 'https://stayease-api',  // Keep this as is
  redirectUri: window.location.origin + '/callback'
}
```

**frontend/src/environments/environment.development.ts:**
```typescript
auth0: {
  domain: 'YOUR_DOMAIN.auth0.com',  // Replace with your Auth0 domain
  clientId: 'YOUR_CLIENT_ID',        // Replace with your Client ID
  audience: 'https://stayease-api',  // Keep this as is
  redirectUri: 'http://localhost:4200/callback'
}
```

**frontend/src/environments/environment.prod.ts:**
```typescript
auth0: {
  domain: 'YOUR_DOMAIN.auth0.com',     // Replace with your Auth0 domain
  clientId: 'YOUR_CLIENT_ID',           // Replace with your Client ID
  audience: 'https://stayease-api',     // Keep this as is
  redirectUri: 'https://yourdomain.com/callback'  // Replace with production URL
}
```

### 6. Update Backend Configuration

**backend/src/main/resources/application.yml:**
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://YOUR_DOMAIN.auth0.com/  # Replace with your Auth0 domain
          audiences: https://stayease-api              # Keep this as is
```

Or set environment variables:
```bash
export AUTH0_ISSUER_URI=https://YOUR_DOMAIN.auth0.com/
export AUTH0_AUDIENCE=https://stayease-api
```

### 7. Database Roles Setup

Ensure the `authority` table has the required roles:

```sql
INSERT INTO authority (name, description) VALUES 
('ROLE_TENANT', 'Default role for tenants looking for properties'),
('ROLE_LANDLORD', 'Role for landlords listing properties'),
('ROLE_ADMIN', 'Administrator role')
ON CONFLICT (name) DO NOTHING;
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Start Frontend
```bash
cd frontend
npm start
```

### 3. Test Login Flow

1. Navigate to `http://localhost:4200/login`
2. Click "Continue with Google" or "Continue with Facebook"
3. You'll be redirected to Auth0's login page
4. Complete authentication with your social account
5. You'll be redirected to `/callback` which will:
   - Get the Auth0 JWT token
   - Sync user data with backend (`/api/auth/auth0/sync`)
   - Redirect to home page or profile completion

## How It Works

### Authentication Flow

1. **User clicks social login button** → `auth0.loginWithRedirect()` called
2. **Redirected to Auth0** → User authenticates with Google/Facebook
3. **Auth0 redirects to `/callback`** → Auth0CallbackComponent handles it
4. **Get Auth0 token** → `auth0.getAccessTokenSilently()`
5. **Sync with backend** → POST to `/api/auth/auth0/sync` with user data
6. **Backend creates/updates user** → Returns UserDTO with authorities
7. **Frontend stores data** → localStorage, signals updated
8. **User logged in** → Redirected to home/profile

### JWT Token Flow

- Auth0 issues JWT tokens signed with RS256
- Frontend attaches token to API requests via HTTP interceptor
- Backend validates JWT signature using Auth0's public keys (JWKS)
- Backend extracts user info from JWT claims
- RBAC enforced via `@PreAuthorize` annotations

## Troubleshooting

### "Invalid token" errors
- Verify `issuer-uri` matches your Auth0 domain exactly
- Ensure API audience matches in both frontend and backend
- Check Auth0 API is created with identifier `https://stayease-api`

### "CORS errors"
- Verify Allowed Origins in Auth0 app settings
- Check backend CORS configuration includes `http://localhost:4200`

### "User not synced"
- Check backend logs for `/api/auth/auth0/sync` endpoint
- Verify database has ROLE_TENANT in authority table
- Ensure Auth0 user has email claim

### Social login not working
- Verify connections are enabled in Auth0 dashboard
- Check social provider credentials (Google/Facebook app settings)
- For dev testing, Auth0's dev keys should work

## Security Notes

- Auth0 handles password security and social OAuth flows
- Tokens are stateless JWT - no server-side sessions needed
- RBAC is enforced on backend via Spring Security
- Tokens expire after configured time (default: 24 hours)
- Logout only clears frontend localStorage (JWT is stateless)

## Next Steps

After completing setup:

1. Test all authentication flows
2. Add role-based features (tenant vs landlord)
3. Configure email verification rules in Auth0
4. Set up production Auth0 tenant
5. Configure custom domain for Auth0 (optional)
6. Add multi-factor authentication (optional)

## Support

- Auth0 Documentation: https://auth0.com/docs
- Spring Security OAuth2: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
- @auth0/auth0-angular: https://github.com/auth0/auth0-angular

---

**Status:** Backend ✅ | Frontend ✅ | Awaiting Auth0 Credentials ⏳
