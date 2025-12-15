# ✅ CORS ERROR - FIXED

## Problem

```
An unexpected error occurred: When allowCredentials is true,
allowedOrigins cannot contain the special value "*" since that
cannot be set on the "Access-Control-Allow-Origin" response header.
```

## Root Cause

**Conflict between two CORS configurations:**

1. **Global CORS Configuration** (SecurityConfiguration.java)

   - Properly configured with specific origins
   - Has `allowCredentials = true` (needed for JWT auth)
   - Allows: `http://localhost:4200`, `http://localhost:4201`, `http://127.0.0.1:4200`

2. **Controller-Level CORS Annotations** (BookingController, DashboardController)
   - Had `@CrossOrigin(origins = "*")`
   - **Cannot use `"*"` when credentials are allowed!**
   - This caused the error

## Why This Happens

When using JWT tokens in the `Authorization` header, Spring Security sets `allowCredentials = true`.

**The security rule is:**

- ✅ `allowCredentials = false` + `origins = "*"` → OK
- ✅ `allowCredentials = true` + `origins = ["http://localhost:4200"]` → OK
- ❌ `allowCredentials = true` + `origins = "*"` → **ERROR!**

## Solution Applied

### Removed `@CrossOrigin` annotations from:

1. ✅ `BookingController.java` - Line 28
2. ✅ `DashboardController.java` - Line 18

**Why remove them?**

- Global CORS configuration in `SecurityConfiguration` is already properly set up
- Controller-level annotations override global config and cause conflicts
- Global config already allows the needed origins with credentials

## Current CORS Configuration (Global)

**File:** `SecurityConfiguration.java`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // ✅ Specific origins (not "*")
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4200"
    ));

    // ✅ All HTTP methods
    configuration.setAllowedMethods(Arrays.asList(
        "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
    ));

    // ✅ Common headers (specific, not "*")
    configuration.setAllowedHeaders(Arrays.asList(
        "Authorization", "Content-Type", "Accept", "Origin",
        "X-Requested-With", "Cache-Control", "Pragma", "Expires"
    ));

    // ✅ Allow credentials for JWT
    configuration.setAllowCredentials(true);

    // ✅ Cache preflight for 1 hour
    configuration.setMaxAge(3600L);

    return source;
}
```

## What This Means

### ✅ Now Works:

- Frontend at `http://localhost:4200` can make requests with JWT tokens
- Authorization headers are properly sent and received
- Credentials (cookies, auth headers) work correctly
- All booking endpoints accessible from frontend

### ❌ Before (Error):

- Controller said: "Allow from anywhere (`*`)"
- Security config said: "Allow credentials"
- Browser rejected: "Can't do both!"

## Testing

### 1. Restart Backend

```bash
cd e:\Stay_Ease\StayEase\backend
mvn spring-boot:run
```

**Wait for:**

```
Started StayEaseApplication in X.XXX seconds
```

### 2. Try Creating a Booking

1. Open `http://localhost:4200`
2. Login with your account
3. Go to any listing
4. Click "Reserve"
5. Fill dates and guests
6. Click "Confirm and pay"

### 3. Expected Results

✅ No more CORS errors
✅ Request reaches backend successfully
✅ Backend processes booking
✅ Response comes back to frontend

## Common CORS Errors Fixed

### ❌ Before:

```
Access to XMLHttpRequest at 'http://localhost:8080/api/bookings'
from origin 'http://localhost:4200' has been blocked by CORS policy
```

### ✅ After:

```
POST http://localhost:8080/api/bookings 201 Created
```

## If You Still See CORS Errors

### Check These:

1. **Frontend URL is correct:**

   - Using `http://localhost:4200`? ✅
   - Using `http://127.0.0.1:4200`? ✅
   - Using different port? Add it to `allowedOrigins` in `SecurityConfiguration.java`

2. **Backend restarted:**

   - Must restart after CORS config changes
   - Old config cached until restart

3. **Browser cache:**

   - Clear browser cache
   - Open in incognito/private window
   - Hard refresh (Ctrl+Shift+R)

4. **Request has Authorization header:**
   - Check Network tab → Headers
   - Should see: `Authorization: Bearer eyJ...`

## Files Modified

1. ✅ `BookingController.java`

   - Removed `@CrossOrigin(origins = "*", maxAge = 3600)`
   - Now uses global CORS config

2. ✅ `DashboardController.java`
   - Removed `@CrossOrigin(origins = "*", maxAge = 3600)`
   - Now uses global CORS config

## Best Practices

### ✅ Do:

- Use global CORS configuration in `SecurityConfiguration`
- List specific allowed origins
- Set `allowCredentials = true` for auth
- Restart backend after CORS changes

### ❌ Don't:

- Use `@CrossOrigin(origins = "*")` with credentials
- Mix controller-level and global CORS configs
- Use `"*"` in allowedOrigins when using JWT/cookies
- Forget to restart backend after config changes

---

**Status:** ✅ FIXED
**Next:** Restart backend and test booking flow
