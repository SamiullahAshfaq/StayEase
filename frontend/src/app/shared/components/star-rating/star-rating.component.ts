import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive()">
      <button 
        *ngFor="let star of stars" 
        type="button"
        class="star"
        [class.filled]="displayRating() >= star"
        [class.half]="displayRating() >= star - 0.5 && displayRating() < star"
        [disabled]="!interactive()"
        (click)="onStarClick(star)"
        (mouseenter)="onStarHover(star)"
        (mouseleave)="onStarLeave()">
        <svg 
          [attr.width]="size()" 
          [attr.height]="size()" 
          fill="currentColor" 
          viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </button>
      <span class="rating-text" *ngIf="showValue()">{{ rating() }}</span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .star {
      background: none;
      border: none;
      cursor: default;
      padding: 0;
      color: #e0e0e0;
      transition: color 0.2s, transform 0.2s;
    }

    .star-rating.interactive .star {
      cursor: pointer;
    }

    .star-rating.interactive .star:hover {
      transform: scale(1.1);
    }

    .star.filled {
      color: #ff385c;
    }

    .star.half {
      background: linear-gradient(90deg, #ff385c 50%, #e0e0e0 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .star svg {
      display: block;
    }

    .rating-text {
      margin-left: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #222;
    }
  `]
})
export class StarRatingComponent {
  // Inputs
  rating = input<number>(0);
  size = input<number>(20);
  interactive = input<boolean>(false);
  showValue = input<boolean>(false);

  // Outputs
  ratingChange = output<number>();

  // State
  hoveredRating = 0;
  stars = [1, 2, 3, 4, 5];

  displayRating(): number {
    return this.hoveredRating || this.rating();
  }

  onStarClick(star: number) {
    if (this.interactive()) {
      this.ratingChange.emit(star);
    }
  }

  onStarHover(star: number) {
    if (this.interactive()) {
      this.hoveredRating = star;
    }
  }

  onStarLeave() {
    this.hoveredRating = 0;
  }
}
