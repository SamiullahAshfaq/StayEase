# Local Signup with Role Selection - Implementation Fix

**Date**: December 15, 2025  
**Status**: ✅ Fixed  
**Issue**: Local email/password signup not saving user role (Tenant/Landlord) to database

---

## Problem Description

### Issues Found:

1. **Frontend**: Register form collects `userType` (ROLE_TENANT or ROLE_LANDLORD) but doesn't send it to backend
2. **Backend DTO**: `CreateUserDTO` doesn't have a `userType` field to receive the role
3. **Backend Service**: `AuthService.register()` was hardcoded to always assign `ROLE_TENANT` to all new users
4. **Result**: All users registered as TENANT regardless of selection

---

## Solution Implemented

### ✅ Step 1: Update Backend DTO (`CreateUserDTO.java`)

**File**: `backend/src/main/java/com/stayease/domain/user/dto/CreateUserDTO.java`

**Added**:

```java
// Role/UserType for registration (ROLE_TENANT or ROLE_LANDLORD)
@NotBlank(message = "User type is required")
private String userType;
```

**Purpose**: Accept the user's selected role from frontend

---

### ✅ Step 2: Update Backend Service (`AuthService.java`)

**File**: `backend/src/main/java/com/stayease/domain/user/service/AuthService.java`

**Changed From**:

```java
// Assign default USER authority
Authority userAuthority = authorityRepository.findByName(AuthorityConstant.ROLE_TENANT)
        .orElseThrow(() -> new NotFoundException("Authority not found: " + AuthorityConstant.ROLE_TENANT));
user.addAuthority(userAuthority);
```

**Changed To**:

```java
// Assign authority based on user type (default to ROLE_TENANT if not specified)
String roleName = (createUserDTO.getUserType() != null && !createUserDTO.getUserType().isEmpty())
        ? createUserDTO.getUserType()
        : AuthorityConstant.ROLE_TENANT;

// Validate role name
if (!roleName.equals(AuthorityConstant.ROLE_TENANT) && !roleName.equals(AuthorityConstant.ROLE_LANDLORD)) {
    log.warn("Invalid role requested: {}. Defaulting to ROLE_TENANT", roleName);
    roleName = AuthorityConstant.ROLE_TENANT;
}

Authority userAuthority = authorityRepository.findByName(roleName)
        .orElseThrow(() -> new NotFoundException("Authority not found: " + roleName));
user.addAuthority(userAuthority);
```

**Purpose**:

- Use the role provided by user
- Validate it's either ROLE_TENANT or ROLE_LANDLORD
- Default to ROLE_TENANT if invalid or missing

---

### ✅ Step 3: Update Frontend Interface (`auth.service.ts`)

**File**: `frontend/src/app/core/auth/auth.service.ts`

**Changed From**:

```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

**Changed To**:

```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string; // ROLE_TENANT or ROLE_LANDLORD
}
```

**Purpose**: Include userType in the registration request interface

---

### ✅ Step 4: Update Frontend Component (`register.component.ts`)

**File**: `frontend/src/app/features/auth/register/register.component.ts`

**Changed From**:

```typescript
const { firstName, lastName, email, password } = this.registerForm.value;

this.authService.register({
  email,
  password,
  firstName,
  lastName
}).subscribe({
```

**Changed To**:

```typescript
const { firstName, lastName, email, password, userType } = this.registerForm.value;

// Call backend API with correct field names including userType
this.authService.register({
  email,
  password,
  firstName,
  lastName,
  userType  // ✅ Now sending the selected role
}).subscribe({
```

**Purpose**: Send the selected role to backend during registration

---

## How It Works Now

### Registration Flow:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User fills registration form                             │
│    - Selects "Find a Place (Tenant)" or                    │
│      "List My Property (Landlord)"                          │
│    - Enters: First Name, Last Name, Email, Password        │
│    - Accepts Terms & Conditions                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend sends to backend:                               │
│    {                                                         │
│      "email": "user@example.com",                           │
│      "password": "password123",                             │
│      "firstName": "John",                                   │
│      "lastName": "Doe",                                     │
│      "userType": "ROLE_TENANT"  ← Selected role             │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend validates and processes:                         │
│    - Checks email doesn't exist                             │
│    - Validates userType (ROLE_TENANT or ROLE_LANDLORD)     │
│    - Encrypts password                                      │
│    - Creates user record                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Assigns role to user:                                    │
│    - Fetches Authority from database by role name          │
│    - Creates user_authority record                          │
│    - Links user to their selected role                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Generates JWT token:                                     │
│    - Token includes user info + authorities                 │
│    - Returns token + user data to frontend                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend stores auth data:                               │
│    - Saves JWT token to localStorage                        │
│    - Stores user info (including role)                      │
│    - Redirects to profile completion                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### User Table

```sql
CREATE TABLE "user" (
    id BIGINT PRIMARY KEY,
    public_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(500),
    bio VARCHAR(1000),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Authority Table (Pre-seeded)

```sql
CREATE TABLE authority (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Pre-seeded roles:
INSERT INTO authority (id, name, description) VALUES
    (1, 'ROLE_TENANT', 'Tenant role - can book listings and services'),
    (2, 'ROLE_LANDLORD', 'Landlord role - can create and manage listings'),
    (3, 'ROLE_ADMIN', 'Administrator role - full system access');
```

### User-Authority Junction Table

```sql
CREATE TABLE user_authority (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    authority_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (authority_id) REFERENCES authority(id) ON DELETE CASCADE,
    UNIQUE (user_id, authority_id)
);
```

---

## Testing the Fix

### Test Case 1: Register as Tenant

1. Navigate to `/auth/register`
2. Select **"Find a Place (Tenant)"**
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john.tenant@example.com
   - Password: password123
   - Confirm Password: password123
   - ✅ Accept Terms
4. Click **"Create Account"**

**Expected Result**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "publicId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.tenant@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "authorities": ["ROLE_TENANT"],  ← Correct role!
      "isActive": true
    }
  }
}
```

**Database Check**:

```sql
-- Check user record
SELECT * FROM "user" WHERE email = 'john.tenant@example.com';

-- Check authority assignment
SELECT u.email, a.name as role
FROM "user" u
JOIN user_authority ua ON u.id = ua.user_id
JOIN authority a ON ua.authority_id = a.id
WHERE u.email = 'john.tenant@example.com';

-- Expected: john.tenant@example.com | ROLE_TENANT
```

---

### Test Case 2: Register as Landlord

1. Navigate to `/auth/register`
2. Select **"List My Property (Landlord)"**
3. Fill in:
   - First Name: Jane
   - Last Name: Smith
   - Email: jane.landlord@example.com
   - Password: password123
   - Confirm Password: password123
   - ✅ Accept Terms
4. Click **"Create Account"**

**Expected Result**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "email": "jane.landlord@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "authorities": ["ROLE_LANDLORD"],  ← Correct role!
      "isActive": true
    }
  }
}
```

**Database Check**:

```sql
SELECT u.email, a.name as role
FROM "user" u
JOIN user_authority ua ON u.id = ua.user_id
JOIN authority a ON ua.authority_id = a.id
WHERE u.email = 'jane.landlord@example.com';

-- Expected: jane.landlord@example.com | ROLE_LANDLORD
```

---

### Test Case 3: Login After Registration

1. Logout (if logged in)
2. Navigate to `/auth/login`
3. Enter credentials:
   - Email: john.tenant@example.com
   - Password: password123
4. Click **"Sign In"**

**Expected Result**:

- ✅ Login successful
- ✅ User data loaded with correct role
- ✅ Redirected to appropriate page
- ✅ Token stored in localStorage
- ✅ User authorities include correct role

---

## Role-Based Features

### Tenant Users (ROLE_TENANT)

Can access:

- ✅ Browse listings
- ✅ View listing details
- ✅ Book properties
- ✅ View bookings (tenant view)
- ✅ Leave reviews
- ✅ Manage profile

Cannot access:

- ❌ Create listings
- ❌ Manage properties
- ❌ View landlord dashboard

### Landlord Users (ROLE_LANDLORD)

Can access:

- ✅ Browse listings
- ✅ View listing details
- ✅ **Create listings** (special permission)
- ✅ **Manage own listings** (special permission)
- ✅ **View booking requests** (special permission)
- ✅ **Approve/reject bookings** (special permission)
- ✅ Manage profile

Can also:

- ✅ Book other properties (as a guest)
- ✅ Leave reviews

---

## Security Validation

### Backend Validation:

```java
// In AuthService.register()
if (!roleName.equals(AuthorityConstant.ROLE_TENANT) &&
    !roleName.equals(AuthorityConstant.ROLE_LANDLORD)) {
    log.warn("Invalid role requested: {}. Defaulting to ROLE_TENANT", roleName);
    roleName = AuthorityConstant.ROLE_TENANT;
}
```

**Prevents**:

- ❌ Users requesting ROLE_ADMIN during registration
- ❌ Invalid role names
- ❌ SQL injection attempts
- ❌ Malicious payloads

**Ensures**:

- ✅ Only ROLE_TENANT or ROLE_LANDLORD can be assigned
- ✅ Defaults to ROLE_TENANT if validation fails
- ✅ Logs suspicious activity

---

## Files Modified

### Backend (3 files):

1. **`CreateUserDTO.java`**

   - Added `userType` field with validation

2. **`AuthService.java`**

   - Updated `register()` method to use provided role
   - Added validation logic
   - Added security defaults

3. No database migrations needed (authority table already exists)

### Frontend (2 files):

1. **`auth.service.ts`**

   - Updated `RegisterRequest` interface with `userType`

2. **`register.component.ts`**
   - Updated form submission to include `userType`

---

## Next Steps to Test

### 1. Restart Backend

```powershell
cd e:\Stay_Ease\StayEase\backend
./mvnw spring-boot:run
```

### 2. Test Registration Flow

- Go to http://localhost:4200/auth/register
- Try registering as both Tenant and Landlord
- Verify different roles are assigned

### 3. Verify in Database

```sql
-- Check all users and their roles
SELECT
    u.email,
    u.first_name,
    u.last_name,
    a.name as role,
    u.is_active,
    u.created_at
FROM "user" u
JOIN user_authority ua ON u.id = ua.user_id
JOIN authority a ON ua.authority_id = a.id
ORDER BY u.created_at DESC;
```

### 4. Test Login

- Logout if logged in
- Login with newly created account
- Verify correct role is in JWT token
- Verify role-based access control works

---

## Common Issues & Solutions

### Issue 1: "Authority not found" Error

**Cause**: Authority table not seeded with roles
**Solution**:

```sql
INSERT INTO authority (id, name, description) VALUES
    (nextval('authority_seq'), 'ROLE_TENANT', 'Tenant role'),
    (nextval('authority_seq'), 'ROLE_LANDLORD', 'Landlord role'),
    (nextval('authority_seq'), 'ROLE_ADMIN', 'Admin role');
```

### Issue 2: User Type Not Saving

**Cause**: Backend not restarted after changes
**Solution**: Restart Spring Boot application

### Issue 3: All Users Still Getting ROLE_TENANT

**Cause**: Frontend not sending userType
**Solution**: Check browser console for request payload

---

## Status

✅ **IMPLEMENTATION COMPLETE**

**Ready for Testing**:

1. Backend changes applied
2. Frontend changes applied
3. Database schema supports roles
4. Validation and security in place

**Test Registration**:

- Register as Tenant → Should get ROLE_TENANT
- Register as Landlord → Should get ROLE_LANDLORD
- Login with either → Should maintain role
