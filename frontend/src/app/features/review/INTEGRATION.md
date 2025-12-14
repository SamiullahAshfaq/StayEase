# Review System Integration Guide

## Quick Start

### 1. Verify Backend is Running

Ensure your Spring Boot backend is running with the Review domain:

```bash
cd backend
./mvnw spring-boot:run
```

Backend endpoints should be available at: `http://localhost:8080/api/reviews`

### 2. Import Review Components

Add to your app routes:

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import {
  ReviewFormComponent,
  ReviewListComponent,
  ReviewDashboardComponent,
} from './features/review';

export const routes: Routes = [
  // ... existing routes

  // Review routes
  {
    path: 'review/write',
    component: ReviewFormComponent,
    // canActivate: [AuthGuard] // Add if you have auth
  },
  {
    path: 'reviews',
    component: ReviewDashboardComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'property/:id/reviews',
    component: ReviewListComponent,
  },
  {
    path: 'service/:id/reviews',
    component: ReviewListComponent,
  },
];
```

### 3. Add to Property Details Page

```typescript
// src/app/features/property/property-detail/property-detail.component.ts
import { ReviewListComponent } from '@features/review';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReviewListComponent, // Add this
  ],
  template: `
    <div class="property-details">
      <!-- Your property info -->

      <!-- Reviews Section -->
      <section class="reviews-section">
        <app-review-list [propertyPublicId]="propertyId()" [showStatistics]="true" />
      </section>
    </div>
  `,
})
export class PropertyDetailComponent {
  propertyId = signal<string>('');
  // ... rest of your component
}
```

### 4. Add Write Review Link After Booking

```typescript
// src/app/features/booking/booking-confirmation/booking-confirmation.component.html
<div class="booking-confirmation">
  <h1>Booking Confirmed!</h1>

  <!-- After checkout date has passed -->
  <div class="post-stay-actions" *ngIf="isPastStay()">
    <h3>How was your stay?</h3>
    <a
      [routerLink]="['/review/write']"
      [queryParams]="{
        booking: bookingPublicId(),
        reviewType: 'PROPERTY_REVIEW',
        revieweePublicId: hostPublicId(),
        propertyPublicId: propertyPublicId()
      }"
      class="btn btn-primary">
      Write a Review
    </a>
  </div>
</div>
```

### 5. Add Review Dashboard to User Menu

```typescript
// src/app/layout/main-layout/main-layout.component.html
<nav class="user-menu">
  <a routerLink="/bookings">My Bookings</a>
  <a routerLink="/reviews">My Reviews</a>  <!-- Add this -->
  <a routerLink="/profile">My Profile</a>
  <a (click)="logout()">Logout</a>
</nav>
```

## Component Examples

### Example 1: Property Review Form

```typescript
<app-review-form
  [bookingPublicId]="'BK-123456'"
  [reviewType]="ReviewType.PROPERTY_REVIEW"
  [revieweePublicId]="'USR-HOST-789'"
  [propertyPublicId]="'PROP-456'"
  [revieweeName]="'Sarah'"
  [propertyTitle]="'Cozy Downtown Loft'"
/>
```

### Example 2: Service Review Form

```typescript
<app-review-form
  [bookingPublicId]="'SB-123456'"
  [reviewType]="ReviewType.SERVICE_REVIEW"
  [revieweePublicId]="'USR-PROVIDER-789'"
  [servicePublicId]="'SRV-456'"
  [revieweeName]="'Chef Marco'"
  [propertyTitle]="'Home Chef Service'"
/>
```

### Example 3: Review List with Filters

```typescript
<app-review-list
  [propertyPublicId]="propertyId()"
  [revieweePublicId]="hostId()"
  [showStatistics]="true"
/>
```

## API Configuration

Ensure your environment file has the correct API URL:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
};
```

## HTTP Interceptor (if not already configured)

If you don't have an HTTP interceptor for auth tokens:

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};

// Add to app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

## Testing the Integration

### 1. Test Review Submission

1. Navigate to `/review/write?booking=TEST-BOOKING-123`
2. Fill out all rating categories
3. Write a comment (min 30 characters)
4. Upload photos (optional)
5. Preview and submit
6. Verify review appears in backend

### 2. Test Review List

1. Navigate to `/property/PROP-123/reviews`
2. Verify reviews load
3. Test filters (by rating, with photos)
4. Test sorting (recent, highest rated, most helpful)
5. Click "Helpful" button
6. Test pagination

### 3. Test Review Dashboard

1. Navigate to `/reviews`
2. Check "Pending" tab for reviews to write
3. Check "Written" tab for your reviews
4. Check "Received" tab for reviews about you
5. Test responding to reviews

## Common Issues & Solutions

### Issue 1: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:** Add CORS configuration to backend:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowCredentials(true);
    }
}
```

### Issue 2: 401 Unauthorized

```
Failed to load reviews: 401 Unauthorized
```

**Solution:** Ensure auth token is being sent:

1. Check localStorage has 'authToken'
2. Verify HTTP interceptor is configured
3. Check backend authentication

### Issue 3: Photos Not Uploading

```
Photos show but don't persist
```

**Solution:** Implement actual file upload:

```typescript
// In review-form.component.ts
async uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await this.http.post<{url: string}>(
    `${environment.apiUrl}/api/upload`,
    formData
  ).toPromise();

  return response!.url;
}
```

### Issue 4: Review Statistics Not Showing

```
Statistics showing 0 reviews
```

**Solution:** Check:

1. Backend has reviews for the property
2. PropertyPublicId is correct
3. Reviews are PUBLISHED status
4. API endpoint `/api/reviews/statistics` is working

## Styling Customization

To match your app's theme, update these CSS variables:

```css
/* Add to global styles.css */
:root {
  --review-primary-color: #ff385c;
  --review-text-primary: #222;
  --review-text-secondary: #717171;
  --review-border-color: #ebebeb;
  --review-background: #f7f7f7;
}
```

Then update component CSS to use these variables.

## Performance Optimization

### 1. Lazy Loading

```typescript
// app.routes.ts
{
  path: 'reviews',
  loadComponent: () => import('./features/review/review-dashboard/review-dashboard.component')
    .then(m => m.ReviewDashboardComponent)
}
```

### 2. Image Optimization

- Use WebP format for photos
- Implement lazy loading for images
- Add image compression before upload

### 3. Pagination

- Already implemented with page size of 10
- Adjust in review-list.component.ts if needed

## Next Steps

1. ✅ Integrate with your property detail page
2. ✅ Add to booking confirmation flow
3. ✅ Set up photo upload to cloud storage
4. ✅ Configure email notifications for new reviews
5. ✅ Add review moderation for admin
6. ✅ Test on mobile devices
7. ✅ Deploy to production

## Support

For issues or questions:

- Check backend logs: `backend/logs/spring.log`
- Check browser console for frontend errors
- Verify API endpoints with Postman
- Review backend Review controller endpoints

---

Happy coding! 🚀
