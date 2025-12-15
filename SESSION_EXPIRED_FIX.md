# Session Expired After Profile Completion - Fix Summary

## ⚠️ UPDATE: Real Root Cause Found!

**The actual root cause was a JWT UUID bug**: The JWT token was storing the database `Long ID` (e.g., `47`) instead of the `publicId` (UUID), causing `IllegalArgumentException: Invalid UUID string: 47` on every authenticated request.

**See**: `JWT_UUID_BUG_FIX.md` for the complete fix.

The fixes below were necessary but incomplete - the UUID bug had to be fixed first for authentication to work at all.

---

## Problem

After signing up locally and completing the profile (adding phone number, picture, and bio), users were getting a "session expired" error and being redirected to login. The console showed:

```
:8080/api/profile/image:1 Failed to load resource: the server responded with a status of 401 ()
```

## Root Cause

There were **TWO issues** causing the 401 Unauthorized error:

### Issue 1: Incorrect Authority Names in @PreAuthorize

The backend `ProfileController` endpoints were using incorrect authority names in `@PreAuthorize` annotations:

- **Expected**: `'USER', 'LANDLORD', 'ADMIN'`
- **Actual roles assigned**: `'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN'`

### Issue 2: JWT Authority Extraction Mismatch (THE REAL CULPRIT)

The `SecurityConfiguration.jwtAuthenticationConverter()` was misconfigured:

- **JWT Token contains**: `"authorities": "ROLE_TENANT"` (from JwtTokenProvider)
- **Spring Security was looking for**: `"permissions"` claim
- **Spring Security was adding**: `"ROLE_"` prefix
- **Result**: Spring extracted `"ROLE_ROLE_TENANT"` instead of `"ROLE_TENANT"` ❌

This mismatch meant Spring Security could never find the correct authorities, causing all authenticated requests to fail with 401.

## Solution Applied

### Backend Changes

#### Fix 1: ProfileController.java

**File**: `backend/src/main/java/com/stayease/domain/user/controller/ProfileController.java`

Updated all `@PreAuthorize` annotations to include the correct role names:

```java
// Before:
@PreAuthorize("hasAnyAuthority('USER', 'LANDLORD', 'ADMIN')")

// After:
@PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
```

Applied to:

- `GET /api/profile` (getProfile)
- `PUT /api/profile` (updateProfile)
- `POST /api/profile/image` (uploadProfileImage)
- `DELETE /api/profile/image` (deleteProfileImage)

#### Fix 2: SecurityConfiguration.java (THE CRITICAL FIX)

**File**: `backend/src/main/java/com/stayease/config/SecurityConfiguration.java`

Fixed the JWT authentication converter to match the JWT token structure:

```java
@Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
    // Use "authorities" claim name (matching JwtTokenProvider)
    grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");
    // Don't add prefix since authorities already have "ROLE_" prefix
    grantedAuthoritiesConverter.setAuthorityPrefix("");

    JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
    return jwtAuthenticationConverter;
}
```

**Changes**:

- Changed claim name from `"permissions"` to `"authorities"` (matches JwtTokenProvider)
- Changed prefix from `"ROLE_"` to `""` (empty string, since roles already have ROLE\_ prefix)

### Frontend Changes

**File**: `frontend/src/app/features/profile/profile-complete.component.ts`

Added a small delay after updating user data to ensure localStorage writes complete before navigation:

```typescript
// Update current user with the refreshed data from backend
this.authService.updateCurrentUser(response.data);

// Small delay to ensure localStorage is written before navigation
setTimeout(() => {
  this.loading.set(false);
  // Navigate based on role
  this.navigateBasedOnRole();
}, 100);
```

## Testing

1. **Restart the backend** (changes to SecurityConfiguration require restart)
2. Sign up with a new local email/password account
3. Complete profile with phone number, picture, and bio
4. Verify successful profile completion and navigation to home page
5. Confirm no "session expired" error occurs
6. Check that user data (including phone, bio, image) is properly saved

## Related Files Modified

- `backend/src/main/java/com/stayease/config/SecurityConfiguration.java` ⭐ **CRITICAL FIX**
- `backend/src/main/java/com/stayease/domain/user/controller/ProfileController.java`
- `frontend/src/app/features/profile/profile-complete.component.ts`

## Technical Details

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "authorities": "ROLE_TENANT",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### JWT Configuration

- **Token expiration**: 24 hours (86,400,000 ms)
- **Token claim for authorities**: `"authorities"`
- **Authority format**: Comma-separated string (e.g., "ROLE_TENANT,ROLE_USER")
- **Token storage**: localStorage under key `'auth_token'`
- **Auth interceptor**: Automatically attaches token to all requests

## Why This Happened

The mismatch occurred because:

1. `JwtTokenProvider.generateToken()` creates a JWT with `"authorities"` claim
2. `SecurityConfiguration.jwtAuthenticationConverter()` was looking for `"permissions"` claim
3. This was likely copied from an Auth0 or OAuth2 example where `"permissions"` is the standard claim name
4. The authority prefix doubling (`ROLE_ROLE_TENANT`) made all authorization checks fail

## Future Considerations

- ✅ JWT token structure and Spring Security configuration are now aligned
- ✅ Authority names are consistent across the application
- Consider adding integration tests for JWT token generation and parsing
- Consider documenting the JWT token structure in API documentation
- Consider adding logging to show extracted authorities during authentication for debugging
