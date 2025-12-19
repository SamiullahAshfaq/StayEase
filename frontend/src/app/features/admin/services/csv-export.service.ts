import { Injectable } from '@angular/core';

/**
 * CSV Export Utility Service
 * Provides comprehensive CSV export functionality for admin data tables
 */
@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  /**
   * Export data to CSV file
   * @param data Array of objects to export
   * @param filename Desired filename without extension
   * @param columns Optional column configuration
   */
  exportToCsv<T>(data: T[], filename: string, columns?: ExportColumn[]): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const csv = this.convertToCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${filename}_${this.getTimestamp()}.csv`);
  }

  /**
   * Convert data array to CSV format
   */
  private convertToCSV<T>(data: T[], columns?: ExportColumn[]): string {
    if (!data || data.length === 0) return '';

    // Determine columns
    const cols = columns || this.inferColumns(data[0]);
    
    // Build CSV header
    const header = cols.map(col => this.escapeCSVField(col.label || col.key)).join(',');
    
    // Build CSV rows
    const rows = data.map(item => {
      return cols.map(col => {
        const value = this.getNestedValue(item, col.key);
        const formattedValue = col.formatter ? col.formatter(value, item) : value;
        return this.escapeCSVField(String(formattedValue ?? ''));
      }).join(',');
    });

    return [header, ...rows].join('\r\n');
  }

  /**
   * Infer columns from first data object
   */
  private inferColumns(obj: any): ExportColumn[] {
    return Object.keys(obj).map(key => ({
      key,
      label: this.formatLabel(key)
    }));
  }

  /**
   * Format key into readable label
   */
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Get nested object value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Escape CSV field (handle commas, quotes, newlines)
   */
  private escapeCSVField(field: string): string {
    if (field == null) return '';
    
    const str = String(field);
    
    // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
  }

  /**
   * Trigger file download
   */
  private downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get formatted timestamp for filename
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  /**
   * Export users to CSV
   */
  exportUsers(users: any[]): void {
    const columns: ExportColumn[] = [
      { key: 'publicId', label: 'ID' },
      { key: 'email', label: 'Email' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { 
        key: 'isActive', 
        label: 'Status',
        formatter: (value) => value ? 'Active' : 'Inactive'
      },
      { 
        key: 'isVerified', 
        label: 'Verified',
        formatter: (value) => value ? 'Yes' : 'No'
      },
      { 
        key: 'createdAt', 
        label: 'Created',
        formatter: (value) => value ? new Date(value).toLocaleDateString() : ''
      }
    ];

    this.exportToCsv(users, 'users', columns);
  }

  /**
   * Export bookings to CSV
   */
  exportBookings(bookings: any[]): void {
    const columns: ExportColumn[] = [
      { key: 'publicId', label: 'Booking ID' },
      { key: 'listingTitle', label: 'Listing' },
      { key: 'guestName', label: 'Guest' },
      { key: 'guestEmail', label: 'Guest Email' },
      { key: 'landlordName', label: 'Landlord' },
      { key: 'checkInDate', label: 'Check-in', formatter: (value) => new Date(value).toLocaleDateString() },
      { key: 'checkOutDate', label: 'Check-out', formatter: (value) => new Date(value).toLocaleDateString() },
      { key: 'numberOfGuests', label: 'Guests' },
      { key: 'totalPrice', label: 'Total', formatter: (value) => `$${Number(value).toFixed(2)}` },
      { key: 'bookingStatus', label: 'Status' },
      { key: 'paymentStatus', label: 'Payment' },
      { key: 'createdAt', label: 'Booked On', formatter: (value) => new Date(value).toLocaleDateString() }
    ];

    this.exportToCsv(bookings, 'bookings', columns);
  }

  /**
   * Export listings to CSV
   */
  exportListings(listings: any[]): void {
    const columns: ExportColumn[] = [
      { key: 'publicId', label: 'Listing ID' },
      { key: 'title', label: 'Title' },
      { key: 'location', label: 'Location' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
      { key: 'landlordName', label: 'Landlord' },
      { key: 'landlordEmail', label: 'Landlord Email' },
      { key: 'pricePerNight', label: 'Price/Night', formatter: (value) => `$${Number(value).toFixed(2)}` },
      { key: 'maxGuests', label: 'Max Guests' },
      { key: 'propertyType', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'instantBook', label: 'Instant Book', formatter: (value) => value ? 'Yes' : 'No' },
      { key: 'createdAt', label: 'Created', formatter: (value) => new Date(value).toLocaleDateString() }
    ];

    this.exportToCsv(listings, 'listings', columns);
  }
}

/**
 * CSV Export Column Configuration
 */
export interface ExportColumn {
  key: string;
  label?: string;
  formatter?: (value: any, row?: any) => any;
}
