import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceBreakdown } from '../../models/booking-enhanced.model';

@Component({
  selector: 'app-price-breakdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="price-breakdown">
      <h3 class="breakdown-title">Price details</h3>
      
      <!-- Base Price -->
      <div class="price-row">
        <span class="price-label">
          {{ priceBreakdown().currency || '$' }}{{ priceBreakdown().pricePerNight | number:'1.2-2' }} x {{ priceBreakdown().numberOfNights }} night{{ priceBreakdown().numberOfNights > 1 ? 's' : '' }}
        </span>
        <span class="price-value">{{ priceBreakdown().currency || '$' }}{{ priceBreakdown().basePrice | number:'1.2-2' }}</span>
      </div>

      <!-- Discounts -->
      @if (priceBreakdown().discounts && priceBreakdown().discounts.length > 0) {
        @for (discount of priceBreakdown().discounts; track discount.type) {
          <div class="price-row discount">
            <span class="price-label">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="discount-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {{ discount.name }}
            </span>
            <span class="price-value discount-value">-{{ priceBreakdown().currency || '$' }}{{ discount.amount | number:'1.2-2' }}</span>
          </div>
        }
      }

      <!-- Addons -->
      @if (priceBreakdown().addonsTotal > 0) {
        <div class="price-row">
          <span class="price-label">Add-ons</span>
          <span class="price-value">{{ priceBreakdown().currency || '$' }}{{ priceBreakdown().addonsTotal | number:'1.2-2' }}</span>
        </div>
      }

      <!-- Cleaning Fee -->
      @if (priceBreakdown().cleaningFee > 0) {
        <div class="price-row">
          <span class="price-label">
            Cleaning fee
            <button class="info-btn" (click)="toggleInfo('cleaning')" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>
          </span>
          <span class="price-value">{{ priceBreakdown().currency || '$' }}{{ priceBreakdown().cleaningFee | number:'1.2-2' }}</span>
        </div>
        @if (showInfo() === 'cleaning') {
          <div class="info-text">One-time fee charged by host to cover the cost of cleaning their space.</div>
        }
      }

      <!-- Service Fee -->
      <div class="price-row">
        <span class="price-label">
          Service fee
          <button class="info-btn" (click)="toggleInfo('service')" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
        </span>
        <span class="price-value">{{ priceBreakdown().currency || '$' }}{{ priceBreakdown().serviceFee | number:'1.2-2' }}</span>
      </div>
      @if (showInfo() === 'service') {
        <div class="info-text">This helps us run our platform and offer services like 24/7 support.</div>
      }

      <!-- Taxes -->
      @if (priceBreakdown().taxAmount > 0) {
        <div class="price-row">
          <span class="price-label">
            Taxes
            <button class="info-btn" (click)="toggleInfo('tax')" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>
          </span>
          <span class="price-value">{{ priceBreakdown().currency || '$' }}{{ priceBreakdown().taxAmount | number:'1.2-2' }}</span>
        </div>
        @if (showInfo() === 'tax') {
          <div class="info-text">Local taxes and fees collected by the government.</div>
        }
      }

      <div class="divider"></div>

      <!-- Total -->
      <div class="price-row total">
        <span class="price-label total-label">Total ({{ priceBreakdown().currency || 'USD' }})</span>
        <span class="price-value total-value">{{ priceBreakdown().currency || '$' }}{{ priceBreakdown().totalPrice | number:'1.2-2' }}</span>
      </div>

      @if (showSavings()) {
        <div class="savings-badge">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
          You're saving {{ priceBreakdown().currency || '$' }}{{ totalSavings() | number:'1.2-2' }}
        </div>
      }
    </div>
  `,
  styles: [`
    .price-breakdown {
      padding: 1.5rem;
      border: 1px solid #DDDDDD;
      border-radius: 12px;
      background: white;
    }

    .breakdown-title {
      font-size: 1.375rem;
      font-weight: 600;
      color: #222;
      margin: 0 0 1.5rem 0;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      font-size: 1rem;
    }

    .price-label {
      color: #222;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-value {
      color: #222;
      font-weight: 400;
    }

    .discount {
      color: #008A05;
    }

    .discount-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .discount-value {
      color: #008A05;
      font-weight: 500;
    }

    .info-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #717171;
      transition: color 0.2s;
    }

    .info-btn:hover {
      color: #222;
    }

    .info-btn svg {
      width: 1rem;
      height: 1rem;
    }

    .info-text {
      font-size: 0.875rem;
      color: #717171;
      padding: 0.5rem 0 1rem;
      line-height: 1.5;
    }

    .divider {
      border-top: 1px solid #DDDDDD;
      margin: 1rem 0;
    }

    .total {
      padding: 1rem 0 0;
    }

    .total-label {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .total-value {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .savings-badge {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #E8F5E9;
      border-radius: 8px;
      color: #2E7D32;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .savings-badge svg {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }
  `]
})
export class PriceBreakdownComponent {
  @Input({ required: true }) set breakdown(value: PriceBreakdown | null | undefined) {
    if (value) {
      this.priceBreakdown.set(value);
    }
  }

  priceBreakdown = signal<PriceBreakdown>({
    basePrice: 0,
    pricePerNight: 0,
    numberOfNights: 0,
    cleaningFee: 0,
    serviceFee: 0,
    taxAmount: 0,
    discounts: [],
    addonsTotal: 0,
    totalBeforeTaxes: 0,
    totalPrice: 0,
    currency: '$'
  });

  showInfo = signal<string | null>(null);

  totalSavings = computed(() => {
    return this.priceBreakdown().discounts.reduce((sum: number, d: any) => sum + d.amount, 0);
  });

  showSavings = computed(() => {
    return this.totalSavings() > 0;
  });

  toggleInfo(type: string) {
    if (this.showInfo() === type) {
      this.showInfo.set(null);
    } else {
      this.showInfo.set(type);
    }
  }
}
