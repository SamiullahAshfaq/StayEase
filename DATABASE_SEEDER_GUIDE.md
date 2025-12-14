# Database Seeder Setup Guide

## ✅ What Was Created

### 1. **DataSeeder Component**
- Location: `backend/src/main/java/com/stayease/config/DataSeeder.java`
- **Only runs in `dev` profile** (won't affect production)
- Auto-populates database on startup with:
  - 6 users (1 admin, 2 guests, 3 landlords)
  - 5 property listings
  - 5 bookings (various statuses)
  - Proper authorities/roles

### 2. **Static Image Configuration**
- Location: `backend/src/main/java/com/stayease/config/WebMvcConfiguration.java`
- Serves images from: `backend/src/main/resources/static/images/`
- Images accessible at: `http://localhost:8080/images/{path}`

### 3. **Image Storage Structure**
```
backend/src/main/resources/static/images/
  ├── listings/     # Property images
  ├── users/        # Profile images
  └── README.md     # Documentation
```

---

## 🚀 How to Use

### Step 1: Start with Clean Database
```bash
# Drop and recreate your database (if needed)
DROP DATABASE stayease_db;
CREATE DATABASE stayease_db;
```

### Step 2: Run Backend
```bash
cd backend
./mvnw spring-boot:run
```

**What happens:**
1. Flyway creates all tables from migrations
2. DataSeeder automatically runs and populates data
3. Database now has users, listings, and bookings ready!

### Step 3: Verify Data
Check your database:
```sql
SELECT COUNT(*) FROM "user";        -- Should be 6
SELECT COUNT(*) FROM listing;       -- Should be 5
SELECT COUNT(*) FROM booking;       -- Should be 5
SELECT COUNT(*) FROM authority;     -- Should be 3
```

---

## 📝 Seeded Test Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `admin@stayease.com` | `Password123!` | ADMIN | Full system access |
| `john.doe@example.com` | `Password123!` | USER | Guest with bookings |
| `jane.smith@example.com` | `Password123!` | USER | Guest with bookings |
| `landlord1@stayease.com` | `Password123!` | LANDLORD | Has 2 listings |
| `landlord2@stayease.com` | `Password123!` | LANDLORD | Has 2 listings |
| `landlord3@stayease.com` | `Password123!` | LANDLORD | Has 1 listing |

---

## 🖼️ Image Handling

### Option 1: Use External URLs (Quick Start - RECOMMENDED)
The seeder uses paths like `/images/listings/villa-1-1.jpg` but you can modify it to use external URLs:

```java
// In DataSeeder.java, change:
.url("/images/listings/villa-1-1.jpg")

// To:
.url("https://images.unsplash.com/photo-1613490493576-7fde63acd811")
```

### Option 2: Add Local Images
1. Place images in: `backend/src/main/resources/static/images/listings/`
2. Name them: `villa-1-1.jpg`, `paris-1-1.jpg`, etc.
3. They'll be served at: `http://localhost:8080/images/listings/villa-1-1.jpg`

### Option 3: Database Storage (Later)
For production, store base64 in DB or use cloud storage (S3/Azure/Cloudinary)

---

## 🔧 Configuration Details

### Profile Configuration
- Seeder **only runs** when `spring.profiles.active=dev`
- Check: `backend/src/main/resources/application.yml`
- Current setting: `active: dev` ✅

### Data Re-seeding
The seeder checks if data exists:
```java
if (userRepository.count() > 0) {
    log.info("Database already contains data. Skipping seeding.");
    return;
}
```

**To re-seed:**
1. Clear the database
2. Restart the application

### Disable Seeder
To disable without deleting the file:
```yaml
# In application-dev.yml, change:
spring:
  profiles:
    active: prod  # or remove dev profile
```

---

## 📊 Seeded Data Overview

### Users (6 total)
- Passwords encrypted with BCrypt
- All emails verified
- Proper role assignments

### Listings (5 total)
- Mix of property types (Villa, Apartment, Loft, Penthouse, Cave House)
- Different locations (USA, France, Japan, Greece)
- Prices: $180-$650/night
- All have images, amenities, rules

### Bookings (5 total)
- Statuses: CONFIRMED (2), CHECKED_OUT (1), CANCELLED (1), PENDING (1)
- Mix of past and future dates
- Realistic pricing based on nights × listing price

---

## ✅ Next Steps

1. **Test Login**: Use any seeded account with password `Password123!`
2. **Browse Listings**: All 5 listings are ACTIVE and searchable
3. **View Bookings**: Guests have booking history
4. **Admin Panel**: Login as admin to manage everything

---

## 🐛 Troubleshooting

**Seeder doesn't run:**
- Check logs for "Starting data seeding..."
- Verify `spring.profiles.active=dev`
- Ensure database is empty initially

**Images not showing:**
- Using external URLs? Update DataSeeder URLs
- Using local files? Check file paths match
- Verify: `http://localhost:8080/images/listings/` is accessible

**Duplicate key errors:**
- Database already has data
- Clear database and restart

---

## 🎯 Quick Test Commands

```bash
# Start backend
cd backend && ./mvnw spring-boot:run

# Check if seeder ran (look for logs)
# Expected output:
# "Starting data seeding..."
# "Created 6 users"
# "Created 5 listings"
# "Created 5 bookings"
# "Data seeding completed successfully!"
```

Now your database is ready for frontend integration! 🎉
