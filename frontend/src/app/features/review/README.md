# Review Frontend - StayEase

Comprehensive Airbnb-style review system frontend built with Angular 17+ standalone components.

## 🎯 Overview

This review system provides a complete user experience for writing, managing, and viewing reviews for properties, hosts, guests, and services.

## 📁 Structure

```
frontend/src/app/features/review/
├── models/
│   └── review.model.ts           # TypeScript interfaces and enums
├── services/
│   └── review.service.ts         # HTTP service for API calls
├── review-form/
│   ├── review-form.component.ts
│   ├── review-form.component.html
│   └── review-form.component.css
├── review-list/
│   ├── review-list.component.ts
│   ├── review-list.component.html
│   └── review-list.component.css
├── review-dashboard/
│   ├── review-dashboard.component.ts
│   ├── review-dashboard.component.html
│   └── review-dashboard.component.css
└── index.ts                      # Public API exports
```

## 🎨 Components

### 1. **ReviewFormComponent**

Multi-step review submission form with Airbnb-style UX.

**Features:**

- ✅ 4-step wizard: Ratings → Written Review → Photos → Preview
- ✅ 7 category ratings (overall, cleanliness, accuracy, check-in, communication, location, value)
- ✅ Interactive star rating with hover effects
- ✅ Title + detailed comment (min 30 chars)
- ✅ Optional private feedback to host
- ✅ Photo upload (up to 10 images)
- ✅ Preview before submission
- ✅ 14-day auto-publish notification

**Usage:**

```typescript
<app-review-form
  [bookingPublicId]="bookingId"
  [reviewType]="ReviewType.PROPERTY_REVIEW"
  [revieweePublicId]="hostId"
  [propertyPublicId]="propertyId"
  [revieweeName]="'Sarah'"
  [propertyTitle]="'Cozy Downtown Loft'"
/>
```

### 2. **ReviewListComponent**

Display reviews with statistics, filters, and pagination.

**Features:**

- ✅ Overall rating with star breakdown
- ✅ Category ratings (cleanliness, accuracy, etc.)
- ✅ Filter by rating (1-5 stars, with photos)
- ✅ Sort by: Most recent, Highest rated, Most helpful
- ✅ Review cards with photos
- ✅ Public responses from hosts
- ✅ Helpful voting
- ✅ Report functionality
- ✅ Verified stay badges
- ✅ Highlighted/top reviews
- ✅ Pagination

**Usage:**

```typescript
<app-review-list
  [propertyPublicId]="propertyId"
  [showStatistics]="true"
/>
```

### 3. **ReviewDashboardComponent**

Personal review management dashboard with 3 tabs.

**Features:**

- ✅ **Pending Tab**: Reviews you need to write (with deadlines)
- ✅ **Written Tab**: Reviews you've written
- ✅ **Received Tab**: Reviews about you (with response option)
- ✅ Status badges (pending, published, flagged)
- ✅ Response indicators
- ✅ Engagement metrics (helpful count)

**Usage:**

```typescript
<app-review-dashboard />
```

### 4. **StarRatingComponent** (Shared)

Reusable star rating component.

**Features:**

- ✅ Display-only or interactive mode
- ✅ Customizable size
- ✅ Hover effects
- ✅ Optional rating value display
- ✅ Half-star support

**Usage:**

```typescript
<app-star-rating
  [rating]="4.5"
  [size]="24"
  [interactive]="true"
  [showValue]="true"
  (ratingChange)="onRatingChange($event)"
/>
```

## 🔧 Service Methods

### ReviewService

```typescript
// Create & Update
createReview(request: CreateReviewRequest): Observable<ApiResponse<Review>>
updateReview(publicId: string, request: UpdateReviewRequest): Observable<ApiResponse<Review>>
deleteReview(publicId: string): Observable<ApiResponse<void>>

// Read
getReview(publicId: string): Observable<ApiResponse<Review>>
getReviews(filter: ReviewFilter): Observable<ApiResponse<ReviewListResponse>>
getPropertyReviews(propertyPublicId: string, page?, size?): Observable<ApiResponse<ReviewListResponse>>
getMyReviews(page?, size?): Observable<ApiResponse<ReviewListResponse>>
getReviewsAboutMe(page?, size?): Observable<ApiResponse<ReviewListResponse>>
getPendingReviews(): Observable<ApiResponse<any[]>>

// Actions
addResponse(publicId: string, response: ReviewResponse): Observable<ApiResponse<Review>>
markHelpful(publicId: string): Observable<ApiResponse<void>>
unmarkHelpful(publicId: string): Observable<ApiResponse<void>>
reportReview(publicId: string, reason: string): Observable<ApiResponse<void>>
publishNow(publicId: string): Observable<ApiResponse<Review>>

// Statistics
getStatistics(targetPublicId: string, targetType: 'property' | 'host'): Observable<ApiResponse<ReviewStatistics>>
canReviewBooking(bookingPublicId: string): Observable<ApiResponse<boolean>>
```

## 📊 Models

### Review Types

```typescript
enum ReviewType {
  PROPERTY_REVIEW    // Guest reviews property
  HOST_REVIEW        // Guest reviews host
  GUEST_REVIEW       // Host reviews guest
  SERVICE_REVIEW     // Customer reviews service
  EXPERIENCE_REVIEW  // Customer reviews experience
}
```

### Review Status

```typescript
enum ReviewStatus {
  PENDING           // Written but not published
  PUBLISHED         // Live on the platform
  FLAGGED           // Reported by users
  UNDER_REVIEW      // Admin reviewing
  APPROVED          // Admin approved
  REJECTED          // Admin rejected
  HIDDEN            // Temporarily hidden
  DELETED           // Soft deleted
}
```

### Rating Categories

- Overall (required)
- Cleanliness
- Accuracy
- Check-in
- Communication
- Location
- Value
- Respect (guest reviews)
- Follow Rules (guest reviews)

## 🎨 Design System

### Colors

- Primary: `#ff385c` (Airbnb Pink)
- Text Primary: `#222`
- Text Secondary: `#717171`
- Border: `#ebebeb`
- Background: `#f7f7f7`
- Success: `#15803d`
- Error: `#c13515`
- Warning: `#b78103`

### Typography

- Headings: 600 weight, #222
- Body: 400 weight, #222
- Secondary text: #717171
- Font sizes: 0.75rem - 2rem

### Components

- Border radius: 8px - 12px
- Shadows: `0 1px 2px rgba(0,0,0,0.08)` to `0 4px 16px rgba(0,0,0,0.12)`
- Transitions: 0.2s ease

## 🚀 Integration Steps

### 1. Add to Routes

```typescript
// app.routes.ts
import {
  ReviewFormComponent,
  ReviewListComponent,
  ReviewDashboardComponent,
} from './features/review';

export const routes: Routes = [
  // ... other routes
  {
    path: 'review/write',
    component: ReviewFormComponent,
  },
  {
    path: 'reviews',
    component: ReviewDashboardComponent,
  },
  {
    path: 'property/:id/reviews',
    component: ReviewListComponent,
  },
];
```

### 2. Update Environment

```typescript
// environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080', // Your backend URL
  // ... other config
};
```

### 3. Use in Property Details

```typescript
// property-detail.component.ts
import { ReviewListComponent } from '@features/review';

@Component({
  // ...
  imports: [CommonModule, RouterModule, ReviewListComponent],
  template: `
    <!-- Property info -->

    <!-- Reviews Section -->
    <app-review-list
      [propertyPublicId]="propertyId()"
      [showStatistics]="true"
    />
  `
})
```

### 4. Add to Booking Completion

```typescript
// booking-complete.component.ts
<a [routerLink]="['/review/write']"
   [queryParams]="{ booking: bookingId }">
  Write a review
</a>
```

## 📱 Responsive Design

All components are fully responsive with breakpoints at:

- Desktop: > 768px
- Tablet: 768px
- Mobile: < 768px

Mobile optimizations:

- Touch-friendly buttons (min 44px)
- Stacked layouts
- Simplified navigation
- Optimized photo grids

## ♿ Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text on images
- Color contrast compliance (WCAG AA)

## 🔒 Security

- XSS protection via Angular sanitization
- Input validation on all forms
- Rate limiting via backend
- Report functionality for inappropriate content

## 🧪 Testing Checklist

- [ ] Write a complete review with all fields
- [ ] Submit review with photos
- [ ] Filter reviews by rating
- [ ] Sort reviews by different criteria
- [ ] Mark review as helpful
- [ ] Report a review
- [ ] Respond to a review (host)
- [ ] View pending reviews
- [ ] Check deadline notifications
- [ ] Test on mobile devices
- [ ] Verify accessibility

## 📝 Notes

1. **Auto-publish Logic**: Reviews are auto-published after 14 days OR when the other party submits their review (Airbnb pattern)
2. **Photo Uploads**: Currently uses FileReader for demo. Integrate with your cloud storage (AWS S3, Azure Blob, etc.)
3. **Authentication**: Assumes JWT token is stored and automatically attached via HTTP interceptor
4. **Real-time Updates**: Consider adding WebSocket for instant review notifications

## 🎯 Future Enhancements

- [ ] Review translations
- [ ] Video reviews
- [ ] Review templates
- [ ] Bulk review management
- [ ] Advanced analytics
- [ ] Review insights (sentiment analysis)
- [ ] Gamification (review badges)

## 📚 Related Backend Files

- `backend/src/main/java/com/stayease/domain/review/entity/Review.java`
- `backend/src/main/java/com/stayease/domain/review/controller/ReviewController.java`
- `backend/src/main/java/com/stayease/domain/review/service/ReviewService.java`

---

**Built with ❤️ following Airbnb's design principles**
