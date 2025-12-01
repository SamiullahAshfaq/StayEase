import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="container">
      <div class="coming-soon">
        <i class="pi pi-list" style="font-size: 4rem; color: var(--primary-navy);"></i>
        <h1>My Listings</h1>
        <p>This feature is coming soon! You'll be able to view and manage all your property listings here.</p>
        <button pButton label="Go Back" icon="pi pi-arrow-left" (click)="goBack()" class="p-button-outlined"></button>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon {
      text-align: center;
      padding: 4rem 2rem;
      max-width: 600px;
      margin: 0 auto;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-navy);
        margin: 1rem 0;
      }

      p {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        line-height: 1.6;
      }
    }
  `]
})
export class MyListingsComponent {
  goBack() {
    window.history.back();
  }
}