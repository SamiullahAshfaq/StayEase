import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../services/review.service';
import { Review, ReviewFilter, ReviewStatistics } from '../models/review.model';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css'
})
export class ReviewListComponent implements OnInit {
  private reviewService = inject(ReviewService);

  // Optional inputs for filtering
  propertyPublicId = input<string>();
  revieweePublicId = input<string>();
  showStatistics = input<boolean>(true);

  // State
  reviews = signal<Review[]>([]);
  statistics = signal<ReviewStatistics | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(10);

  // Filters
  selectedRating = signal<number | null>(null);
  sortBy = signal<'createdAt' | 'overallRating' | 'helpfulCount'>('createdAt');
  onlyWithPhotos = signal(false);

  ngOnInit() {
    this.loadReviews();
    if (this.showStatistics() && this.propertyPublicId()) {
      this.loadStatistics();
    }
  }

  loadReviews() {
    this.loading.set(true);
    this.error.set(null);

    const filter: ReviewFilter = {
      propertyPublicId: this.propertyPublicId(),
      revieweePublicId: this.revieweePublicId(),
      minRating: this.selectedRating() || undefined,
      maxRating: this.selectedRating() || undefined,
      hasPhotos: this.onlyWithPhotos() || undefined,
      sortBy: this.sortBy(),
      sortDirection: 'desc',
      page: this.currentPage(),
      size: this.pageSize()
    };

    this.reviewService.getReviews(filter).subscribe({
      next: (response) => {
        const data = response.data;
        this.reviews.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.currentPage.set(data.currentPage);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.error.set('Failed to load reviews. Please try again.');
        this.loading.set(false);
      }
    });
  }

  loadStatistics() {
    if (!this.propertyPublicId()) return;

    this.reviewService.getStatistics(this.propertyPublicId()!, 'property').subscribe({
      next: (response) => {
        this.statistics.set(response.data);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  /**
   * Filter methods
   */
  filterByRating(rating: number | null) {
    this.selectedRating.set(rating);
    this.currentPage.set(0);
    this.loadReviews();
  }

  togglePhotosOnly() {
    this.onlyWithPhotos.set(!this.onlyWithPhotos());
    this.currentPage.set(0);
    this.loadReviews();
  }

  changeSortBy(sortBy: 'createdAt' | 'overallRating' | 'helpfulCount') {
    this.sortBy.set(sortBy);
    this.currentPage.set(0);
    this.loadReviews();
  }

  /**
   * Pagination
   */
  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.loadReviews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.loadReviews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Review actions
   */
  toggleHelpful(review: Review) {
    if (review.isHelpfulByCurrentUser) {
      this.reviewService.unmarkHelpful(review.publicId).subscribe({
        next: () => {
          review.isHelpfulByCurrentUser = false;
          review.helpfulCount--;
        },
        error: (err) => {
          console.error('Error unmarking helpful:', err);
        }
      });
    } else {
      this.reviewService.markHelpful(review.publicId).subscribe({
        next: () => {
          review.isHelpfulByCurrentUser = true;
          review.helpfulCount++;
        },
        error: (err) => {
          console.error('Error marking helpful:', err);
        }
      });
    }
  }

  reportReview(review: Review, reason: string) {
    this.reviewService.reportReview(review.publicId, reason).subscribe({
      next: () => {
        review.isReportedByCurrentUser = true;
        alert('Review reported. Thank you for your feedback.');
      },
      error: (err) => {
        console.error('Error reporting review:', err);
        alert('Failed to report review. Please try again.');
      }
    });
  }

  /**
   * Helper methods
   */
  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  }

  getProgressPercentage(count: number): number {
    if (!this.statistics()) return 0;
    return (count / this.statistics()!.totalReviews) * 100;
  }
}
