import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ListingService } from '../listing/services/listing.service';
import { ListingCardComponent } from '../listing/listing-card/listing-card.component';
import { Listing } from '../listing/models/listing.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, ListingCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  categories = [
    { 
      name: 'Entire Homes', 
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop', 
      query: 'home',
      icon: '🏠'
    },
    { 
      name: 'Unique Stays', 
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format=fit=crop', 
      query: 'unique',
      icon: '✨'
    },
    { 
      name: 'Apartments', 
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format=fit=crop', 
      query: 'apartment',
      icon: '🏢'
    },
    { 
      name: 'Villas', 
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format=fit=crop', 
      query: 'villa',
      icon: '🏖️'
    }
  ];

  features = [
    {
      title: 'Best Price Guarantee',
      description: 'Find the best deals on accommodations',
      icon: '💰'
    },
    {
      title: 'Verified Hosts',
      description: 'All our hosts are verified for your safety',
      icon: '✓'
    },
    {
      title: '24/7 Support',
      description: 'We\'re here to help you anytime',
      icon: '📞'
    },
    {
      title: 'Instant Booking',
      description: 'Book instantly without waiting for approval',
      icon: '⚡'
    }
  ];

  searchQuery: string = '';
  featuredListings: Listing[] = [];
  loadingListings = false;

  constructor(
    private listingService: ListingService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Add smooth scroll behavior only in browser
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    this.loadFeaturedListings();
  }

  loadFeaturedListings(): void {
    this.loadingListings = true;
    this.listingService.getAllListings(0, 8).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.featuredListings = response.data.content;
        }
        this.loadingListings = false;
      },
      error: (error) => {
        console.error('Error loading featured listings:', error);
        this.loadingListings = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/listing/search'], {
        queryParams: { location: this.searchQuery }
      });
    } else {
      this.router.navigate(['/listing/search']);
    }
  }
}
