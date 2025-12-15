# Database Storage & Listings Verification Guide

## Your Questions Answered

### 1. ✅ Is login data stored in the database (not buffer)?

**YES, absolutely!** Your user data is persisted in PostgreSQL database. Here's the proof:

#### User Entity Configuration

**File**: `backend/src/main/java/com/stayease/domain/user/entity/User.java`

```java
@Entity
@Table(name = "\"user\"")  // Stored in PostgreSQL "user" table
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true)
    private UUID publicId;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password")  // Encrypted password stored here
    private String password;

    // Plus: firstName, lastName, phoneNumber, bio, profileImageUrl, etc.
}
```

#### Database Configuration

**File**: `backend/src/main/resources/application-dev.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/stayease_db
    username: postgres
    password: madrid07
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update # Hibernate creates/updates tables automatically
```

#### What Gets Stored in Database:

1. **User Account Data**:

   - Email (unique)
   - Encrypted password (bcrypt)
   - First name, last name
   - Phone number
   - Profile image URL
   - Bio
   - Role (ROLE_TENANT or ROLE_LANDLORD)
   - Email verification status
   - Last login timestamp

2. **User-Authority Relationship**:
   - Stored in `user_authority` join table
   - Links users to their roles (ROLE_TENANT, ROLE_LANDLORD, ROLE_ADMIN)

#### Verification Steps:

To verify your data is in the database, you can:

**Option 1: Check via pgAdmin or psql**

```sql
-- Connect to stayease_db database
SELECT * FROM "user" WHERE email = 'your-email@example.com';
SELECT * FROM user_authority WHERE user_id = YOUR_USER_ID;
SELECT * FROM authority;
```

**Option 2: Check Spring Boot logs**
When you start the backend with `mvn spring-boot:run`, you should see:

- Hibernate SQL statements creating tables
- DataSeeder creating test users and listings
- Database connection pool status

---

### 2. ✅ Will booking records be stored and retrieved?

**YES!** All booking data is persisted and associated with your user account.

#### Booking Entity Configuration

**File**: `backend/src/main/java/com/stayease/domain/booking/entity/Booking.java`

```java
@Entity
@Table(name = "booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_public_id", nullable = false)
    private UUID guestPublicId;  // Links to YOUR user account

    @ManyToOne
    @JoinColumn(name = "listing_id")
    private Listing listing;  // The property you booked

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;  // PENDING, CONFIRMED, CANCELLED, etc.

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;  // PENDING, PAID, REFUNDED

    // Plus: number of guests, special requests, review, etc.
}
```

#### Features Available:

1. **Create Booking**: When you book a property, it's saved with your `guestPublicId`
2. **View Past Bookings**: Fetch all bookings where `guestPublicId` = your user ID
3. **View Upcoming Bookings**: Filter by booking status and dates
4. **Review System**: Leave reviews after checkout
5. **Spending Tracking**: Total spending calculated from your bookings

#### API Endpoints for Tenants:

```typescript
// Frontend: src/app/features/booking/services/booking.service.ts

// Get your bookings
GET /api/bookings/my-bookings?status=CONFIRMED

// Get specific booking details
GET /api/bookings/{bookingId}

// Create new booking
POST /api/bookings

// Cancel booking
POST /api/bookings/{bookingId}/cancel
```

#### Dashboard Features (Already Built):

Your tenant dashboard (when you log in) will show:

- **Past Travels**: Completed bookings with dates and locations
- **Upcoming Bookings**: Confirmed reservations
- **Reviews**: Properties you've reviewed
- **Total Spending**: Sum of all your booking payments
- **Favorite Properties**: Saved listings

---

### 3. ❌ Why are listings not showing on homepage?

**This is the critical issue!** There are several possible causes:

#### Cause 1: Backend is NOT Running ❗

I checked and found **no Java process running**. Your backend needs to be started!

**Solution**:

```powershell
cd e:\Stay_Ease\StayEase\backend
mvn spring-boot:run
```

Wait for this message:

```
Started StayEaseApplication in X.XXX seconds
```

#### Cause 2: No Listings in Database

Your project has a `DataSeeder.java` that populates 40 sample listings, but it **only runs if the database is empty**.

**Check DataSeeder Status**:
**File**: `backend/src/main/java/com/stayease/config/DataSeeder.java`

```java
@Component
@Profile("dev")  // Only runs in dev profile
public class DataSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Check if data already exists
        if (userRepository.count() > 0) {
            log.info("📊 Database already contains data. Skipping seeding.");
            return;  // ⚠️ Won't create listings if users exist
        }

        seedAuthorities();
        seedUsers();
        seedAllListings();  // Creates 40 listings
        seedBookings();
    }
}
```

**Problem**: If you manually created a user (via signup), the seeder skips creating listings!

#### Cause 3: Active Profile Not Set

DataSeeder only runs in `dev` profile.

**Check**: Your application should start with:

```yaml
spring:
  profiles:
    active: dev # This activates DataSeeder
```

**File**: `backend/src/main/resources/application.yml` or `application.properties`

---

## 🔧 IMMEDIATE FIX - Step by Step

### Step 1: Check Active Profile

Open `backend/src/main/resources/application.yml` or `application.properties` and ensure:

```yaml
spring:
  profiles:
    active: dev
```

### Step 2: Option A - Reset Database and Reseed (RECOMMENDED)

This will create 40 sample listings with proper data:

1. **Stop any running backend** (Ctrl+C in terminal)

2. **Drop and recreate database**:

   ```sql
   -- Connect to PostgreSQL using pgAdmin or psql
   DROP DATABASE IF EXISTS stayease_db;
   CREATE DATABASE stayease_db;
   ```

3. **Restart backend**:

   ```powershell
   cd e:\Stay_Ease\StayEase\backend
   mvn spring-boot:run
   ```

4. **Verify DataSeeder ran**: Look for these log messages:

   ```
   🚀 Starting comprehensive data seeding with 40 listings...
   🔐 Seeding authorities...
   👥 Seeding users (40 landlords + admins + guests)...
   🏠 Seeding ALL 40 listings from mock data...
   ✅ Comprehensive data seeding completed successfully!
   📈 Created X users, 40 listings, Y bookings
   ```

5. **Test data seeded**:
   - Admin: `admin@stayease.com` / `admin123`
   - Sample Landlord: `landlord1@stayease.com` / `landlord123`
   - Sample Tenant: `guest1@stayease.com` / `guest123`
   - 40 listings across different categories

### Step 2: Option B - Keep Existing Data and Add Listings Manually

If you want to keep your registered account:

1. **Create listings via Admin/Landlord account**:

   - Sign up as LANDLORD
   - Go to `/listing/create`
   - Create several listings

2. **Or use SQL to insert sample listings**:
   ```sql
   INSERT INTO listing (
       public_id, landlord_public_id, title, description,
       property_type, room_type, category,
       address, city, state, country, zip_code,
       latitude, longitude,
       bedrooms, beds, bathrooms, max_guests,
       base_price, cleaning_fee, service_fee,
       status, is_featured, created_at
   ) VALUES (
       gen_random_uuid(),  -- public_id
       (SELECT public_id FROM "user" WHERE email = 'your-email@example.com'),  -- your landlord account
       'Beautiful Beach House',  -- title
       'Stunning ocean views with private beach access',  -- description
       'HOUSE', 'ENTIRE_PLACE', 'Beachfront',  -- types
       '123 Ocean Drive', 'Miami', 'Florida', 'USA', '33139',  -- address
       25.7617, -80.1918,  -- coordinates
       3, 4, 2, 6,  -- rooms/guests
       299.00, 75.00, 45.00,  -- pricing
       'ACTIVE', true, NOW()  -- status
   );
   ```

### Step 3: Verify Backend API

Test the listings endpoint directly:

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/listings?page=0&size=10" -Method Get | ConvertTo-Json -Depth 5
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "publicId": "uuid-here",
        "title": "Luxury Beach Villa",
        "category": "Beachfront",
        "basePrice": 450.0,
        "city": "Malibu",
        "status": "ACTIVE"
      }
      // ... more listings
    ],
    "totalElements": 40,
    "totalPages": 4
  }
}
```

### Step 4: Check Frontend API Call

Open browser DevTools (F12) → Network tab → Refresh homepage:

**Look for**:

- Request to: `http://localhost:8080/api/listings?page=0&size=8`
- Status: 200 OK
- Response: JSON with listings array

**If you see**:

- ❌ **Status 0 / ERR_CONNECTION_REFUSED**: Backend is not running
- ❌ **Status 401**: Authentication issue (shouldn't happen for public listings)
- ❌ **Status 500**: Backend error - check backend logs
- ✅ **Status 200 but empty array**: No listings in database

### Step 5: Check Frontend Console

Open browser console (F12) → Console tab:

**Should see**:

```
Featured listings loaded: {success: true, data: {...}}
```

**If you see errors**:

```
Failed to load listings: [error message]
```

---

## 📊 Database Schema Overview

Your StayEase database has these key tables:

### User-Related Tables:

```sql
"user"              -- User accounts (email, password, profile)
authority           -- Roles (ROLE_TENANT, ROLE_LANDLORD, ROLE_ADMIN)
user_authority      -- Links users to their roles (many-to-many)
```

### Listing-Related Tables:

```sql
listing             -- Properties available for rent
listing_image       -- Images for each listing (one-to-many)
```

### Booking-Related Tables:

```sql
booking             -- Reservations made by tenants
review              -- Reviews left by guests after checkout
```

### Relationship Example:

```
User (Tenant)
  ↓ (guestPublicId)
Booking → Listing
  ↓ (listingId)
ListingImage
  ↓ (landlordPublicId)
User (Landlord)
```

---

## 🧪 Testing Your Setup

### Test 1: Verify Database Connection

```powershell
cd e:\Stay_Ease\StayEase\backend
mvn spring-boot:run
```

**Look for in logs**:

```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
Hibernate:
    create table if not exists "user" (...)
```

### Test 2: Verify Data Seeding

After backend starts, check logs for:

```
🚀 Starting comprehensive data seeding with 40 listings...
✅ Comprehensive data seeding completed successfully!
📈 Created 43 users, 40 listings, 12 bookings
```

### Test 3: Query Database

Using pgAdmin or psql:

```sql
-- Check users
SELECT email, first_name, last_name FROM "user";

-- Check authorities
SELECT u.email, a.name
FROM "user" u
JOIN user_authority ua ON u.id = ua.user_id
JOIN authority a ON ua.authority_id = a.id;

-- Check listings
SELECT title, category, city, base_price, status, is_featured
FROM listing
ORDER BY created_at DESC
LIMIT 10;

-- Check your bookings (replace with your user's public_id)
SELECT
    b.check_in_date,
    b.check_out_date,
    b.total_price,
    b.status,
    l.title as property_name
FROM booking b
JOIN listing l ON b.listing_id = l.id
WHERE b.guest_public_id = 'your-public-id-here'
ORDER BY b.check_in_date DESC;
```

### Test 4: Test API Endpoints

```powershell
# Get all listings
curl http://localhost:8080/api/listings

# Get specific listing
curl http://localhost:8080/api/listings/{publicId}

# Search listings by category
curl "http://localhost:8080/api/listings/category/Beachfront"

# Get your bookings (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/bookings/my-bookings
```

---

## 🎯 Summary & Next Steps

### ✅ Question 1 Answer: Database Storage

**YES**, all login, profile, and user data is stored in PostgreSQL database with proper entity relationships. Not stored in memory/buffer.

### ✅ Question 2 Answer: Booking Records

**YES**, all bookings are stored with your user ID (`guestPublicId`). When you log in, the system fetches:

- Your past bookings
- Upcoming reservations
- Reviews you've written
- Total spending
- All associated with your account via database foreign keys

### ❌ Question 3 Issue: No Listings Visible

**ROOT CAUSE**: Most likely one of these:

1. Backend is not running
2. DataSeeder didn't run (users already existed)
3. Profile is not set to "dev"

**SOLUTION**:

1. **Start backend**: `cd backend; mvn spring-boot:run`
2. **If no listings**: Drop database and restart to trigger DataSeeder
3. **Verify in browser**: DevTools → Network → Check API calls

### Next Steps:

1. ⚠️ **CRITICAL**: Start your backend server if not running
2. 🔍 Check backend logs for DataSeeder messages
3. 🗄️ Verify listings exist in database
4. 🌐 Test API endpoint directly
5. 🖥️ Check browser console for errors
6. ✅ Once listings appear, test the complete flow:
   - Browse listings
   - View listing details
   - Create a booking
   - View "My Bookings" dashboard

---

## 🆘 Troubleshooting

### Problem: "Connection refused" on frontend

**Solution**: Backend is not running. Start it with `mvn spring-boot:run`

### Problem: DataSeeder skipped

**Logs say**: "Database already contains data. Skipping seeding."
**Solution**: Either drop database OR manually create listings

### Problem: Listings exist but not showing on homepage

**Check**:

1. Listing status is `ACTIVE` (not DRAFT, PENDING, INACTIVE)
2. Frontend console for JavaScript errors
3. API response format matches expected structure
4. Change detection working (already fixed in previous session)

### Problem: Can't create bookings

**Check**:

1. You're logged in as TENANT (not LANDLORD)
2. JWT token is valid (check localStorage)
3. Listing is ACTIVE
4. Dates are valid (check-in before check-out, future dates)

---

## 📝 Important Files Reference

### Backend:

- **User Entity**: `backend/src/main/java/com/stayease/domain/user/entity/User.java`
- **Booking Entity**: `backend/src/main/java/com/stayease/domain/booking/entity/Booking.java`
- **Listing Entity**: `backend/src/main/java/com/stayease/domain/listing/entity/Listing.java`
- **Data Seeder**: `backend/src/main/java/com/stayease/config/DataSeeder.java`
- **Database Config**: `backend/src/main/resources/application-dev.yml`

### Frontend:

- **Home Component**: `frontend/src/app/features/home/home.component.ts`
- **Listing Service**: `frontend/src/app/features/listing/services/listing.service.ts`
- **Auth Service**: `frontend/src/app/core/auth/auth.service.ts`

---

**Need help?** Check the terminal output when running `mvn spring-boot:run` for detailed error messages!
