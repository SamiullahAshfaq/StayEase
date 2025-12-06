import { Component, Input } from '@angular/core';

import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Listing } from '../models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
=======
  imports: [CardModule, ButtonModule, TagModule],
>>>>>>> 3bd6c1d (removed scss)
  templateUrl: './listing-card.component.html'
})
export class ListingCardComponent {
  @Input() listing!: Listing;

  constructor(private router: Router) {}

  viewDetails(): void {
    this.router.navigate(['/listings', this.listing.publicId]);
  }
}