# OAuth2 Configuration Guide - Quick Start

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: "StayEase"
3. **Enable Google+ API**:
   - APIs & Services → Library → Search "Google+ API" → Enable
4. **Create Credentials**:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Name: **StayEase Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:4200
     http://localhost:8080
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8080/oauth2/callback/google
     http://localhost:8080/login/oauth2/code/google
     ```
5. **Copy Credentials**: You'll get a Client ID and Client Secret

### Step 2: Get Facebook OAuth Credentials

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create App**:
   - My Apps → Create App
   - Use case: **Authenticate and request data from users with Facebook Login**
   - App name: **StayEase**
3. **Add Facebook Login**:
   - Add Product → Facebook Login → Set Up
   - Platform: **Web**
   - Site URL: `http://localhost:4200`
4. **Configure OAuth Settings**:
   - Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:8080/oauth2/callback/facebook
     http://localhost:8080/login/oauth2/code/facebook
     ```
   - Save Changes
5. **Get Credentials**:
   - Settings → Basic
   - Copy **App ID** and **App Secret**

### Step 3: Configure Backend

1. **Copy environment template**:

   ```bash
   cd backend
   cp .env.template .env
   ```

2. **Edit `.env` file** and replace the values:

   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

   FACEBOOK_APP_ID=1234567890123456
   FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
   ```

3. **Alternative: Direct application.yml** (not recommended for production):
   ```yaml
   spring:
     security:
       oauth2:
         client:
           registration:
             google:
               client-id: YOUR_ACTUAL_CLIENT_ID_HERE
               client-secret: YOUR_ACTUAL_CLIENT_SECRET_HERE
   ```

### Step 4: Run the Application

```bash
# Make sure PostgreSQL is running
# Check docker-compose.yml or start your local PostgreSQL

# Run backend
cd backend
./mvnw spring-boot:run

# In another terminal, run frontend
cd frontend
npm install
npm start
```

### Step 5: Test OAuth Flow

1. **Open browser**: http://localhost:4200
2. **Navigate to login page**
3. **Click "Sign in with Google"** → Should redirect to Google login
4. **Click "Sign in with Facebook"** → Should redirect to Facebook login
5. **After successful login** → Redirected back to app with JWT token

---

## 🔍 Verify Configuration

### Test Google OAuth URL

Open in browser:

```
http://localhost:8080/oauth2/authorize/google
```

Should redirect to Google login page.

### Test Facebook OAuth URL

Open in browser:

```
http://localhost:8080/oauth2/authorize/facebook
```

Should redirect to Facebook login page.

---

## 🛠️ Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution**: Make sure redirect URIs in Google/Facebook console exactly match:

- `http://localhost:8080/oauth2/callback/google`
- `http://localhost:8080/oauth2/callback/facebook`

### Error: "Client authentication failed"

**Solution**: Check that Client ID and Client Secret are correct in `.env` or `application.yml`

### Error: "OAuth2SecurityConfig not loading"

**Solution**: Make sure `app.oauth2.enabled=true` in `application.yml`

### Error: "Table 'users' doesn't exist"

**Solution**: Make sure Flyway migration ran successfully:

```bash
./mvnw flyway:info
./mvnw flyway:migrate
```

---

## 📊 Database Check

After first run, verify tables were created:

```sql
-- Connect to PostgreSQL
psql -U postgres -d stayease

-- Check tables
\dt

-- Should see:
-- users
-- user_roles
-- user_activities
-- flyway_schema_history
```

---

## 🔐 Security Notes

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** in production
3. **Enable HTTPS** in production
4. **Update redirect URIs** for production domain
5. **Rotate secrets** regularly

---

## 📝 Quick Reference

### Backend Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /oauth2/authorize/google` - Start Google OAuth
- `GET /oauth2/authorize/facebook` - Start Facebook OAuth

### Frontend Integration

```typescript
// Start Google OAuth
window.location.href = "http://localhost:8080/oauth2/authorize/google";

// Start Facebook OAuth
window.location.href = "http://localhost:8080/oauth2/authorize/facebook";
```

### Test with cURL

```bash
# Local signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Local login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Google OAuth credentials obtained
- [ ] Facebook App created
- [ ] Facebook OAuth credentials obtained
- [ ] `.env` file created and configured
- [ ] PostgreSQL running
- [ ] Backend started successfully
- [ ] Migration V5 executed
- [ ] Tables created (users, user_roles, user_activities)
- [ ] Google OAuth tested
- [ ] Facebook OAuth tested
- [ ] User activities tracked in database

---

## 🎯 Next Steps After Configuration

1. **Create Frontend Auth Service** (See OAUTH2_SETUP_GUIDE.md)
2. **Add OAuth buttons to login page**
3. **Create OAuth2 redirect component**
4. **Test complete authentication flow**
5. **Add user profile page**
6. **Test activity tracking**

---

## 📞 Need Help?

Check the detailed guide: `OAUTH2_SETUP_GUIDE.md`

Common issues and solutions are documented there with screenshots and detailed explanations.
