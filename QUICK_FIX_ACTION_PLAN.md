# 🚨 QUICK FIX - Run This Now!

## **Step 1: Clear Everything**

Open browser console (F12 → Console) and run:

```javascript
localStorage.clear();
console.log("✅ Storage cleared");
location.reload();
```

## **Step 2: Login**

1. Go to login page
2. Login with your credentials
3. **Watch the console** - you should see:

   ```
   [Interceptor] POST .../api/auth/login
   [Interceptor] Token exists: false

   Login successful

   [Interceptor] GET .../api/listings
   [Interceptor] Token exists: true
   [Interceptor] Token preview: eyJhbGci...
   ```

## **Step 3: Verify in Network Tab**

1. F12 → **Network** tab
2. Click any request to `/api/listings`
3. Click **Headers** tab
4. Look for **Request Headers** section

**You MUST see:**

```
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

**If you DON'T see the Authorization header:**

- Token is not being attached
- Check console logs for `[Interceptor] Token exists: false`
- This means token is not in localStorage under `auth_token`

## **Step 4: What Changed?**

### ✅ **Fix #1: Interceptor Won't Auto-Logout Anymore**

**Before:**

- 401 on `/api/listings` → Auto-logout → Redirect to login 😢

**After:**

- 401 on `/api/listings` → Log warning → Pass error through → Stay logged in ✅

### ✅ **Fix #2: No More NG0100 Errors**

**Before:**

```
ExpressionChangedAfterItHasBeenCheckedError
Header component auth state changing mid-render
```

**After:**

- State updates deferred to next change detection cycle
- No more Angular errors ✅

### ✅ **Fix #3: Debug Logging**

You'll now see detailed logs for every request:

```
[Interceptor] GET http://localhost:8080/api/listings
[Interceptor] Token exists: true
[Interceptor] Token preview: eyJhbGci...
```

---

## 🎯 **What Should Happen After Login:**

1. **Login Page:**

   - Enter email/password
   - Click login
   - Console shows: `Token exists: false` (on login request)
   - Backend returns JWT token

2. **After Login:**

   - Token stored in `localStorage.auth_token`
   - Redirect to home page
   - Console shows: `Token exists: true` (on all requests)
   - Listings load successfully ✅

3. **Subsequent Requests:**
   - Every request has `Authorization: Bearer <token>` header
   - Backend authenticates successfully
   - No 401 errors on authenticated requests

---

## ❌ **If Still Getting 401s:**

### **Scenario A: Token Not Attached**

**Console Shows:**

```
[Interceptor] GET /api/listings
[Interceptor] Token exists: false  ← Problem!
```

**Solution:**

```javascript
// Check if token is stored
console.log("Token:", localStorage.getItem("auth_token"));

// If null, login didn't work - check backend response
```

### **Scenario B: Token Invalid/Expired**

**Console Shows:**

```
[Interceptor] Token exists: true
[Interceptor] Token preview: eyJhbGci...
GET /api/listings → 401
```

**Solution:**

```javascript
// Decode token to check expiry
const token = localStorage.getItem("auth_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Token subject (publicId):", payload.sub);
console.log("Token expiry:", new Date(payload.exp * 1000));
console.log("Token expired?", Date.now() >= payload.exp * 1000);
```

### **Scenario C: Backend Rejecting Token**

**Check backend logs for:**

```
UsernameNotFoundException: User not found with publicId: <uuid>
```

**If you see this:**

- Backend is receiving the token
- But can't find user by publicId
- Check database: `SELECT * FROM users WHERE public_id = '<uuid>';`

---

## 🎉 **Success Checklist:**

- [ ] Cleared localStorage
- [ ] Logged in fresh
- [ ] Console shows `Token exists: true` on requests
- [ ] Network tab shows `Authorization: Bearer ...` header
- [ ] Listings load when logged in
- [ ] No NG0100 errors in console
- [ ] No auto-logout on page navigation
- [ ] `isAuthenticated` stays `true` after login

---

## 🆘 **Still Having Issues?**

Share these details:

1. **Console logs** (after clearing and re-logging in)
2. **Network tab** screenshot showing request headers
3. **Backend logs** (look for JWT errors)

**Most likely issue if still failing:**

- Backend needs restart to pick up code changes
- Old JWT still cached somewhere

**Nuclear option:**

```javascript
// Complete reset
localStorage.clear();
sessionStorage.clear();
// Clear cookies manually in DevTools → Application → Cookies
// Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

**Run the steps above and check if listings load when logged in!** 🚀
