# 🎯 OAuth2 Setup - Visual Step-by-Step Guide

## 📋 Prerequisites

- [ ] PostgreSQL installed and running
- [ ] Java 17+ installed
- [ ] Node.js 18+ installed
- [ ] Google account
- [ ] Facebook account

---

## 🔧 Step-by-Step Configuration

### 1️⃣ Google OAuth Setup (5 minutes)

```
┌─────────────────────────────────────────────┐
│  GOOGLE CLOUD CONSOLE                       │
│  https://console.cloud.google.com/          │
└─────────────────────────────────────────────┘
```

**1.1 Create Project**

```
[Select a project] → [New Project]
  Project name: StayEase
  [Create]
```

**1.2 Enable Google+ API**

```
☰ Menu → [APIs & Services] → [Library]
  Search: "Google+ API"
  [Enable]
```

**1.3 Create OAuth Credentials**

```
☰ Menu → [APIs & Services] → [Credentials]
  [+ Create Credentials] → [OAuth client ID]

  Application type: Web application
  Name: StayEase Web Client

  Authorized JavaScript origins:
    [+ Add URI] → http://localhost:4200
    [+ Add URI] → http://localhost:8080

  Authorized redirect URIs:
    [+ Add URI] → http://localhost:8080/oauth2/callback/google
    [+ Add URI] → http://localhost:8080/login/oauth2/code/google

  [Create]
```

**1.4 Copy Credentials**

```
┌──────────────────────────────────────────────┐
│ OAuth client created                         │
├──────────────────────────────────────────────┤
│ Your Client ID:                              │
│ 123456789-abc...xyz.apps.googleusercontent.com
│                                               │
│ Your Client Secret:                          │
│ GOCSPX-abcd...wxyz                           │
│                                               │
│ [Download JSON]  [OK]                        │
└──────────────────────────────────────────────┘

✏️ Copy these values! You'll need them in Step 3
```

---

### 2️⃣ Facebook OAuth Setup (5 minutes)

```
┌─────────────────────────────────────────────┐
│  FACEBOOK DEVELOPERS                         │
│  https://developers.facebook.com/            │
└─────────────────────────────────────────────┘
```

**2.1 Create App**

```
[My Apps] → [Create App]

  Use case:
    ○ Other
    ● Authenticate and request data from users with Facebook Login

  [Next]

  App name: StayEase
  App contact email: your-email@example.com

  [Create App]
```

**2.2 Add Facebook Login**

```
Dashboard → [Add Product]

  Find: "Facebook Login"
  [Set Up]

  Platform: [Web]
  Site URL: http://localhost:4200
  [Save]
```

**2.3 Configure OAuth Settings**

```
☰ Menu → Products → [Facebook Login] → [Settings]

  Client OAuth Settings:
    Valid OAuth Redirect URIs:
      http://localhost:8080/oauth2/callback/facebook
      http://localhost:8080/login/oauth2/code/facebook

  [Save Changes]
```

**2.4 Get App Credentials**

```
☰ Menu → [Settings] → [Basic]

┌──────────────────────────────────────────────┐
│ App ID: 1234567890123456                     │
│                                               │
│ App Secret: [Show] **********************    │
│             abcd1234...wxyz7890              │
└──────────────────────────────────────────────┘

✏️ Copy App ID and App Secret! You'll need them in Step 3
```

---

### 3️⃣ Backend Configuration (2 minutes)

**Option A: Using Interactive Script (Recommended)**

```powershell
cd backend
.\setup-oauth.ps1
```

The script will guide you through entering your credentials.

**Option B: Manual Configuration**

1. Copy the template:

```powershell
cd backend
copy .env.template .env
```

2. Edit `.env` file:

```env
# Replace with your actual credentials
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcd...wxyz

FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcd1234...wxyz7890
```

**⚠️ IMPORTANT**: Never commit `.env` to git!

---

### 4️⃣ Start the Application (3 minutes)

**4.1 Start PostgreSQL**

If using Docker:

```powershell
cd backend
docker-compose up -d
```

Or start your local PostgreSQL service.

**4.2 Start Backend**

```powershell
cd backend
.\mvnw spring-boot:run
```

Wait for:

```
Started StayeaseApplication in X.XXX seconds
```

The first time it runs, Flyway will create these tables:

```
✓ users
✓ user_roles
✓ user_activities
```

**4.3 Start Frontend** (in new terminal)

```powershell
cd frontend
npm install  # First time only
npm start
```

Wait for:

```
** Angular Live Development Server is listening on localhost:4200 **
```

---

### 5️⃣ Test OAuth Flow (2 minutes)

**5.1 Test Google OAuth**

```
Browser → http://localhost:4200

[Sign in with Google]
  ↓
Google Login Page
  ↓
Enter your Google credentials
  ↓
Redirected back to StayEase with JWT token
  ↓
✓ Logged in successfully!
```

**5.2 Test Facebook OAuth**

```
Browser → http://localhost:4200

[Sign in with Facebook]
  ↓
Facebook Login Page
  ↓
Enter your Facebook credentials
  ↓
Redirected back to StayEase with JWT token
  ↓
✓ Logged in successfully!
```

**5.3 Verify in Database**

```sql
-- Connect to PostgreSQL
psql -U postgres -d stayease

-- Check user was created
SELECT id, name, email, provider FROM users;

-- Check user activity was logged
SELECT user_id, activity_type, description, created_at
FROM user_activities
ORDER BY created_at DESC
LIMIT 10;
```

Expected output:

```
 id |    name    |       email        | provider
----+------------+--------------------+----------
  1 | John Doe   | john@gmail.com     | GOOGLE
  2 | Jane Smith | jane@facebook.com  | FACEBOOK
```

---

## 🎨 Visual OAuth Flow Diagram

```
┌─────────────┐
│   Browser   │
│ localhost:  │
│    4200     │
└──────┬──────┘
       │ 1. Click "Sign in with Google"
       │
       ▼
┌─────────────────────┐
│   StayEase Backend  │
│   localhost:8080    │
│ /oauth2/authorize/  │
│       google        │
└──────┬──────────────┘
       │ 2. Redirect to Google
       │
       ▼
┌─────────────────────┐
│   Google OAuth      │
│   accounts.google   │
│   .com/o/oauth2/    │
└──────┬──────────────┘
       │ 3. User logs in
       │
       ▼
┌─────────────────────┐
│   Google Auth       │
│   Response          │
└──────┬──────────────┘
       │ 4. Callback with auth code
       │
       ▼
┌─────────────────────┐
│   StayEase Backend  │
│ /oauth2/callback/   │
│       google        │
│                     │
│ - Verify auth code  │
│ - Get user info     │
│ - Create/update user│
│ - Generate JWT      │
│ - Log activity      │
└──────┬──────────────┘
       │ 5. Redirect with JWT
       │
       ▼
┌─────────────────────┐
│   Frontend          │
│ /oauth2/redirect    │
│   ?token=eyJ...     │
│                     │
│ - Store JWT         │
│ - Fetch user info   │
│ - Navigate to home  │
└─────────────────────┘
       │
       ▼
    ✓ SUCCESS!
```

---

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Database tables created (users, user_roles, user_activities)
- [ ] Google OAuth URL works: `http://localhost:8080/oauth2/authorize/google`
- [ ] Facebook OAuth URL works: `http://localhost:8080/oauth2/authorize/facebook`
- [ ] Google login creates user in database
- [ ] Facebook login creates user in database
- [ ] Login activity is tracked in `user_activities` table
- [ ] JWT token is generated and returned
- [ ] Protected endpoints require authentication

---

## 🐛 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"

```
❌ Error: redirect_uri_mismatch
   The redirect URI in the request does not match
```

**Solution:**

```
1. Check Google Cloud Console
2. Authorized redirect URIs must be EXACTLY:
   http://localhost:8080/oauth2/callback/google
   http://localhost:8080/login/oauth2/code/google

   ⚠️ No trailing slashes!
   ⚠️ Check for typos!
   ⚠️ Use http:// not https:// for localhost
```

### Issue 2: "Client authentication failed"

```
❌ Error: invalid_client
   Client authentication failed
```

**Solution:**

```
1. Verify .env file has correct credentials
2. Make sure no extra spaces or quotes
3. Check Client ID and Secret match exactly
4. Restart backend after changing .env
```

### Issue 3: "Table 'users' doesn't exist"

```
❌ Error: Table 'stayease.users' doesn't exist
```

**Solution:**

```
1. Check Flyway migration status:
   ./mvnw flyway:info

2. If migration didn't run:
   ./mvnw flyway:migrate

3. Verify PostgreSQL is running
4. Check database connection in application-dev.yml
```

### Issue 4: ".env file not loaded"

```
❌ Error: Property GOOGLE_CLIENT_ID not found
```

**Solution:**

```
1. Make sure you're in backend/ directory
2. .env file should be at backend/.env
3. Add spring-dotenv dependency if needed
4. Or use -D flags:
   ./mvnw spring-boot:run -DGOOGLE_CLIENT_ID=xxx -DGOOGLE_CLIENT_SECRET=yyy
```

---

## 📊 Testing API Endpoints

### Test Local Signup

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Expected Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "provider": "LOCAL",
    "roles": ["ROLE_USER"],
    "emailVerified": false
  }
}
```

### Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🚀 Production Deployment

When deploying to production:

1. **Update OAuth Redirect URIs** in Google/Facebook consoles:

   ```
   https://yourdomain.com/oauth2/callback/google
   https://yourdomain.com/oauth2/callback/facebook
   ```

2. **Update application.yml**:

   ```yaml
   app:
     oauth2:
       authorized-redirect-uri: https://yourdomain.com/oauth2/redirect
   ```

3. **Use environment variables** (not .env file):

   - Set via hosting platform (Heroku, AWS, Azure, etc.)
   - Or use secrets management (Vault, AWS Secrets Manager)

4. **Enable HTTPS** everywhere

5. **Update CORS configuration** for your domain

---

## 🎉 Success!

If everything works, you should see:

```
✓ Backend running on http://localhost:8080
✓ Frontend running on http://localhost:4200
✓ Google OAuth working
✓ Facebook OAuth working
✓ Users created in database
✓ Activities tracked
✓ JWT tokens generated

🎊 OAuth2 authentication is fully functional! 🎊
```

---

## 📚 Additional Resources

- Full setup guide: `OAUTH2_SETUP_GUIDE.md`
- Quick reference: `OAUTH2_QUICKSTART.md`
- Environment template: `.env.template`
- Setup script: `setup-oauth.ps1`

Need help? Check the detailed documentation or review the setup guide!
