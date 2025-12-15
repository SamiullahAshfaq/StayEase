# ✅ Quick Action Checklist

## **🔥 Immediate Actions Required:**

### **1. Restart Backend** (REQUIRED)

```bash
cd e:\Stay_Ease\StayEase\backend
mvn spring-boot:run
```

**Why:** BookingController was uncommented and needs to be loaded.

---

### **2. Test Booking Flow**

#### **Step 1: Make a Booking**

1. Go to home page (http://localhost:4200)
2. Click "Reserve" on any listing
3. Select check-in date (tomorrow)
4. Select check-out date (next week)
5. Choose 2 guests
6. Click "Confirm Booking"
7. ✅ Should show success message

#### **Step 2: View Your Bookings**

1. Click your profile picture (top right)
2. Click "My Bookings"
3. ✅ Should see your booking in the list

#### **Step 3: Check Database**

Open PostgreSQL and run:

```sql
SELECT * FROM bookings WHERE guest_id = (
  SELECT public_id FROM users WHERE email = 'your-email@example.com'
);
```

✅ Should see your booking stored

---

## **🎯 What's Fixed:**

- ✅ **BookingController** - Uncommented (was entirely commented out)
- ✅ **UserPrincipal method** - Changed `getPublicId()` to `getId()`
- ✅ **Header navigation** - Fixed route from `/bookings` to `/booking/list`

---

## **📡 Available Endpoints:**

### **Tenant Endpoints:**

- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get my bookings
- `GET /api/bookings/{id}` - Get booking details
- `POST /api/bookings/{id}/cancel` - Cancel booking

### **Landlord Endpoints:**

- `GET /api/bookings/listing/{id}` - Get bookings for my listing
- `PATCH /api/bookings/{id}/status` - Update booking status

### **Public Endpoints:**

- `GET /api/bookings/listing/{id}/unavailable-dates` - Get unavailable dates

---

## **🧪 Test Scenarios:**

### **Scenario 1: Full Booking Flow**

```
Login → Browse Listings → Click Reserve → Select Dates → Confirm
→ Go to My Bookings → See your booking → Click Details
```

### **Scenario 2: Booking with Addons**

```
Click Reserve → Select Dates → Add Airport Pickup → Add Early Check-in
→ See price update → Confirm → View in My Bookings
```

### **Scenario 3: Cancel Booking**

```
My Bookings → Find Upcoming Booking → Click Cancel
→ Enter Reason → Confirm → Status changes to CANCELLED
```

### **Scenario 4: Filter Bookings**

```
My Bookings → Click "Upcoming" → See only future bookings
→ Click "Completed" → See past bookings
→ Click "Cancelled" → See cancelled ones
```

---

## **✅ Success Checklist:**

- [ ] Backend restarted successfully
- [ ] Can see listings when logged in
- [ ] Can click "Reserve" button on a listing
- [ ] Booking form loads with dates
- [ ] Can select check-in/check-out dates
- [ ] Can choose number of guests
- [ ] Can add optional addons
- [ ] Total price calculates correctly
- [ ] "Confirm Booking" button works
- [ ] Success message appears after booking
- [ ] "My Bookings" menu item works
- [ ] Bookings list page loads
- [ ] Can see created booking in list
- [ ] Can filter bookings (All, Upcoming, etc.)
- [ ] Can click on booking to see details
- [ ] Can cancel a booking
- [ ] Database contains the booking record

---

## **🚨 If Something Doesn't Work:**

### **Issue: 404 on booking endpoints**

**Check:** Is backend restarted? BookingController needs to load.

```bash
# Stop backend (Ctrl+C), then:
mvn spring-boot:run
```

### **Issue: "My Bookings" returns empty**

**Check:** Did you create a booking first? Try making one.

### **Issue: Can't see listings when logged in**

**Check:** Did you clear localStorage and re-login with new token?

```javascript
localStorage.clear();
location.reload();
// Then login again
```

### **Issue: Booking creation fails**

**Check backend logs for errors:**

- Authentication errors → Re-login
- Database errors → Check PostgreSQL is running
- Validation errors → Check date format (YYYY-MM-DD)

---

## **📊 Expected Database State:**

After creating 2 bookings, database should have:

```sql
-- Check bookings table
SELECT
  public_id,
  guest_id,
  listing_id,
  check_in,
  check_out,
  number_of_guests,
  total_price,
  booking_status,
  created_at
FROM bookings
ORDER BY created_at DESC;
```

**Expected Result:**

```
public_id                | guest_id              | listing_id            | status    | total_price
-------------------------|-----------------------|-----------------------|-----------|---------
abc-123-def...           | your-uuid...          | listing-uuid...       | PENDING   | 350.00
xyz-456-ghi...           | your-uuid...          | listing-uuid...       | PENDING   | 500.00
```

---

## **🎯 Quick Verification Commands:**

### **Check if backend is running:**

```bash
curl http://localhost:8080/actuator/health
```

**Expected:** `{"status":"UP"}`

### **Check if bookings endpoint works:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/bookings/my-bookings
```

**Expected:** JSON with bookings array

### **Check if unavailable dates endpoint works:**

```bash
curl http://localhost:8080/api/bookings/listing/LISTING_UUID/unavailable-dates
```

**Expected:** Array of dates

---

## **✨ All Done!**

**Restart backend and test the booking flow!** 🚀

**Everything is set up and ready to go:**

- ✅ Backend code fixed
- ✅ Frontend routes configured
- ✅ Components ready
- ✅ Database models defined
- ✅ Security configured

**Just restart and test!** 🎉
