# StayEase - Setup & Configuration Guide

## 🔐 Authentication & JWT Setup

### What You Need (No External Accounts Required!)

StayEase uses **self-contained JWT authentication** - no third-party services needed!

#### ✅ Already Configured:
- **JWT Secret Key**: Configured in `.env` file
- **PostgreSQL Database**: Local database at `localhost:5432`
- **Spring Security**: Fully configured with JWT tokens
- **Password Encryption**: BCrypt hashing enabled

### Environment Variables

All required environment variables are already set in `backend/.env`:

```env
# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=madrid07
DATABASE_URL=jdbc:postgresql://localhost:5432/stayease_db

# JWT Configuration (Self-Signed - No External Service Needed)
JWT_SECRET=dGhpcy1pcy1hLXZlcnktbG9uZy1hbmQtc2VjdXJlLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9u
JWT_EXPIRATION=86400000  # 24 hours in milliseconds

# Spring Profiles
SPRING_PROFILES_ACTIVE=dev

# Server Configuration
SERVER_PORT=8080

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

## 🚀 Quick Start

### Backend Setup

1. **Start PostgreSQL Database**
   ```bash
   # Make sure PostgreSQL is running on port 5432
   # Database: stayease_db
   # User: postgres
   # Password: madrid07
   ```

2. **Run Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Frontend**
   ```bash
   npm start
   # or
   ng serve
   ```

   The frontend will start on `http://localhost:4200`

## 🎨 Features Implemented

### ✅ Backend
- JWT Token Generation & Validation
- User Registration & Login
- Role-Based Access Control (ROLE_USER, ROLE_LANDLORD, ROLE_ADMIN)
- Password Encryption (BCrypt)
- CORS Configuration
- RESTful API Endpoints
- PostgreSQL Database Integration
- Flyway Migrations

### ✅ Frontend
- **Airbnb-Style UI** with smooth animations
- User Authentication (Login/Register)
- JWT Token Management
- HTTP Interceptor for automatic token injection
- Protected Routes with Auth Guard
- Responsive Design
- Modern Angular 21 Standalone Components

### 🎯 Main Features Connected:
- ✅ Home Page with category browsing
- ✅ User Authentication (Login/Register)
- ✅ Listing Search & Browse
- ✅ Booking Management
- ✅ User Profile
- ✅ My Listings (for landlords)
- ✅ Chat/Messages
- ✅ Reviews
- ✅ Service Offerings
- ✅ Payment Integration
- ✅ Admin Dashboard

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/logout` - Logout user

### Request/Response Examples

#### Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "isLandlord": false
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "publicId": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "authorities": ["ROLE_USER"]
    }
  }
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response: Same as register response
```

## 🎨 UI Features

### Airbnb-Style Design Elements:
- ✨ Smooth fade-in animations
- 🎯 Staggered entry animations for cards
- 🔍 Modern search bar with hover effects
- 📱 Fully responsive design
- 🎨 Gradient backgrounds
- 💫 Hover transformations
- 🌊 Smooth transitions
- 🎭 Modern shadow effects

### Navigation Features:
- Sticky navigation bar
- User dropdown menu
- Dynamic user avatar with initials
- Search integration
- Category browsing
- Mobile-responsive menu

## 🔒 Security Features

1. **JWT Token Authentication**
   - Tokens are signed with HMAC-SHA256
   - 24-hour expiration
   - Automatic token refresh on requests

2. **Password Security**
   - BCrypt hashing (cost factor 10)
   - Never stored in plain text

3. **CORS Protection**
   - Configured for localhost:4200 (frontend)
   - Customizable for production

4. **Role-Based Access**
   - ROLE_USER: Basic access
   - ROLE_LANDLORD: Can create/manage listings
   - ROLE_ADMIN: Full system access

## 📝 Database Schema

The database includes the following tables:
- `user` - User accounts
- `authority` - Roles (USER, LANDLORD, ADMIN)
- `user_authority` - User-role mapping
- `listing` - Property listings
- `booking` - Reservations
- `payment` - Payment records
- `review` - User reviews
- `chat` - Messaging system
- `notification` - User notifications
- `admin` - Admin-specific data

## 🧪 Testing the Application

1. **Start both backend and frontend**

2. **Open browser**: `http://localhost:4200`

3. **Test Registration**:
   - Click "Sign up" in the user menu
   - Fill in the registration form
   - Submit

4. **Test Login**:
   - Click "Log in"
   - Enter credentials
   - You'll be redirected to home page with your user menu active

5. **Browse Features**:
   - Click on categories to search listings
   - Access "My Bookings", "My Listings", etc.
   - All routes are protected with authentication

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use**:
```bash
# Find and kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Database connection error**:
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database `stayease_db` exists

### Frontend Issues

**Port 4200 already in use**:
```bash
ng serve --port 4201
```

**Module not found errors**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📦 Production Deployment

### Backend
1. Update `application-prod.yml` with production database
2. Change JWT secret to a secure random string
3. Update CORS allowed origins
4. Build: `mvn clean package`
5. Run: `java -jar target/stayease-0.0.1-SNAPSHOT.jar`

### Frontend
1. Update `environment.ts` with production API URL
2. Build: `ng build --configuration production`
3. Deploy the `dist/` folder to your web server

## 🎉 You're All Set!

No external accounts or API keys needed - everything works out of the box!

### Next Steps:
- Customize the JWT secret for production
- Add more features as needed
- Deploy to your preferred cloud platform
- Set up CI/CD pipelines

---

**Happy Coding! 🚀**
