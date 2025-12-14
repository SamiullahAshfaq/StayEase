import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review.model';

interface PendingReview {
  bookingPublicId: string;
  propertyTitle: string;
  propertyImage: string;
  hostName: string;
  checkInDate: string;
  checkOutDate: string;
  canReviewUntil: string;
}

@Component({
  selector: 'app-review-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './review-dashboard.component.html',
  styleUrl: './review-dashboard.component.css'
})
export class ReviewDashboardComponent implements OnInit {
  private reviewService = inject(ReviewService);

  // Tabs
  activeTab = signal<'pending' | 'written' | 'received'>('pending');

  // Data
  pendingReviews = signal<PendingReview[]>([]);
  writtenReviews = signal<Review[]>([]);
  receivedReviews = signal<Review[]>([]);
  
  // State
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    if (this.activeTab() === 'pending') {
      this.loadPendingReviews();
    } else if (this.activeTab() === 'written') {
      this.loadWrittenReviews();
    } else {
      this.loadReceivedReviews();
    }
  }

  loadPendingReviews() {
    this.reviewService.getPendingReviews().subscribe({
      next: (response) => {
        this.pendingReviews.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending reviews:', err);
        this.error.set('Failed to load pending reviews.');
        this.loading.set(false);
      }
    });
  }

  loadWrittenReviews() {
    this.reviewService.getMyReviews(0, 20).subscribe({
      next: (response) => {
        this.writtenReviews.set(response.data.content);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading written reviews:', err);
        this.error.set('Failed to load your reviews.');
        this.loading.set(false);
      }
    });
  }

  loadReceivedReviews() {
    this.reviewService.getReviewsAboutMe(0, 20).subscribe({
      next: (response) => {
        this.receivedReviews.set(response.data.content);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading received reviews:', err);
        this.error.set('Failed to load reviews about you.');
        this.loading.set(false);
      }
    });
  }

  switchTab(tab: 'pending' | 'written' | 'received') {
    this.activeTab.set(tab);
    this.loadData();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getDaysRemaining(dateString: string): number {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
