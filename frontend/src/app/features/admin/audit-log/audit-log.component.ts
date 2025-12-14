import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AuditLog {
  id: number;
  publicId: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css'
})
export class AuditLogComponent implements OnInit {
  // Signals for reactive state
  logs = signal<AuditLog[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  // Filter states
  severityFilter = signal<string>('');
  entityTypeFilter = signal<string>('');
  searchTerm = signal<string>('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(20);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);

  // Selected log for details modal
  selectedLog = signal<AuditLog | null>(null);
  showLogModal = signal<boolean>(false);

  // For template access
  Math = Math;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set('');

    // Mock data for now - replace with actual API call
    setTimeout(() => {
      const mockLogs: AuditLog[] = [
        {
          id: 1,
          publicId: 'log-001',
          timestamp: new Date().toISOString(),
          action: 'USER_LOGIN',
          entityType: 'USER',
          entityId: 'user-123',
          actorId: 'user-123',
          actorName: 'John Doe',
          actorRole: 'ROLE_ADMIN',
          details: 'Successful login from IP 192.168.1.1',
          ipAddress: '192.168.1.1',
          severity: 'INFO'
        },
        {
          id: 2,
          publicId: 'log-002',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: 'LISTING_CREATED',
          entityType: 'LISTING',
          entityId: 'listing-456',
          actorId: 'user-789',
          actorName: 'Jane Smith',
          actorRole: 'ROLE_LANDLORD',
          details: 'Created new listing "Cozy Apartment"',
          ipAddress: '192.168.1.2',
          severity: 'INFO'
        },
        {
          id: 3,
          publicId: 'log-003',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action: 'BOOKING_CANCELLED',
          entityType: 'BOOKING',
          entityId: 'booking-789',
          actorId: 'user-456',
          actorName: 'Bob Johnson',
          actorRole: 'ROLE_GUEST',
          details: 'Cancelled booking for listing "Beach House"',
          ipAddress: '192.168.1.3',
          severity: 'WARNING'
        },
        {
          id: 4,
          publicId: 'log-004',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          action: 'PAYMENT_FAILED',
          entityType: 'PAYMENT',
          entityId: 'payment-101',
          actorId: 'system',
          actorName: 'System',
          actorRole: 'SYSTEM',
          details: 'Payment processing failed for booking #1234',
          ipAddress: 'N/A',
          severity: 'ERROR'
        },
        {
          id: 5,
          publicId: 'log-005',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          action: 'SECURITY_BREACH_ATTEMPT',
          entityType: 'SECURITY',
          entityId: 'security-001',
          actorId: 'unknown',
          actorName: 'Unknown',
          actorRole: 'UNAUTHORIZED',
          details: 'Multiple failed login attempts detected',
          ipAddress: '203.0.113.42',
          severity: 'CRITICAL'
        }
      ];

      this.logs.set(mockLogs);
      this.totalElements.set(mockLogs.length);
      this.totalPages.set(Math.ceil(mockLogs.length / this.pageSize()));
      this.loading.set(false);
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadLogs();
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadLogs();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadLogs();
    }
  }

  viewLog(log: AuditLog): void {
    this.selectedLog.set(log);
    this.showLogModal.set(true);
  }

  closeModal(): void {
    this.showLogModal.set(false);
    this.selectedLog.set(null);
  }

  getSeverityBadgeClass(severity: string): string {
    const classes = {
      'INFO': 'bg-blue-100 text-blue-800',
      'WARNING': 'bg-yellow-100 text-yellow-800',
      'ERROR': 'bg-red-100 text-red-800',
      'CRITICAL': 'bg-purple-100 text-purple-800'
    };
    return classes[severity as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getSeverityIcon(severity: string): string {
    const icons = {
      'INFO': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'WARNING': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'ERROR': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'CRITICAL': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[severity as keyof typeof icons] || icons['INFO'];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  exportLogs(): void {
    // TODO: Implement CSV export
    console.log('Exporting logs...');
  }
}
