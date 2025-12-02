import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Listing } from '../models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './listing-card.component.html'
})
export class ListingCardComponent {
  @Input() listing!: Listing;

  constructor(private router: Router) {}

  viewDetails(): void {
    this.router.navigate(['/listings', this.listing.publicId]);
  }
}