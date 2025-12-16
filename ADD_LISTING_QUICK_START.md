# Quick Start: Add Listing Feature

## For Landlords - How to Add a Listing

### Step 1: Access the Feature

1. **Log in** to your landlord account
2. Click the **user menu** icon (top right corner - hamburger menu + profile picture)
3. Look for the **"Add Listing"** button
   - It has a gradient teal/cyan background
   - Icon shows a plus sign with a house
   - Located between "My Listings" and "Profile"

### Step 2: Fill Out the 7-Step Wizard

#### 📍 Step 1: Property Basics

- Select **Property Type** (Apartment, House, Villa, etc.)
- Select **Room Type** (Entire Place, Private Room, Shared Room)
- Enter **City** and **Country**
- Optional: Street Address and Zip Code

#### 🏠 Step 2: Property Details

- Set number of **Bedrooms** (use + / - buttons)
- Set number of **Bathrooms** (use + / - buttons)
- Set **Maximum Guests** (use + / - buttons)
- Enter **Property Size** in square feet
- Select **Amenities** (WiFi, Kitchen, Parking, Pool, etc.)

#### 📸 Step 3: Photos

- **Upload at least 1 photo** (recommended: 5-10 photos)
- Click "Choose files" or drag & drop
- Set one photo as **cover photo**
- Reorder photos by dragging
- Delete unwanted photos

#### ✍️ Step 4: Description

- Write a catchy **Title** (10-255 characters)
  - Example: "Cozy Downtown Apartment with City Views"
- Write a detailed **Description** (50-5000 characters)
  - Describe the space, neighborhood, amenities
  - Mention nearby attractions, transportation
  - Highlight unique features
- Optional: Add **House Rules**
  - Example: "No smoking, No pets, Quiet hours after 10 PM"

#### 💰 Step 5: Pricing

- Set **Base Price per Night** (required)
- Optional: **Cleaning Fee**
- Optional: **Security Deposit**
- Optional: **Weekend Price** (Friday-Sunday)
- Optional: **Weekly Discount** (%)
- Optional: **Monthly Discount** (%)

#### 📅 Step 6: Policies

- Set **Check-in Time** (e.g., 3:00 PM)
- Set **Check-out Time** (e.g., 11:00 AM)
- Set **Minimum Nights** (e.g., 1 night)
- Optional: **Maximum Nights** (e.g., 30 nights)
- Select **Cancellation Policy**
  - Flexible, Moderate, Strict, Super Strict
- Toggle **Instant Booking** (on/off)

#### 👀 Step 7: Preview & Submit

- Review all your information
- Click any step number to edit that section
- Click **"Save as Draft"** to save without publishing
- Click **"Publish"** to submit for admin approval

### Step 3: Wait for Approval

- Your listing goes to **PENDING_APPROVAL** status
- Admin team will review your listing
- You'll receive notification when approved
- Approved listings appear in search results

---

## For Developers - Technical Details

### Frontend Implementation

**Files Modified:**

```
✅ header.component.html - Added "Add Listing" button
✅ header.component.ts - Added navigation methods
✅ header.component.css - Added highlight styling
```

**New Methods:**

```typescript
// Navigate to add listing page
navigateToAddListing() {
  this.router.navigate(['/listing/create']);
  this.isMenuOpen = false;
}

// Check if user can add listings
isLandlordOrAdmin(): boolean {
  if (!this.currentUser || !this.currentUser.authorities) {
    return false;
  }
  const authorities = this.currentUser.authorities;
  return authorities.includes('ROLE_LANDLORD') ||
         authorities.includes('ROLE_ADMIN');
}
```

### Backend API

**Endpoint:**

```
POST /api/listings
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Required Roles:**

- `ROLE_LANDLORD`
- `ROLE_ADMIN`

**Request Body (CreateListingDTO):**

```json
{
  "title": "Beautiful Beachfront Villa",
  "description": "A stunning 3-bedroom villa...",
  "location": "Malibu Beach",
  "city": "Malibu",
  "country": "USA",
  "address": "123 Ocean Drive",
  "latitude": 34.0259,
  "longitude": -118.7798,
  "pricePerNight": 299.99,
  "currency": "USD",
  "maxGuests": 6,
  "bedrooms": 3,
  "beds": 4,
  "bathrooms": 2.5,
  "propertyType": "VILLA",
  "category": "Beachfront",
  "amenities": ["WiFi", "Pool", "Kitchen", "Parking", "AC"],
  "houseRules": "No smoking, No pets",
  "cancellationPolicy": "FLEXIBLE",
  "minimumStay": 2,
  "maximumStay": 30,
  "instantBook": true,
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "caption": "Living Room",
      "isCover": true,
      "displayOrder": 1
    }
  ]
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "publicId": "uuid-here",
    "landlordPublicId": "landlord-uuid",
    "title": "Beautiful Beachfront Villa",
    "status": "PENDING_APPROVAL",
    "createdAt": "2024-12-16T10:30:00Z",
    ...
  }
}
```

**Error Responses:**

**400 Bad Request (Validation Error):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Title must be between 10 and 255 characters",
    "pricePerNight": "Price must be at least 1"
  }
}
```

**401 Unauthorized (No JWT):**

```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2024-12-16T10:30:00Z"
}
```

**403 Forbidden (Wrong Role):**

```json
{
  "success": false,
  "message": "Access denied. Landlord or Admin role required.",
  "timestamp": "2024-12-16T10:30:00Z"
}
```

---

## Testing Checklist

### Manual Testing

**As Landlord:**

- [ ] Log in with landlord account
- [ ] Open user menu (top right)
- [ ] Verify "Add Listing" button appears
- [ ] Button has gradient background
- [ ] Click button
- [ ] Navigate to /listing/create page
- [ ] Fill out all 7 steps
- [ ] Upload at least 1 photo
- [ ] Submit listing
- [ ] Verify success message
- [ ] Check listing in "My Listings"
- [ ] Verify status is PENDING_APPROVAL

**As Regular User (Tenant):**

- [ ] Log in with tenant account
- [ ] Open user menu
- [ ] Verify "Add Listing" button does NOT appear
- [ ] Try manually navigating to /listing/create
- [ ] Verify access is denied (route guard)

**As Admin:**

- [ ] Log in with admin account
- [ ] Verify "Add Listing" button appears
- [ ] Can create listings
- [ ] Can see all pending listings in admin panel
- [ ] Can approve/reject listings

### Automated Testing

**Frontend (Jest/Jasmine):**

```typescript
describe("HeaderComponent", () => {
  it("should show Add Listing button for landlords", () => {
    // Arrange
    component.currentUser = { authorities: ["ROLE_LANDLORD"] };

    // Act
    const result = component.isLandlordOrAdmin();

    // Assert
    expect(result).toBe(true);
  });

  it("should NOT show Add Listing button for tenants", () => {
    // Arrange
    component.currentUser = { authorities: ["ROLE_TENANT"] };

    // Act
    const result = component.isLandlordOrAdmin();

    // Assert
    expect(result).toBe(false);
  });
});
```

**Backend (JUnit):**

```java
@Test
void createListing_withLandlordRole_shouldSucceed() {
    // Arrange
    CreateListingDTO dto = createValidListingDTO();
    UUID landlordId = UUID.randomUUID();

    // Act
    ListingDTO result = listingService.createListing(dto, landlordId);

    // Assert
    assertNotNull(result.getPublicId());
    assertEquals(dto.getTitle(), result.getTitle());
    assertEquals(landlordId, result.getLandlordPublicId());
}

@Test
void createListing_withInvalidData_shouldThrowException() {
    // Arrange
    CreateListingDTO dto = new CreateListingDTO();
    dto.setTitle(""); // Invalid: too short

    // Act & Assert
    assertThrows(ValidationException.class, () -> {
        listingService.createListing(dto, UUID.randomUUID());
    });
}
```

---

## Common Issues & Solutions

### Issue 1: Button Not Appearing

**Problem:** "Add Listing" button doesn't show in dropdown

**Solutions:**

1. Check user role: Must be LANDLORD or ADMIN
2. Clear browser cache and refresh
3. Check console for errors
4. Verify JWT token is valid
5. Check `currentUser.authorities` array in component

**Debug:**

```typescript
console.log("User:", this.currentUser);
console.log("Authorities:", this.currentUser?.authorities);
console.log("Is Landlord/Admin:", this.isLandlordOrAdmin());
```

### Issue 2: Access Denied on Submit

**Problem:** Get 403 Forbidden when submitting listing

**Solutions:**

1. Verify JWT token in localStorage
2. Check token hasn't expired
3. Verify token has correct role claim
4. Re-login to get fresh token
5. Check backend logs for authorization errors

**Debug:**

```typescript
// Check token
const token = localStorage.getItem("jwt_token");
console.log("Token:", token);

// Decode token (use jwt-decode library)
const decoded = jwtDecode(token);
console.log("Token payload:", decoded);
```

### Issue 3: Validation Errors

**Problem:** Cannot submit listing, validation fails

**Solutions:**

1. Check all required fields are filled
2. Verify title is 10-255 characters
3. Verify description is 50-5000 characters
4. At least 1 image uploaded
5. Price is between 1 and 999,999.99
6. Guest count is 1-50

**Check Fields:**

```typescript
console.log("Form data:", this.formData());
console.log("Is valid:", this.validateForm());
```

### Issue 4: Image Upload Fails

**Problem:** Images won't upload or preview

**Solutions:**

1. Check file size (max 5MB per image)
2. Check file format (JPG, PNG, WebP only)
3. Check browser file upload permissions
4. Try different image
5. Check network connection

**Debug:**

```typescript
// Check file before upload
console.log("File:", file);
console.log("File size:", file.size);
console.log("File type:", file.type);
```

---

## Quick Commands

### Start Development Server

```bash
# Frontend
cd frontend
ng serve

# Backend
cd backend
./mvnw spring-boot:run
```

### Run Tests

```bash
# Frontend
ng test

# Backend
./mvnw test
```

### Build for Production

```bash
# Frontend
ng build --configuration production

# Backend
./mvnw clean package -DskipTests
```

---

## Support & Documentation

### Full Documentation

- See `ADD_LISTING_FEATURE_COMPLETE.md` for detailed implementation
- See `ROLE_DISPLAY_IN_DROPDOWN.md` for role display feature
- See `EDIT_BOOKING_MODAL_CLOSE_FIX.md` for recent bug fixes

### API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Postman Collection: Available in `/docs` folder

### Contact

- Technical Issues: Check console logs and backend logs
- Feature Requests: Submit GitHub issue
- Security Concerns: Report immediately to security team

---

**Status:** ✅ **Ready to Use**

**Last Updated:** December 16, 2024

**Quick Test:** Log in as landlord → Open menu → Click "Add Listing" → Create listing → Verify it works!
