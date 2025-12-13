import { Component, inject, OnInit, PLATFORM_ID, signal, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/auth/auth.service';

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);
  router = inject(Router);

  // Menu states
  isMenuOpen = false;
  isSearchExpanded = signal(false);
  activeSearchSection = signal<'where' | 'when' | 'who' | null>(null);

  // Reactive properties
  currentUser: User | null = null;
  isAuthenticated = false;

  // Search inputs
  searchDestination = signal('');
  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  guests = signal<GuestCount>({ adults: 1, children: 0, infants: 0 });

  // Date picker state
  currentMonth = signal(new Date());
  selectedStartDate = signal<Date | null>(null);
  selectedEndDate = signal<Date | null>(null);

  ngOnInit() {
    console.log('Header Component ngOnInit called');
    console.log('Is Browser?', isPlatformBrowser(this.platformId));

    // Only initialize auth state in browser
    if (isPlatformBrowser(this.platformId)) {
      // Small delay to ensure localStorage is accessible
      setTimeout(() => {
        this.updateAuthState();

        // Subscribe to user changes
        this.authService.currentUser$.subscribe(user => {
          console.log('Header - User changed:', user);
          this.updateAuthState();
        });
      }, 0);
    }
  }

  private updateAuthState() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Header - Auth state updated');
    console.log('Header - isAuthenticated:', this.isAuthenticated);
    console.log('Header - currentUser:', this.currentUser);
  }

  // Search section handlers
  setActiveSection(section: 'where' | 'when' | 'who' | null) {
    this.activeSearchSection.set(section);
    if (section) {
      this.isSearchExpanded.set(true);
    }
  }

  closeSearch() {
    this.isSearchExpanded.set(false);
    this.activeSearchSection.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.closeSearch();
    }
  }

  // Guest counter methods
  incrementGuests(type: keyof GuestCount) {
    const current = this.guests();
    this.guests.set({ ...current, [type]: current[type] + 1 });
  }

  decrementGuests(type: keyof GuestCount) {
    const current = this.guests();
    if (current[type] > (type === 'adults' ? 1 : 0)) {
      this.guests.set({ ...current, [type]: current[type] - 1 });
    }
  }

  getTotalGuests(): number {
    const g = this.guests();
    return g.adults + g.children;
  }

  getGuestText(): string {
    const total = this.getTotalGuests();
    const infants = this.guests().infants;
    let text = `${total} guest${total !== 1 ? 's' : ''}`;
    if (infants > 0) {
      text += `, ${infants} infant${infants !== 1 ? 's' : ''}`;
    }
    return text;
  }

  // Date picker methods
  getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty slots for days before month starts
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(0));
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  selectDate(date: Date) {
    if (date.getTime() === 0) return;

    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (!start || (start && end)) {
      // Starting new selection
      this.selectedStartDate.set(date);
      this.selectedEndDate.set(null);
      this.checkInDate.set(date);
      this.checkOutDate.set(null);
    } else if (start && !end) {
      // Completing selection
      if (date > start) {
        this.selectedEndDate.set(date);
        this.checkOutDate.set(date);
      } else {
        this.selectedStartDate.set(date);
        this.selectedEndDate.set(null);
        this.checkInDate.set(date);
        this.checkOutDate.set(null);
      }
    }
  }

  isDateInRange(date: Date): boolean {
    if (date.getTime() === 0) return false;
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();
    if (!start || !end) return false;
    return date > start && date < end;
  }

  isDateSelected(date: Date): boolean {
    if (date.getTime() === 0) return false;
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();
    return !!(start && date.getTime() === start.getTime()) || !!(end && date.getTime() === end.getTime());
  }

  nextMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  previousMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Navigation and auth
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  signup() {
    this.router.navigate(['/auth/register']);
  }

  logout() {
    this.authService.logout();
  }

  // Search action
  performSearch() {
    console.log('Search:', {
      destination: this.searchDestination(),
      checkIn: this.checkInDate(),
      checkOut: this.checkOutDate(),
      guests: this.guests()
    });
    this.closeSearch();
    // Navigate to listings with search params
    this.router.navigate(['/listings']);
  }
}
