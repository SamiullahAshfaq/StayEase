# OAuth2 Setup Progress Checklist

Use this checklist to track your OAuth2 configuration progress.

## 📅 Date Started: ******\_\_\_******

---

## Phase 1: Get OAuth Credentials ⏱️ 10 minutes

### Google OAuth Setup

- [ ] Opened Google Cloud Console (https://console.cloud.google.com/)
- [ ] Created project "StayEase"
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID (Web application)
- [ ] Added authorized JavaScript origins:
  - [ ] http://localhost:4200
  - [ ] http://localhost:8080
- [ ] Added authorized redirect URIs:
  - [ ] http://localhost:8080/oauth2/callback/google
  - [ ] http://localhost:8080/login/oauth2/code/google
- [ ] Copied Client ID: ****************\_\_\_\_****************
- [ ] Copied Client Secret: ****************\*\*****************

### Facebook OAuth Setup

- [ ] Opened Facebook Developers (https://developers.facebook.com/)
- [ ] Created app "StayEase"
- [ ] Selected use case: "Authenticate and request data from users"
- [ ] Added Facebook Login product
- [ ] Configured OAuth redirect URIs:
  - [ ] http://localhost:8080/oauth2/callback/facebook
  - [ ] http://localhost:8080/login/oauth2/code/facebook
- [ ] Copied App ID: ****************\_\_\_\_****************
- [ ] Copied App Secret: ****************\*\*****************

---

## Phase 2: Backend Configuration ⏱️ 2 minutes

### Option A: Interactive Script (Recommended)

- [ ] Opened PowerShell in backend directory
- [ ] Ran: `.\setup-oauth.ps1`
- [ ] Entered Google Client ID
- [ ] Entered Google Client Secret
- [ ] Entered Facebook App ID
- [ ] Entered Facebook App Secret
- [ ] Verified `.env` file was created

### Option B: Manual Configuration

- [ ] Copied `.env.template` to `.env`
- [ ] Opened `.env` in text editor
- [ ] Replaced `GOOGLE_CLIENT_ID` with actual value
- [ ] Replaced `GOOGLE_CLIENT_SECRET` with actual value
- [ ] Replaced `FACEBOOK_APP_ID` with actual value
- [ ] Replaced `FACEBOOK_APP_SECRET` with actual value
- [ ] Saved `.env` file
- [ ] Verified no extra spaces or quotes

### Verify .gitignore

- [ ] Confirmed `.env` is in `.gitignore`
- [ ] Confirmed `.env` will NOT be committed to git

---

## Phase 3: Database Setup ⏱️ 2 minutes

### PostgreSQL

- [ ] PostgreSQL is installed
- [ ] PostgreSQL service is running
- [ ] Database "stayease" exists
- [ ] Can connect to database

### Using Docker (Optional)

- [ ] Docker is installed
- [ ] Ran: `cd backend && docker-compose up -d`
- [ ] PostgreSQL container is running

---

## Phase 4: Start Application ⏱️ 3 minutes

### Backend

- [ ] Opened terminal in backend directory
- [ ] Ran: `.\mvnw spring-boot:run`
- [ ] Backend started without errors
- [ ] Saw message: "Started StayeaseApplication in X.XXX seconds"
- [ ] Flyway migration V5 executed successfully
- [ ] Checked logs for errors: ********\_\_\_\_********

### Frontend

- [ ] Opened new terminal in frontend directory
- [ ] Ran: `npm install` (first time only)
- [ ] Ran: `npm start`
- [ ] Frontend started without errors
- [ ] Saw message: "Angular Live Development Server is listening"
- [ ] Browser opened at http://localhost:4200

---

## Phase 5: Verify Database Tables ⏱️ 2 minutes

- [ ] Connected to PostgreSQL database
- [ ] Verified `users` table exists
- [ ] Verified `user_roles` table exists
- [ ] Verified `user_activities` table exists
- [ ] Verified `flyway_schema_history` shows V5 migration

### SQL Verification Commands

```sql
-- Run these commands
\dt  -- List all tables
SELECT * FROM flyway_schema_history WHERE version = '5';
DESCRIBE users;
```

- [ ] All tables present: ✅ / ❌
- [ ] Notes: ****************\_****************

---

## Phase 6: Test OAuth Flows ⏱️ 5 minutes

### Test Google OAuth

- [ ] Opened browser at http://localhost:4200
- [ ] Found "Sign in with Google" button
- [ ] Clicked "Sign in with Google"
- [ ] Redirected to Google login page
- [ ] Entered Google credentials
- [ ] Granted permissions
- [ ] Redirected back to StayEase
- [ ] Received JWT token
- [ ] Logged in successfully
- [ ] User created in database

### Test Facebook OAuth

- [ ] Found "Sign in with Facebook" button
- [ ] Clicked "Sign in with Facebook"
- [ ] Redirected to Facebook login page
- [ ] Entered Facebook credentials
- [ ] Granted permissions
- [ ] Redirected back to StayEase
- [ ] Received JWT token
- [ ] Logged in successfully
- [ ] User created in database

### Test Local Authentication

- [ ] Tried signup with email/password
- [ ] Signup successful
- [ ] Tried login with email/password
- [ ] Login successful
- [ ] JWT token received

---

## Phase 7: Verify Activity Tracking ⏱️ 2 minutes

### Check User Activities

```sql
SELECT user_id, activity_type, description, created_at
FROM user_activities
ORDER BY created_at DESC
LIMIT 10;
```

- [ ] LOGIN activities recorded
- [ ] REGISTER activities recorded (if tested local signup)
- [ ] Each activity has IP address
- [ ] Each activity has user agent
- [ ] Each activity has timestamp
- [ ] Activities linked to correct user

---

## Phase 8: Test API Endpoints ⏱️ 5 minutes

### Using Browser Dev Tools / Postman / cURL

#### Test Signup

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

- [ ] Status: 200 OK
- [ ] Received JWT token
- [ ] Received user object

#### Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

- [ ] Status: 200 OK
- [ ] Received JWT token

#### Test Get Current User

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

- [ ] Status: 200 OK
- [ ] Received user data

#### Test Get Activities

```bash
curl -X GET http://localhost:8080/api/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

- [ ] Status: 200 OK
- [ ] Received activity list

---

## Phase 9: Troubleshooting (If Needed)

### Common Issues Encountered

#### Issue 1: redirect_uri_mismatch

- [ ] Encountered: Yes / No
- [ ] Solution applied: **************\_\_\_**************
- [ ] Resolved: Yes / No

#### Issue 2: Client authentication failed

- [ ] Encountered: Yes / No
- [ ] Solution applied: **************\_\_\_**************
- [ ] Resolved: Yes / No

#### Issue 3: Table doesn't exist

- [ ] Encountered: Yes / No
- [ ] Solution applied: **************\_\_\_**************
- [ ] Resolved: Yes / No

#### Issue 4: .env not loaded

- [ ] Encountered: Yes / No
- [ ] Solution applied: **************\_\_\_**************
- [ ] Resolved: Yes / No

#### Other Issues

- Issue: ********************\_\_\_********************
- Solution: ******************\_\_\_\_******************
- Resolved: Yes / No

---

## Phase 10: Final Verification ✅

### Overall System Check

- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Database tables created and populated
- [ ] Google OAuth fully functional
- [ ] Facebook OAuth fully functional
- [ ] Local authentication working
- [ ] JWT tokens generated correctly
- [ ] User activities tracked properly
- [ ] Protected endpoints require authentication
- [ ] All API endpoints tested successfully

### Performance Check

- [ ] Login response time: < 2 seconds
- [ ] OAuth redirect time: < 3 seconds
- [ ] Database queries executing fast
- [ ] No memory leaks detected
- [ ] No console errors in browser

---

## 📊 Summary

### Time Taken

- Phase 1 (OAuth Credentials): **\_** minutes
- Phase 2 (Configuration): **\_** minutes
- Phase 3 (Database): **\_** minutes
- Phase 4 (Start App): **\_** minutes
- Phase 5 (Verify DB): **\_** minutes
- Phase 6 (Test OAuth): **\_** minutes
- Phase 7 (Activity Tracking): **\_** minutes
- Phase 8 (API Testing): **\_** minutes
- Phase 9 (Troubleshooting): **\_** minutes
- **Total Time**: **\_** minutes

### Issues Encountered

Total issues: **\_**

- Critical: **\_**
- Major: **\_**
- Minor: **\_**

### Overall Status

- [ ] ✅ All phases complete
- [ ] ⚠️ Partial completion (specify): ******\_\_******
- [ ] ❌ Blocked (specify): **********\_\_\_**********

---

## 🎉 Completion

### Sign-off

- Configured by: **************\_\_\_\_**************
- Date completed: **************\_\_\_**************
- Time completed: **************\_\_\_**************

### Notes

```
Additional notes or observations:




```

### Next Steps

- [ ] Deploy to staging environment
- [ ] Update frontend Angular components
- [ ] Add user profile page
- [ ] Implement password reset
- [ ] Add email verification
- [ ] Configure production OAuth URLs
- [ ] Set up monitoring and logging
- [ ] Create user documentation

---

## 📸 Screenshots (Optional)

Attach screenshots for reference:

- [ ] Google Cloud Console - OAuth credentials
- [ ] Facebook Developers - App settings
- [ ] Backend logs - Successful startup
- [ ] Database - User table with OAuth users
- [ ] Database - User activities
- [ ] Frontend - Google login flow
- [ ] Frontend - Facebook login flow
- [ ] API response - JWT token

---

**Status**: 🟢 Complete | 🟡 In Progress | 🔴 Blocked

**Current Status**: ******\_******

---

_Keep this checklist for future reference or when setting up other environments (staging, production)_
