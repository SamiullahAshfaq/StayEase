# Booking System Debug Guide

## Quick Fix Steps

### Step 1: Clear Browser Data

Open browser console (F12) and run:

```javascript
// Clear all booking data
localStorage.removeItem("mock_bookings");

// Refresh the page
location.reload();
```

### Step 2: Verify Data Initialization

After refresh, check console for:

```
MockBookingService constructor called
Window type: object
LocalStorage type: object
Existing bookings in localStorage: none
Initializing localStorage with 6 default bookings
Default bookings saved to localStorage
```

### Step 3: Navigate to Bookings

1. Login
2. Click profile → "My Bookings"
3. Check console for:

```
BookingListComponent initialized
loadBookings() called
getBookings() called
Loaded from storage: 6 bookings
MockBookingService: Getting bookings, page: 0, size: 20
Total bookings retrieved: 6
Returning page content: 6 bookings
Bookings response received: {success: true, ...}
Loaded bookings: 6
filterBookings() called, selectedTab: all
Filtered bookings: 6
Loading set to false
```

### Step 4: Test "Upcoming" Tab

Click "Upcoming" tab and check console:

```
filterBookings() called, selectedTab: upcoming
Current date: Wed Dec 11 2025...
Checking booking: Luxury Beachfront Villa, checkInDate: Mon Dec 15 2025, isAfterNow: true
Checking booking: Monaco Waterfront Penthouse, checkInDate: Sat Dec 20 2025, isAfterNow: true
Checking booking: Eiffel Tower View Apartment, checkInDate: Tue Feb 10 2026, isAfterNow: true
Filtered bookings: 3
```

### Step 5: Create New Booking

1. Browse any listing
2. Select dates: Dec 15-20, 2025
3. Enter guests: 2
4. Click "Reserve"
5. Check console:

```
Navigating to booking create with: {...}
```

6. Fill form and submit
7. Check for success message: "🎉 Booking created successfully!"
8. Wait 2 seconds for redirect
9. Should see new booking in list

---

## Common Issues

### Issue 1: "Loading forever"

**Cause**: Observable never completes
**Fix**: Check console for error messages
**Verify**:

- `Loading set to false` appears in console
- No red errors in console
- Network tab shows no failed requests

### Issue 2: "Upcoming tab empty"

**Cause**: Date comparison issue
**Fix**: Check console logs show `isAfterNow: true` for some bookings
**Verify**:

- Current date in console matches today
- Booking dates are in future
- Status is not CANCELLED

### Issue 3: "No success message"

**Cause**: Navigation path mismatch (FIXED!)
**Was**: `/bookings/create` (wrong)
**Now**: `/booking/create/:listingId` (correct)
**Verify**:

- URL shows `/booking/create/lst-001`
- No 404 error
- Form loads correctly

### Issue 4: "New booking disappears"

**Cause**: Not saving to localStorage
**Fix**: Already implemented
**Verify**:

- Console shows "Saving to localStorage"
- LocalStorage inspector shows new booking
- Booking count increases by 1

---

## Manual Testing Checklist

### ✅ Test 1: View All Bookings

- [ ] Navigate to "My Bookings"
- [ ] Spinner disappears quickly (< 1 second)
- [ ] See 6 bookings displayed
- [ ] No errors in console

### ✅ Test 2: Filter Tabs

- [ ] Click "Upcoming" → See 3 bookings
- [ ] Click "Past" → See 2 bookings
- [ ] Click "Cancelled" → See 1 booking
- [ ] Click "All" → See all 6 bookings

### ✅ Test 3: Create Booking

- [ ] Click any listing
- [ ] Select future dates (Dec 15-20, 2025)
- [ ] Enter 2 guests
- [ ] Click "Reserve"
- [ ] URL changes to `/booking/create/lst-XXX`
- [ ] Form loads with correct data
- [ ] Click "Confirm Booking"
- [ ] Green success message appears
- [ ] Auto-redirect after 2 seconds
- [ ] New booking appears at top
- [ ] Booking count now 7

### ✅ Test 4: Persistence

- [ ] Refresh page (F5)
- [ ] All bookings still there
- [ ] Close tab completely
- [ ] Reopen and login
- [ ] Bookings still present

---

## Browser DevTools Inspection

### Console Tab

Should see in order:

1. Service initialization logs
2. Component initialization
3. Data loading logs
4. Filter logs
5. No errors (red text)

### Application Tab

LocalStorage → http://localhost:4200

- Key: `mock_bookings`
- Value: JSON array with 6+ objects
- Each object has: publicId, listingTitle, checkInDate, etc.

### Network Tab

- Filter by: XHR
- Should see: NO requests (using mock service)
- If you see API calls to localhost:8080 → Mock service not working

---

## Emergency Reset

If nothing works, run this in console:

```javascript
// Complete reset
localStorage.clear();
sessionStorage.clear();

// Reload
location.reload();

// After reload, initialize manually
localStorage.setItem(
  "mock_bookings",
  JSON.stringify([
    {
      publicId: "bkg-001",
      listingPublicId: "lst-001",
      listingTitle: "Luxury Beachfront Villa",
      listingCoverImage:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      guestPublicId: "user-001",
      landlordPublicId: "landlord-001",
      checkInDate: "2025-12-15",
      checkOutDate: "2025-12-20",
      numberOfGuests: 4,
      numberOfNights: 5,
      totalPrice: 1750,
      currency: "USD",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Late check-in around 10 PM",
      createdAt: "2024-12-01T10:30:00",
      updatedAt: "2024-12-01T10:30:00",
    },
  ])
);

// Reload again
location.reload();
```

---

## Success Indicators

### ✅ All Working When You See:

1. **Console**: Clean logs, no errors
2. **UI**: Bookings load < 1 second
3. **Tabs**: All filters show correct counts
4. **Create**: Success message + redirect
5. **Persistence**: Data survives refresh

### ❌ Problem Indicators:

1. **Console**: Red errors
2. **UI**: Infinite spinner
3. **Tabs**: Empty or wrong counts
4. **Create**: No success message
5. **Persistence**: Data disappears

---

## Contact Points

- Console logs show exact issue
- Screenshot console for debugging
- Check Network tab for failed requests
- Inspect localStorage for data corruption

---

**Last Updated**: December 11, 2025 04:15 AM
