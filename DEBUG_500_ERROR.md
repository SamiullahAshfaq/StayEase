# 🔍 500 ERROR DEBUGGING GUIDE

## What We Just Added

### 1. Enhanced Logging in BookingController

**Every booking request now logs:**

```
==================== CREATE BOOKING REQUEST ====================
User ID: [UUID]
User Email: [email]
Listing ID: [UUID]
Check-in: [date]
Check-out: [date]
Guests: [number]
Special Requests: [text]
Addons: [array]
=============================================================
```

### 2. Enhanced Global Exception Handler

**Any crash now logs:**

```
==================== UNHANDLED EXCEPTION ====================
Exception Type: [full class name]
Exception Message: [error message]
Request: [full request details]
Stack Trace: [complete stack trace]
============================================================
```

## 🎯 How to Find the Exact Error

### Step 1: Restart Backend with Logging

```bash
cd e:\Stay_Ease\StayEase\backend
mvn spring-boot:run
```

### Step 2: Try Creating a Booking

1. Open browser
2. Go to any listing
3. Click "Reserve"
4. Fill in dates and guests
5. Click "Confirm and pay"

### Step 3: Check Backend Console

You will see one of these patterns:

#### ✅ Pattern A: Request Logged, Then Success

```
==================== CREATE BOOKING REQUEST ====================
User ID: abc123...
Listing ID: def456...
...
=============================================================
✅ Booking created successfully: ghi789...
```

**This means it works!**

#### ❌ Pattern B: Request Logged, Then Exception

```
==================== CREATE BOOKING REQUEST ====================
User ID: abc123...
Listing ID: def456...
...
=============================================================
==================== UNHANDLED EXCEPTION ====================
Exception Type: java.lang.NullPointerException
Exception Message: Cannot invoke "..." because "..." is null
Stack Trace:
  at com.stayease.domain.booking.service.BookingService.createBooking(BookingService.java:XX)
  at com.stayease.domain.booking.controller.BookingController.createBooking(BookingController.java:XX)
  ...
============================================================
```

**This tells us EXACTLY what's null!**

#### ❌ Pattern C: No Request Logged at All

```
[No logs appear when you click button]
```

**This means:**

- Request never reached backend
- Check if backend is running
- Check browser console for network errors
- Check if frontend is using correct URL

## 🔍 Common 500 Error Causes

### 1. NullPointerException in Booking Creation

**Symptom**: `java.lang.NullPointerException` at line XX

**Common Causes:**

- `listing.getPricePerNight()` is null
- `listing.getCurrency()` is null
- `listing.getLandlordPublicId()` is null
- `booking.getCheckInDate()` is null
- User's UUID is null or invalid

**How to Fix:**
Look at the line number in stack trace, add null check there.

### 2. DateTimeParseException

**Symptom**: `java.time.format.DateTimeParseException`

**Cause:** Frontend sending dates in wrong format

**Frontend sends:** `2025-12-15T00:00:00.000Z`
**Backend expects:** `2025-12-15`

**How to Fix:**
Frontend should send `checkInDate: "2025-12-15"` (no time part)

### 3. ConstraintViolationException

**Symptom**: `jakarta.validation.ConstraintViolationException`

**Causes:**

- Number of guests is 0 or negative
- Dates are in the past
- Special requests too long (>1000 chars)
- Required field is null

**How to Fix:**
Add validation in frontend before sending.

### 4. Database Constraint Violation

**Symptom**: `org.postgresql.util.PSQLException: ERROR: ...`

**Common Causes:**

- Foreign key violation (listing doesn't exist)
- Unique constraint violation (duplicate booking ID)
- NOT NULL constraint (missing required field)

**How to Fix:**
Check database and entity constraints.

### 5. Serialization Error

**Symptom**: `com.fasterxml.jackson.databind.JsonMappingException`

**Causes:**

- Circular reference (Booking → Listing → Booking)
- Missing @JsonIgnore on lazy-loaded fields
- Invalid date format in response

**How to Fix:**
Use DTOs instead of entities in responses.

## 📋 What to Share When Asking for Help

### 1. Complete Backend Logs

Copy everything between these markers:

```
==================== CREATE BOOKING REQUEST ====================
[Everything here]
=============================================================

==================== UNHANDLED EXCEPTION ====================
[Everything here including stack trace]
============================================================
```

### 2. Browser Console Errors

Press F12, go to Console tab, copy:

```
POST http://localhost:8080/api/bookings 500 (Internal Server Error)
Error creating booking: HttpErrorResponse {...}
```

### 3. Network Request Details

Press F12, go to Network tab, click failed request, copy:

- **Request Headers** (especially Authorization)
- **Request Payload** (the JSON sent)
- **Response** (error message)

### 4. What You Were Doing

```
1. Logged in as: user@example.com
2. Went to listing: "Beach House"
3. Selected dates: Dec 20 - Dec 22
4. Selected guests: 2
5. Clicked "Confirm and pay"
6. Got error: [error message]
```

## 🚀 Quick Checks Before Sharing

- [ ] Backend is running (check console)
- [ ] Backend shows "Started StayEaseApplication"
- [ ] No compilation errors in backend
- [ ] Database is running (PostgreSQL)
- [ ] User is logged in (has JWT token)
- [ ] Listing exists in database
- [ ] Dates are valid (future dates, checkout > checkin)

## 🎯 Next Steps

1. **Restart backend** to load new logging
2. **Try creating a booking**
3. **Copy the logs** from backend console
4. **Share the logs** here

The enhanced logging will show us EXACTLY where it's crashing!

---

**Status**: ✅ Enhanced logging added
**Action**: Restart backend, try booking, share the logs
