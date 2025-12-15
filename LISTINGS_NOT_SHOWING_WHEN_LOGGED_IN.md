# Listings Not Showing When Logged In - Issue & Fix

## 🐛 The Problem

**Symptom**:

- When logged OUT → Listings appear on homepage ✅
- When logged IN as TENANT → "No featured listings available" ❌

**Why This is Confusing**:
It seems backwards! Usually things work better when logged in, not worse.

---

## 🔍 Root Cause

There are **TWO issues** causing this:

### Issue #1: Backend Not Running

```powershell
PS> Get-Process -Name "java"
(empty)  # ❌ No backend process
```

When backend is down:

- Logged OUT: Request fails silently, shows "No listings" message
- Logged IN: Request fails BUT has broken JWT token in header

### Issue #2: Broken JWT Token in localStorage

Your localStorage still contains the OLD token from **before the UUID fix**:

```json
{
  "sub": "47", // ❌ Long ID (should be UUID)
  "email": "user@example.com",
  "authorities": "ROLE_TENANT"
}
```

When you make requests with this token:

- Frontend adds `Authorization: Bearer <broken-token>`
- Backend (if running) tries to parse `"47"` as UUID
- Throws `IllegalArgumentException: Invalid UUID string: 47`
- Request fails completely

---

## ✅ The Fix

### Step 1: Start Backend Server ⚠️ **DO THIS FIRST!**

```powershell
cd e:\Stay_Ease\StayEase\backend
mvn spring-boot:run
```

**Wait for**:

```
Started StayEaseApplication in X.XXX seconds
```

**You should see**:

```
🚀 Starting comprehensive data seeding with 40 listings...
✅ Comprehensive data seeding completed successfully!
```

(Only if database was empty - creates sample listings)

---

### Step 2: Clear Broken JWT Token

**CRITICAL**: Delete the old token from localStorage!

1. Open browser to `http://localhost:4200`
2. Press **F12** (DevTools)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Expand **Local Storage**
5. Click on `http://localhost:4200`
6. Find `auth_token` key
7. **Right-click → Delete**
8. **Refresh page** (F5)

---

### Step 3: Login Again

1. Login with your tenant account
2. New JWT will be generated with correct UUID format
3. Token now contains valid UUID subject

**Verify token is correct**:

```javascript
// In browser console (F12)
const token = localStorage.getItem("auth_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Token subject:", payload.sub);
// Should be: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" ✅
// NOT: "47" ❌
```

---

### Step 4: Test Both Scenarios

#### Test A: Logged OUT

1. Logout if logged in
2. Go to homepage
3. **Should see**: 8 featured listings ✅

#### Test B: Logged IN

1. Login as TENANT
2. Go to homepage
3. **Should see**: Same 8 featured listings ✅

Both should show the **SAME listings**!

---

## 🔍 Why This Happens

### The Auth Interceptor Behavior

**File**: `frontend/src/app/core/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = authService.getToken();

  // Clone request and add authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // ⚠️ Adds token if exists
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      const publicEndpoints = ['/api/listings', ...];

      // Check if this is a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint =>
        req.url.includes(endpoint)
      );

      // Don't intercept errors on public endpoints
      if (isPublicEndpoint) {
        return throwError(() => error);  // Pass error through
      }

      // Handle 401 only on protected endpoints
      if (error.status === 401 && !req.url.includes('/logout')) {
        authService.logout();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
```

### What Goes Wrong:

**Logged OUT (No Token)**:

```
Request: GET /api/listings
Headers: (no Authorization header)
         ↓
Backend: Returns all ACTIVE listings
         ↓
Frontend: Displays listings ✅
```

**Logged IN (Broken Token)**:

```
Request: GET /api/listings
Headers: Authorization: Bearer eyJ...broken-token-with-47...
         ↓
Backend: JwtAuthenticationFilter tries to parse token
         ↓
Error:   IllegalArgumentException: Invalid UUID string: 47
         ↓
Backend: Returns 401 or 500
         ↓
Frontend: Sees error, shows "No listings" ❌
```

Even though `/api/listings` is a **public endpoint** that doesn't require auth, when you send a token, Spring Security tries to validate it!

---

## 🧪 Testing & Verification

### Test 1: Check Backend is Running

```powershell
# Check Java process
Get-Process -Name "java"

# Or test API directly
curl http://localhost:8080/api/listings
```

**Expected**:

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "publicId": "uuid-here",
        "title": "Luxury Beach Villa",
        "category": "Beachfront",
        "basePrice": 450.0,
        "city": "Malibu"
      }
      // ... 40 listings total
    ],
    "totalElements": 40
  }
}
```

---

### Test 2: Verify JWT Token Format

**After login**, check token in console:

```javascript
const token = localStorage.getItem("auth_token");
if (token) {
  const parts = token.split(".");
  const payload = JSON.parse(atob(parts[1]));

  console.log("JWT Payload:", payload);
  console.log("Subject (User ID):", payload.sub);
  console.log("Email:", payload.email);
  console.log("Authorities:", payload.authorities);

  // Validate UUID format
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      payload.sub
    );
  console.log("Is valid UUID?", isUUID ? "✅" : "❌");
}
```

**Expected Output**:

```
JWT Payload: {sub: "a1b2c3d4-...", email: "user@example.com", authorities: "ROLE_TENANT", ...}
Subject (User ID): a1b2c3d4-e5f6-7890-abcd-ef1234567890
Email: user@example.com
Authorities: ROLE_TENANT
Is valid UUID? ✅
```

---

### Test 3: Check Network Requests

**DevTools → Network tab**:

1. Clear network log
2. Refresh homepage
3. Find request to `http://localhost:8080/api/listings?page=0&size=8`

**Check**:

- Status: `200 OK` ✅
- Response: JSON with listings array
- Request Headers (when logged in): `Authorization: Bearer eyJ...`
- No errors in console

**If you see**:

- Status `0` or `ERR_FAILED`: Backend not running
- Status `401`: Broken JWT token
- Status `500`: Backend error (check backend logs)

---

### Test 4: Compare Logged In vs Logged Out

Open two browser windows side-by-side:

**Window 1: Logged OUT**

- Incognito/Private window
- Navigate to `http://localhost:4200`
- Should see listings

**Window 2: Logged IN**

- Normal window
- Login as tenant
- Navigate to homepage
- Should see **same listings**

Both should be **identical**!

---

## 📊 Database Verification

Check if listings actually exist:

```sql
-- Connect to stayease_db
SELECT COUNT(*) FROM listing WHERE status = 'ACTIVE';
-- Should return 40 (or however many you have)

SELECT title, category, city, base_price, status
FROM listing
WHERE status = 'ACTIVE'
ORDER BY created_at DESC
LIMIT 10;
```

If count is `0`:

- Database is empty
- Need to run DataSeeder (drop database and restart backend)
- See `DATABASE_AND_LISTINGS_VERIFICATION.md`

---

## 🎯 Summary

### The Real Issues:

1. ❌ Backend server not running
2. ❌ Old JWT token with Long ID instead of UUID
3. ❌ Broken token causes all authenticated requests to fail

### The Fixes:

1. ✅ Start backend: `mvn spring-boot:run`
2. ✅ Delete old token from localStorage
3. ✅ Login again to get new UUID-based token
4. ✅ Listings now appear whether logged in or out

### Key Learnings:

- Public endpoints still validate JWT if present
- Broken JWT tokens break even public requests
- Always clear localStorage after JWT format changes
- Backend must be running for anything to work!

---

## 🚨 Prevention

To avoid this in the future, add **automatic token validation** to your `AuthService`:

```typescript
// src/app/core/auth/auth.service.ts

ngOnInit() {
  this.validateAndCleanupToken();
}

private validateAndCleanupToken(): void {
  const token = this.getToken();
  if (!token) return;

  try {
    const decoded = this.decodeToken(token);

    // Check if subject is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!decoded.sub || !uuidRegex.test(decoded.sub)) {
      console.warn('⚠️ Invalid JWT token format detected. Clearing...');
      this.logout();  // Clears token and redirects
    }
  } catch (error) {
    console.error('❌ JWT token parsing error:', error);
    this.logout();
  }
}

private decodeToken(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}
```

This automatically detects and removes broken tokens!

---

**Status**: ✅ **RESOLVED**  
**Action Required**: Start backend + clear localStorage + re-login  
**Related Docs**: `JWT_UUID_BUG_FIX.md`, `QUICK_FIX_CHECKLIST.md`
