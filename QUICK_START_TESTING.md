# Quick Start Guide - Test the Seeded Data

## 🚀 Start the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Watch for these log messages:**
```
🚀 Starting comprehensive data seeding with 40 listings...
🔐 Seeding authorities...
👥 Seeding users (40 landlords + admins + guests)...
🏠 Seeding ALL 40 listings from mock data...
✅ Created 40 listings with images from local storage
📅 Seeding bookings...
✅ Comprehensive data seeding completed successfully!
📈 Created 46 users, 40 listings, 3 bookings
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

## 🧪 Test Scenarios

### Test 1: Browse All Listings
1. Open browser: `http://localhost:4200`
2. Should see 40 listings displayed
3. Images should load from: `http://localhost:8080/images/listings/`

### Test 2: Login as Admin
- **Email:** `admin@stayease.com`
- **Password:** `Password123!`
- Should have access to admin features

### Test 3: Login as Guest
- **Email:** `john.doe@example.com`
- **Password:** `Password123!`
- Can browse and book listings

### Test 4: Login as Landlord
- **Email:** `landlord1@stayease.com`
- **Password:** `Password123!`
- Should see "Luxury Beachfront Villa in Malibu" in their listings
- Can manage their property

### Test 5: View Specific Listing
Browse to any listing and verify:
- ✅ Title and description display
- ✅ Location and map coordinates
- ✅ Price per night
- ✅ Guest capacity, bedrooms, beds, bathrooms
- ✅ Amenities list
- ✅ House rules
- ✅ Cancellation policy
- ✅ Images load correctly

### Test 6: Test Image URLs
Direct image access (should load):
- `http://localhost:8080/images/listings/listing-1.jpg`
- `http://localhost:8080/images/listings/listing-5.jpg`
- `http://localhost:8080/images/listings/listing-10.jpg`

### Test 7: Test API Endpoints

#### Get All Listings
```bash
curl http://localhost:8080/api/listings
```

#### Get Listing by ID
```bash
# First, get a listing publicId from the previous call
curl http://localhost:8080/api/listings/{publicId}
```

#### Search Listings
```bash
# By category
curl "http://localhost:8080/api/listings?category=Beachfront"

# By city
curl "http://localhost:8080/api/listings?city=Malibu"
```

## 📊 Database Verification (Optional)

### Connect to PostgreSQL
```bash
psql -U postgres -d stayease_db
```

### Check Data Counts
```sql
-- Should return 46
SELECT COUNT(*) FROM users;

-- Should return 40
SELECT COUNT(*) FROM listings;

-- Should return 3
SELECT COUNT(*) FROM bookings;

-- Should return 40+ (one per listing minimum)
SELECT COUNT(*) FROM listing_images;

-- Should return 3 (ROLE_USER, ROLE_LANDLORD, ROLE_ADMIN)
SELECT COUNT(*) FROM authorities;
```

### View Sample Data
```sql
-- View all listing categories
SELECT DISTINCT category FROM listings;

-- View top 5 most expensive listings
SELECT title, price_per_night, city, country 
FROM listings 
ORDER BY price_per_night DESC 
LIMIT 5;

-- View all landlords with their listings
SELECT u.email, u.first_name, l.title, l.city 
FROM users u 
JOIN listings l ON u.public_id = l.landlord_public_id 
ORDER BY u.email;

-- View all bookings
SELECT 
    u.email AS guest,
    l.title AS listing,
    b.check_in_date,
    b.check_out_date,
    b.total_price,
    b.booking_status
FROM bookings b
JOIN users u ON b.guest_public_id = u.public_id
JOIN listings l ON b.listing_public_id = l.public_id;
```

## 🔍 What to Look For

### Success Indicators
- ✅ Backend starts without errors
- ✅ Seeding logs show "Created 46 users, 40 listings, 3 bookings"
- ✅ Frontend displays all 40 listings
- ✅ Images load correctly (not broken image icons)
- ✅ Login works with any test account
- ✅ Listing details show complete information
- ✅ Search/filter functionality works

### Common Issues

#### Issue: "Database already contains data"
**Solution:** This is normal if you've already run the seeder once. To re-seed:
```sql
-- In psql
DROP DATABASE stayease_db;
CREATE DATABASE stayease_db;
```
Then restart backend.

#### Issue: Images not loading
**Solution:** 
1. Check images exist: `ls backend/src/main/resources/static/images/listings/`
2. Verify CORS in `WebMvcConfiguration.java`
3. Check browser console for CORS errors

#### Issue: Login fails
**Solution:**
- Verify email is exact: `admin@stayease.com`
- Password is case-sensitive: `Password123!`
- Check backend logs for authentication errors

## 🎯 Sample Test Flow

1. **Start both backend and frontend**
2. **Open** `http://localhost:4200`
3. **Browse** listings - should see 40 properties
4. **Click** on "Luxury Beachfront Villa in Malibu"
5. **Verify** all details load correctly
6. **Click** Login
7. **Enter** `john.doe@example.com` / `Password123!`
8. **Navigate** to profile
9. **Try** to book a listing
10. **Check** booking appears in bookings list

## 📈 Performance Check

Expected performance:
- **Seeding time:** 2-5 seconds
- **Backend startup:** 10-30 seconds
- **Frontend load:** 2-5 seconds
- **Listing page load:** < 1 second
- **Image load:** < 500ms

## 🆘 Troubleshooting

### Reset Everything
```bash
# Stop backend and frontend (Ctrl+C)

# Reset database
psql -U postgres -c "DROP DATABASE stayease_db;"
psql -U postgres -c "CREATE DATABASE stayease_db;"

# Restart backend
cd backend
mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Restart frontend (new terminal)
cd frontend
npm start
```

### Check Logs
```bash
# Backend logs - watch for errors
tail -f backend/logs/spring.log

# Or just watch console output
```

## ✅ Success Checklist

- [ ] Backend starts successfully
- [ ] Seeder runs and creates 46 users, 40 listings
- [ ] Frontend displays 40 listings
- [ ] All images load correctly
- [ ] Can login as admin/guest/landlord
- [ ] Can view listing details
- [ ] Can create bookings
- [ ] API endpoints respond correctly
- [ ] Database contains expected data

---

**Ready to test?** Start with Step 1 above! 🚀
