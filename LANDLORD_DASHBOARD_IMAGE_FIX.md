# Landlord Dashboard Image Display Fix

## Issue Identified

The landlord dashboard template was using **incorrect property names** for displaying images, which would cause errors or display broken images:

1. **Listing cards**: Used `listing.coverImage` instead of `listing.coverImageUrl`
2. **Booking cards**: Used hardcoded fallback paths without `ImageUrlHelper`
3. **Guest avatars**: Used hardcoded fallback paths without `ImageUrlHelper`

## Root Cause

### Property Name Mismatch

The `Listing` interface defines:

```typescript
export interface Listing {
  coverImageUrl?: string; // ✅ Correct property name
  images: ListingImage[];
  // ...
}

export interface ListingImage {
  url: string; // ✅ Correct property name for image URL
  // ...
}
```

### Template Issues

**Before (Incorrect):**

```html
<!-- WRONG: coverImage doesn't exist -->
<img
  [src]="listing.coverImage || listing.images[0]?.imageUrl || '/images/default-listing.jpg'"
/>

<!-- WRONG: Direct paths without ImageUrlHelper -->
<img [src]="booking.listingImage || '/images/default-listing.jpg'" />
<img [src]="booking.guestAvatar || '/images/default-avatar.png'" />
```

### Missing URL Conversion

All backend image URLs need to be converted using `ImageUrlHelper.getFullImageUrl()` to transform relative paths (e.g., `/images/listings/123.jpg`) into full URLs (e.g., `http://localhost:8080/images/listings/123.jpg`).

## Solution

### 1. Added ImageUrlHelper Import

**File:** `landlord-dashboard.component.ts`

```typescript
import { ImageUrlHelper } from "../../../shared/utils/image-url.helper";
```

### 2. Created Helper Methods

Added three helper methods to properly handle image URLs:

```typescript
getListingImage(listing: Listing): string {
  // Try coverImageUrl first, then first image, then placeholder
  if (listing.coverImageUrl) {
    return ImageUrlHelper.getFullImageUrl(listing.coverImageUrl);
  }
  if (listing.images && listing.images.length > 0) {
    return ImageUrlHelper.getFullImageUrl(listing.images[0].url);
  }
  return ImageUrlHelper.getPlaceholderImage();
}

getBookingListingImage(booking: Booking): string {
  if (booking.listingImage) {
    return ImageUrlHelper.getFullImageUrl(booking.listingImage);
  }
  return ImageUrlHelper.getPlaceholderImage();
}

getGuestAvatar(booking: Booking): string {
  if (booking.guestAvatar) {
    return ImageUrlHelper.getFullImageUrl(booking.guestAvatar);
  }
  return ImageUrlHelper.getPlaceholderImage();
}
```

### 3. Updated Template to Use Helper Methods

**File:** `landlord-dashboard.component.html`

**Listing Cards (Line ~252):**

```html
<!-- Before (WRONG) -->
<img
  [src]="listing.coverImage || listing.images[0]?.imageUrl || '/images/default-listing.jpg'"
/>

<!-- After (CORRECT) -->
<img [src]="getListingImage(listing)" [alt]="listing.title" />
```

**Booking Cards - Listing Image:**

```html
<!-- Before (WRONG) -->
<img [src]="booking.listingImage || '/images/default-listing.jpg'" />

<!-- After (CORRECT) -->
<img [src]="getBookingListingImage(booking)" [alt]="booking.listingTitle" />
```

**Booking Cards - Guest Avatar:**

```html
<!-- Before (WRONG) -->
<img [src]="booking.guestAvatar || '/images/default-avatar.png'" />

<!-- After (CORRECT) -->
<img [src]="getGuestAvatar(booking)" [alt]="booking.guestName" />
```

## Comparison with Listing Card Component

The listing-card component already implements this correctly:

```typescript
getDisplayImage(): string {
  if (this.listing.images && this.listing.images.length > 0) {
    const imageUrl = this.listing.images[this.currentImageIndex]?.url || this.listing.coverImageUrl || '';
    return ImageUrlHelper.getFullImageUrl(imageUrl);
  }
  return this.listing.coverImageUrl
    ? ImageUrlHelper.getFullImageUrl(this.listing.coverImageUrl)
    : ImageUrlHelper.getPlaceholderImage();
}
```

The landlord dashboard now follows the same pattern.

## Files Modified

1. `frontend/src/app/features/profile/landlord-dashboard/landlord-dashboard.component.ts`

   - Added `ImageUrlHelper` import
   - Added `getListingImage()` method
   - Added `getBookingListingImage()` method
   - Added `getGuestAvatar()` method

2. `frontend/src/app/features/profile/landlord-dashboard/landlord-dashboard.component.html`
   - Fixed listing image binding (line ~252)
   - Fixed booking listing image binding
   - Fixed guest avatar image binding

## Benefits

✅ **Correct property names**: Using `coverImageUrl` instead of non-existent `coverImage`  
✅ **Proper URL conversion**: All backend URLs converted to full URLs  
✅ **Consistent with listing-card**: Same pattern used across components  
✅ **Graceful fallbacks**: Proper placeholder images when no image available  
✅ **No TypeScript errors**: All properties match the interface definitions  
✅ **DRY principle**: Reusable helper methods instead of inline logic

## Testing Checklist

- ✅ Navigate to landlord dashboard
- ✅ Verify listing cards display images correctly
- ✅ Verify pending booking cards show listing images
- ✅ Verify pending booking cards show guest avatars
- ✅ Test with listings that have `coverImageUrl`
- ✅ Test with listings that only have images array
- ✅ Test with listings that have no images (should show placeholder)
- ✅ No console errors about missing properties

## Related Patterns

This fix ensures consistency with:

- `listing-card.component.ts` - Uses `coverImageUrl` and `ImageUrlHelper`
- `listing-detail.component.ts` - Uses `ImageUrlHelper` for landlord avatars
- `profile-view.component.ts` - Uses `ImageUrlHelper` for user profiles
- `listing-list.component.html` - Uses `ImageUrlHelper` for listing images

---

**Status:** ✅ Complete  
**Date:** December 19, 2025  
**Impact:** Fixed incorrect property names and missing URL conversion in landlord dashboard images
