# OAuth2 Authentication Setup Guide

## Overview

This guide will walk you through setting up Google and Facebook OAuth2 authentication for the StayEase application.

## Backend Setup Complete ✅

The following backend components have been successfully created:

### 1. Database Schema

- ✅ `users` table - Stores user information
- ✅ `user_roles` table - Stores user roles (ROLE_USER, ROLE_HOST, ROLE_ADMIN)
- ✅ `user_activities` table - Tracks all user activities
- ✅ Flyway migration: `V5__create_users_and_auth_tables.sql`

### 2. Entities

- ✅ `User.java` - Main user entity with OAuth fields
- ✅ `UserActivity.java` - Activity tracking entity
- ✅ `AuthProvider.java` - Enum (LOCAL, GOOGLE, FACEBOOK)
- ✅ `Role.java` - Enum (ROLE_USER, ROLE_HOST, ROLE_ADMIN)
- ✅ `ActivityType.java` - Enum (30+ activity types)

### 3. Repositories

- ✅ `UserRepository.java` - User data access
- ✅ `UserActivityRepository.java` - Activity data access

### 4. DTOs

- ✅ `SignUpRequest.java` - Registration request
- ✅ `LoginRequest.java` - Login request
- ✅ `AuthResponse.java` - Authentication response with JWT
- ✅ `UserResponse.java` - User information response
- ✅ `UserActivityResponse.java` - Activity response
- ✅ `ApiResponse.java` - Generic API response wrapper

### 5. Security Components

- ✅ `OAuth2UserPrincipal.java` - User principal for authentication
- ✅ `OAuth2JwtTokenProvider.java` - JWT token generation/validation
- ✅ `CustomUserDetailsService.java` - Load user by email/id
- ✅ `CustomOAuth2UserService.java` - Handle OAuth2 login
- ✅ `TokenAuthenticationFilter.java` - JWT filter
- ✅ `OAuth2UserInfo.java` - Abstract OAuth2 user info
- ✅ `GoogleOAuth2UserInfo.java` - Google user info parser
- ✅ `FacebookOAuth2UserInfo.java` - Facebook user info parser
- ✅ `OAuth2UserInfoFactory.java` - Factory for OAuth2 user info
- ✅ `OAuth2AuthenticationSuccessHandler.java` - Handle successful OAuth login
- ✅ `OAuth2AuthenticationFailureHandler.java` - Handle failed OAuth login
- ✅ `OAuth2SecurityConfig.java` - Security configuration

### 6. Services

- ✅ `UserService.java` - User management
- ✅ `UserActivityService.java` - Activity logging and retrieval

### 7. Controllers

- ✅ `AuthController.java` - Authentication endpoints
  - POST `/api/auth/login` - Local login
  - POST `/api/auth/signup` - Local registration
  - GET `/api/auth/me` - Get current user
  - POST `/api/auth/logout` - Logout
- ✅ `UserActivityController.java` - Activity endpoints
  - GET `/api/activities` - Get user activities
  - GET `/api/activities/type/{activityType}` - Get by type
  - GET `/api/activities/range` - Get by date range

---

## Configuration Steps

### Step 1: Update application.yml

Add the following OAuth2 configuration to `backend/src/main/resources/application.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_CLIENT_SECRET
            scope:
              - email
              - profile
          facebook:
            client-id: YOUR_FACEBOOK_APP_ID
            client-secret: YOUR_FACEBOOK_APP_SECRET
            scope:
              - email
              - public_profile

# Enable OAuth2 security configuration
app:
  oauth2:
    enabled: true
    authorized-redirect-uri: http://localhost:4200/oauth2/redirect
```

### Step 2: Google OAuth Setup

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)

   - Click "Select a project" → "New Project"
   - Name: "StayEase"
   - Click "Create"

3. **Enable Google+ API**

   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "StayEase Web Client"

5. **Configure Authorized URLs**
   - Authorized JavaScript origins:
     - `http://localhost:4200`
     - `http://localhost:8080`
   - Authorized redirect URIs:
     - `http://localhost:8080/oauth2/callback/google`
     - `http://localhost:8080/login/oauth2/code/google`
6. **Get Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Add them to `application.yml`:
     ```yaml
     google:
       client-id: YOUR_GOOGLE_CLIENT_ID_HERE
       client-secret: YOUR_GOOGLE_CLIENT_SECRET_HERE
     ```

### Step 3: Facebook OAuth Setup

1. **Go to Facebook Developers**

   - Visit: https://developers.facebook.com/

2. **Create a New App**

   - Click "My Apps" → "Create App"
   - Use case: "Authenticate and request data from users with Facebook Login"
   - App name: "StayEase"
   - App contact email: your email
   - Click "Create App"

3. **Add Facebook Login**

   - In the dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"
   - Select "Web" as platform
   - Site URL: `http://localhost:4200`

4. **Configure OAuth Settings**

   - Go to "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs:
     - `http://localhost:8080/oauth2/callback/facebook`
     - `http://localhost:8080/login/oauth2/code/facebook`
   - Click "Save Changes"

5. **Get App Credentials**

   - Go to "Settings" → "Basic"
   - Copy the **App ID** and **App Secret**
   - Add them to `application.yml`:
     ```yaml
     facebook:
       client-id: YOUR_FACEBOOK_APP_ID_HERE
       client-secret: YOUR_FACEBOOK_APP_SECRET_HERE
     ```

6. **Make App Public** (for production)
   - Currently in "Development Mode"
   - For production: Go to "Settings" → "Basic" → Toggle "App Mode" to "Live"

### Step 4: Run Database Migration

```bash
# Navigate to backend directory
cd backend

# Run the application - Flyway will automatically run migrations
./mvnw spring-boot:run
```

The Flyway migration `V5__create_users_and_auth_tables.sql` will:

- Create `users` table
- Create `user_roles` table
- Create `user_activities` table
- Create all necessary indexes

### Step 5: Test OAuth Flow

1. **Start Backend**

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start Frontend** (in another terminal)

   ```bash
   cd frontend
   npm start
   ```

3. **Test Google Login**

   - Navigate to: `http://localhost:4200/login`
   - Click "Sign in with Google"
   - You should be redirected to Google login
   - After successful login, you'll be redirected back with a JWT token

4. **Test Facebook Login**
   - Navigate to: `http://localhost:4200/login`
   - Click "Sign in with Facebook"
   - You should be redirected to Facebook login
   - After successful login, you'll be redirected back with a JWT token

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description               | Auth Required |
| ------ | ------------------ | ------------------------- | ------------- |
| POST   | `/api/auth/signup` | Register new user         | No            |
| POST   | `/api/auth/login`  | Login with email/password | No            |
| GET    | `/api/auth/me`     | Get current user          | Yes           |
| POST   | `/api/auth/logout` | Logout user               | Yes           |

### OAuth2

| Method | Endpoint                     | Description               |
| ------ | ---------------------------- | ------------------------- |
| GET    | `/oauth2/authorize/google`   | Start Google OAuth flow   |
| GET    | `/oauth2/authorize/facebook` | Start Facebook OAuth flow |
| GET    | `/oauth2/callback/google`    | Google callback           |
| GET    | `/oauth2/callback/facebook`  | Facebook callback         |

### User Activities

| Method | Endpoint                      | Description                     | Auth Required |
| ------ | ----------------------------- | ------------------------------- | ------------- |
| GET    | `/api/activities`             | Get user activities (paginated) | Yes           |
| GET    | `/api/activities/type/{type}` | Get activities by type          | Yes           |
| GET    | `/api/activities/range`       | Get activities by date range    | Yes           |

---

## Testing with Postman/cURL

### 1. Local Signup

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "provider": "LOCAL",
    "roles": ["ROLE_USER"]
  }
}
```

### 2. Local Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get Current User

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get User Activities

```bash
curl -X GET "http://localhost:8080/api/activities?page=0&size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Activity Tracking

The system automatically tracks the following user activities:

### Authentication Activities

- `LOGIN` - User logged in
- `LOGOUT` - User logged out
- `REGISTER` - New user registered
- `PROFILE_UPDATE` - User updated profile
- `PASSWORD_CHANGE` - User changed password

### Listing Activities

- `LISTING_VIEW` - User viewed a listing
- `LISTING_CREATE` - User created a listing
- `LISTING_UPDATE` - User updated a listing
- `LISTING_DELETE` - User deleted a listing
- `LISTING_FAVORITE_ADD` - User favorited a listing
- `LISTING_FAVORITE_REMOVE` - User removed favorite

### Booking Activities

- `BOOKING_CREATE` - User created a booking
- `BOOKING_CANCEL` - User cancelled a booking
- `BOOKING_UPDATE` - User updated a booking

### Review Activities

- `REVIEW_CREATE` - User created a review
- `REVIEW_UPDATE` - User updated a review
- `REVIEW_DELETE` - User deleted a review

### Search Activities

- `SEARCH_PERFORMED` - User performed a search
- `FILTER_APPLIED` - User applied filters

### Account Activities

- `EMAIL_VERIFIED` - User verified email
- `ACCOUNT_DELETED` - User deleted account

---

## Frontend Integration (Next Steps)

### 1. Create Angular Auth Service

```typescript
// src/app/core/services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

interface User {
  id: number;
  email: string;
  name: string;
  imageUrl?: string;
  provider: string;
  roles: string[];
}

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private apiUrl = "http://localhost:8080/api/auth";

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem("currentUser") || "null")
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return response;
        })
      );
  }

  signup(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signup`, { name, email, password })
      .pipe(
        map((response) => {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return response;
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      map(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        this.currentUserSubject.next(null);
      })
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // OAuth2 Methods
  loginWithGoogle() {
    window.location.href = "http://localhost:8080/oauth2/authorize/google";
  }

  loginWithFacebook() {
    window.location.href = "http://localhost:8080/oauth2/authorize/facebook";
  }
}
```

### 2. Create OAuth2 Redirect Component

```typescript
// src/app/features/auth/oauth2-redirect/oauth2-redirect.component.ts
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-oauth2-redirect",
  template: "<div>Loading...</div>",
})
export class OAuth2RedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get("token");
    const error = this.route.snapshot.queryParamMap.get("error");

    if (token) {
      localStorage.setItem("accessToken", token);
      // Fetch user details
      // this.authService.getCurrentUser().subscribe(...)
      this.router.navigate(["/"]);
    } else {
      console.error("OAuth2 error:", error);
      this.router.navigate(["/login"], {
        queryParams: { error: error || "Authentication failed" },
      });
    }
  }
}
```

### 3. Add Route

```typescript
// app.routes.ts
{
  path: 'oauth2/redirect',
  component: OAuth2RedirectComponent
}
```

### 4. Update Login Component

```typescript
// In your login component
loginWithGoogle() {
  this.authService.loginWithGoogle();
}

loginWithFacebook() {
  this.authService.loginWithFacebook();
}
```

---

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production
2. **Secure Token Storage**: Consider using HttpOnly cookies instead of localStorage
3. **Token Expiration**: Default is 24 hours (86400000ms)
4. **CORS Configuration**: Update allowed origins for production
5. **OAuth Redirect URIs**: Update for production domains
6. **Environment Variables**: Use environment variables for secrets

---

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Make sure your redirect URIs in Google/Facebook console match exactly:

- `http://localhost:8080/oauth2/callback/google`
- `http://localhost:8080/oauth2/callback/facebook`

### Issue: "Invalid JWT token"

**Solution**: Check that the JWT secret is the same across all instances and is long enough (minimum 512 bits for HS512)

### Issue: "User not found"

**Solution**: Make sure the database migration ran successfully. Check the `users` table exists.

### Issue: OAuth2SecurityConfig not loading

**Solution**: Make sure `app.oauth2.enabled=true` is set in `application.yml`

---

## Next Steps

1. ✅ Backend authentication system is complete
2. ⏳ Create Angular authentication service
3. ⏳ Create login/signup components
4. ⏳ Add OAuth buttons to login page
5. ⏳ Create OAuth2 redirect handler
6. ⏳ Add HTTP interceptor for JWT tokens
7. ⏳ Test complete authentication flow

---

## Summary

**Backend Status**: ✅ **COMPLETE**

- All entities, repositories, services, controllers, and security components are created
- Database migration script is ready
- JWT token generation and validation implemented
- OAuth2 Google and Facebook integration ready
- User activity tracking fully implemented

**What's Left**:

- Frontend Angular components and services
- OAuth provider credentials configuration
- Testing and deployment
