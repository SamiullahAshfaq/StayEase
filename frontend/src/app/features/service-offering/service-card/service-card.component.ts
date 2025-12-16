import { Component, Input, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceOffering, PricingType } from '../models/service-offering.model';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ServiceCardComponent implements OnInit {
  @Input() service!: ServiceOffering;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  currentImageIndex = 0;
  isHovered = false;


  router = inject(Router);

  ngOnInit(): void {
    if (this.service) {
      console.log('Service card initialized:', this.service.publicId, 'Images:', this.service.images?.length);
    }
  }

  navigateToService(): void {
    console.log('Navigating to service detail:', this.service.publicId);
    this.router.navigate(['/services', this.service.publicId]);
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.service.images && this.currentImageIndex < this.service.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(event: Event): void {
    event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  setImage(index: number, event: Event): void {
    event.stopPropagation();
    this.currentImageIndex = index;
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    // TODO: Implement favorite functionality
  }

  getDisplayImage(): string {
    if (this.service.images && this.service.images.length > 0) {
      const imageUrl = this.service.images[this.currentImageIndex]?.imageUrl || '';
      return ImageUrlHelper.getFullImageUrl(imageUrl);
    }
    return ImageUrlHelper.getServicePlaceholderImage(this.service.category);
  }

  getCategoryIcon(): string {
    return ImageUrlHelper.getServiceCategoryIcon(this.service.category);
  }

  getCategoryLabel(): string {
    return this.formatCategoryName(this.service.category);
  }

  formatCategoryName(category: string): string {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatPrice(): string {
    const price = this.service.basePrice.toFixed(0);
    switch (this.service.pricingType) {
      case PricingType.PER_HOUR:
        return `$${price}/hour`;
      case PricingType.PER_DAY:
        return `$${price}/day`;
      case PricingType.PER_PERSON:
        return `$${price}/person`;
      case PricingType.PER_SESSION:
        return `$${price}/session`;
      case PricingType.PER_ITEM:
        return `$${price}/item`;
      default:
        return `$${price}`;
    }
  }

  formatDuration(): string {
    if (this.service.durationMinutes) {
      const hours = Math.floor(this.service.durationMinutes / 60);
      const minutes = this.service.durationMinutes % 60;
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${minutes} min`;
      }
    }
    return '';
  }
}
