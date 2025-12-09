# Listing Feature - Mock Data Setup

## Overview

The listing feature has been populated with high-quality sample data and images from Unsplash. This setup allows you to see the listing pages with real content without needing a backend connection.

## What Was Added

### 1. Mock Listing Service (`mock-listing.service.ts`)

Created a comprehensive mock service with 8 fully detailed property listings:

- **Luxury Beachfront Villa in Malibu** - $850/night
- **Cozy Mountain Cabin in Aspen** - $425/night
- **Modern Downtown Loft in NYC** - $295/night
- **Tropical Paradise Villa in Bali** - $185/night
- **Historic Parisian Apartment with Eiffel Tower View** - €385/night
- **Seaside Cottage in Santorini** - €320/night
- **Safari Lodge in Serengeti National Park** - $550/night
- **Lake House Retreat in Lake Como** - €675/night

Each listing includes:

- Multiple high-quality images (4-5 images per listing)
- Complete property details (bedrooms, bathrooms, guests, etc.)
- Amenities list
- Descriptions
- House rules
- Cancellation policies
- Ratings and reviews
- Location information

### 2. Updated Listing Service

Modified `listing.service.ts` to use mock data:

- Added `useMockData` flag (currently set to `true`)
- When `true`, uses `MockListingService`
- When `false`, uses real HTTP API calls
- Easy to switch between mock and real data

### 3. Enhanced Home Page

Updated `home.component.ts` and `home.component.html`:

- Added "Featured Stays" section
- Displays 8 featured listings using the listing card component
- Integrated with the listing service
- Added "View All Listings" button

### 4. Fixed Route Parameter

Updated `listing-detail.component.ts`:

- Changed route parameter from `publicId` to `id` to match routes

### 5. Image Sources

All images are from Unsplash (high-quality, free stock photos):

- Modern interiors
- Luxury properties
- Beautiful locations
- Professional photography

## How to Use

### View Listings

1. **Home Page**: Navigate to the home page to see 8 featured listings
2. **Search Page**: Go to `/listing/search` to see all listings with filters
3. **Detail Page**: Click any listing to see full details, image gallery, and booking form

### Available Routes

- `/` - Home page with featured listings
- `/listing/search` - Browse all listings with filters
- `/listing/:id` - View specific listing details

### Switching Between Mock and Real Data

To switch to real backend data:

1. Open `frontend/src/app/features/listing/services/listing.service.ts`
2. Change `private useMockData = true;` to `private useMockData = false;`
3. Ensure your backend is running at `http://localhost:8080/api`

## Features Working

### Listing Search Page

- ✅ Category filtering (Beachfront, City, Tropical, etc.)
- ✅ Advanced filters modal (price, property type, amenities, etc.)
- ✅ Pagination
- ✅ Responsive grid layout
- ✅ Image carousel on listing cards
- ✅ Favorite button

### Listing Detail Page

- ✅ Image gallery with full-screen view
- ✅ Property details and amenities
- ✅ Booking form with date selection
- ✅ Price breakdown calculation
- ✅ Share functionality
- ✅ Save/favorite option
- ✅ Host information
- ✅ House rules and policies

### Home Page

- ✅ Featured listings section
- ✅ Category exploration
- ✅ Search functionality
- ✅ Popular destinations

## Sample Listing IDs

Use these IDs to navigate directly to listing details:

- `lst-001` - Malibu Beach Villa
- `lst-002` - Aspen Mountain Cabin
- `lst-003` - NYC Loft
- `lst-004` - Bali Villa
- `lst-005` - Paris Apartment
- `lst-006` - Santorini Cottage
- `lst-007` - Serengeti Safari Lodge
- `lst-008` - Lake Como Villa

Example: Navigate to `http://localhost:4200/listing/lst-001`

## Next Steps

### To Add More Listings

1. Open `mock-listing.service.ts`
2. Add new listing objects to the `mockListings` array
3. Follow the same structure as existing listings
4. Use Unsplash for images: `https://images.unsplash.com/photo-{id}?w=1200&h=800&fit=crop`

### To Connect to Real Backend

1. Set `useMockData = false` in `listing.service.ts`
2. Ensure backend endpoints match:
   - `GET /api/listings/{id}` - Get listing by ID
   - `POST /api/listings/search` - Search listings
   - `GET /api/listings` - Get all listings
3. Ensure CORS is configured on backend

## Image Credits

All images sourced from [Unsplash](https://unsplash.com) - free high-quality stock photos.

## Notes

- Mock data includes realistic pricing, locations, and amenities
- All images are optimized for web (1200x800px)
- Service simulates network delay (300-500ms) for realistic feel
- Pagination and filtering work exactly like real API would
