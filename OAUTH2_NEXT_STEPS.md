# ✅ OAuth2 Configuration Progress

## Status: Google Client ID Added! 🎉

### What's Configured

- ✅ Google Client ID: `457839599348-2bkji0phmcmjfo2h97riogcbth779bng.apps.googleusercontent.com`
- ⏳ Google Client Secret: **NEEDED**
- ⏳ Facebook App ID: Optional (can configure later)
- ⏳ Facebook App Secret: Optional (can configure later)

---

## 🔴 URGENT - Next Step: Get Google Client Secret

### Where to Find It

1. **Go to Google Cloud Console**

   - URL: https://console.cloud.google.com/apis/credentials

2. **Find Your OAuth 2.0 Client**

   - Look for: "StayEase Web Client" (or similar name)
   - Client ID: `457839599348-2bkji0phmcmjfo2h97riogcbth779bng...`

3. **Get the Client Secret**

   - Click on the OAuth client name
   - You'll see: **Client secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxx**
   - Click the copy icon
   - It looks like: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz`

4. **Add to .env File**

   ```bash
   # Open the file
   cd backend
   notepad .env

   # Find this line:
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here

   # Replace with your actual secret:
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

   # Save and close
   ```

---

## 🟢 Optional: Configure Facebook (Can Skip for Now)

If you want Facebook login too, follow these steps:

### Get Facebook Credentials

1. **Go to Facebook Developers**

   - URL: https://developers.facebook.com/apps

2. **Create New App** (if you haven't)

   - Click "Create App"
   - Type: "Authenticate and request data from users with Facebook Login"
   - App name: "StayEase"

3. **Add Facebook Login Product**

   - Dashboard → Add Product → Facebook Login → Set Up

4. **Configure Settings**

   - Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:8080/oauth2/callback/facebook
     http://localhost:8080/login/oauth2/code/facebook
     ```
   - Save Changes

5. **Get Credentials**

   - Settings → Basic
   - Copy **App ID** (number like: 1234567890123456)
   - Click **Show** next to App Secret
   - Copy **App Secret** (string like: abcdef1234567890abcdef1234567890)

6. **Add to .env File**
   ```bash
   FACEBOOK_APP_ID=1234567890123456
   FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
   ```

---

## 🚀 Quick Test (After Adding Google Client Secret)

### 1. Start Backend

```powershell
cd backend
.\mvnw spring-boot:run
```

Wait for: `Started StayeaseApplication in X.XXX seconds`

### 2. Test Google OAuth URL

**Open in browser:**

```
http://localhost:8080/oauth2/authorize/google
```

**Expected:** Should redirect to Google login page ✅

**If error:** Check troubleshooting below 👇

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** Google says the redirect URI doesn't match

**Solution:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth client
3. Under "Authorized redirect URIs", make sure you have EXACTLY:
   ```
   http://localhost:8080/oauth2/callback/google
   http://localhost:8080/login/oauth2/code/google
   ```
4. **Important:**
   - No trailing slashes `/`
   - Use `http://` not `https://` for localhost
   - Exact port `:8080`
5. Click "Save"
6. Wait 1-2 minutes for changes to propagate
7. Try again

### Error: "invalid_client" or "Client authentication failed"

**Problem:** Client secret is wrong or not loaded

**Solution:**

1. Check `.env` file has correct secret
2. Make sure no extra spaces or quotes
3. Restart backend: `Ctrl+C` then `.\mvnw spring-boot:run`
4. Check backend logs for loading confirmation

### Error: "Table 'users' doesn't exist"

**Problem:** Database migration didn't run

**Solution:**

```powershell
cd backend
.\mvnw flyway:migrate
```

Then restart backend.

---

## 📋 Current Configuration Status

### Backend Files

- ✅ `application.yml` - OAuth2 configured
- ✅ `.env` - Google Client ID added
- ⏳ `.env` - Need Google Client Secret
- ⏳ `.env` - Facebook (optional)

### Google Cloud Console

- ✅ Project created
- ✅ OAuth client created
- ✅ Client ID copied
- ⏳ Need to verify redirect URIs
- ⏳ Need to copy Client Secret

### Database

- ✅ Migration files ready (V5\_\_create_users_and_auth_tables.sql)
- ⏳ Need to run migration (will happen on first start)

### Backend Code

- ✅ All 25+ Java files created
- ✅ Entities, Repositories, Services, Controllers
- ✅ Security configuration
- ✅ OAuth2 handlers

---

## ✅ Completion Checklist

- [x] Google Client ID configured
- [ ] Google Client Secret configured **← DO THIS NEXT**
- [ ] Backend started successfully
- [ ] Database migration V5 executed
- [ ] Google OAuth redirect tested
- [ ] User created in database
- [ ] Login activity tracked
- [ ] Facebook configured (optional)

---

## 🎯 Next Actions

**RIGHT NOW:**

1. Get Google Client Secret from: https://console.cloud.google.com/apis/credentials
2. Add to `.env` file
3. Verify redirect URIs are correct
4. Start backend: `.\mvnw spring-boot:run`
5. Test: http://localhost:8080/oauth2/authorize/google

**LATER (Optional):**

- Configure Facebook OAuth
- Create frontend login components
- Test complete authentication flow

---

## 📞 Need Help?

**Google Client Secret Issues:**

- Make sure you're looking at the correct OAuth client
- Client ID should match: `457839599348-2bkji0phmcmjfo2h97riogcbth779bng...`
- Secret starts with `GOCSPX-`

**Can't Find OAuth Client:**

- Go to: https://console.cloud.google.com/
- Make sure correct project is selected (StayEase)
- Navigate to: APIs & Services → Credentials
- Look under "OAuth 2.0 Client IDs"

**Still Stuck:**

- Check `OAUTH2_VISUAL_GUIDE.md` for detailed screenshots
- Review `OAUTH2_QUICKSTART.md` for troubleshooting
- Check backend logs for specific error messages

---

**Current Status:** 🟡 **Waiting for Google Client Secret**

Once you add the secret and restart, you'll be able to test Google OAuth! 🚀
