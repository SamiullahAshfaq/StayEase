import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface CreatePaymentDTO {
  relatedBookingId: number;
  payerPublicId: string;
  payeePublicId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
  transactionReference?: string;
}

export interface PaymentDTO {
  publicId: string;
  relatedBookingId: number;
  payerPublicId: string;
  payeePublicId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  createPayment(dto: CreatePaymentDTO): Observable<ApiResponse<PaymentDTO>> {
    return this.http.post<ApiResponse<PaymentDTO>>(this.apiUrl, dto);
  }

  getPayment(publicId: string): Observable<ApiResponse<PaymentDTO>> {
    return this.http.get<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${publicId}`);
  }

  getMyPayments(page = 0, size = 10): Observable<ApiResponse<PageResponse<PaymentDTO>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<PaymentDTO>>>(`${this.apiUrl}/my-payments`, { params });
  }

  getMyEarnings(page = 0, size = 10): Observable<ApiResponse<PageResponse<PaymentDTO>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<PaymentDTO>>>(`${this.apiUrl}/my-earnings`, { params });
  }

  getPaymentsByBooking(bookingId: number): Observable<ApiResponse<PaymentDTO[]>> {
    return this.http.get<ApiResponse<PaymentDTO[]>>(`${this.apiUrl}/booking/${bookingId}`);
  }

  updatePaymentStatus(publicId: string, dto: UpdatePaymentStatusDTO): Observable<ApiResponse<PaymentDTO>> {
    return this.http.put<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${publicId}/status`, dto);
  }

  processPayment(publicId: string, transactionReference?: string): Observable<ApiResponse<PaymentDTO>> {
    const params = transactionReference
      ? new HttpParams().set('transactionReference', transactionReference)
      : new HttpParams();
    return this.http.post<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${publicId}/process`, {}, { params });
  }

  completePayment(publicId: string, transactionReference?: string): Observable<ApiResponse<PaymentDTO>> {
    const params = transactionReference
      ? new HttpParams().set('transactionReference', transactionReference)
      : new HttpParams();
    return this.http.post<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${publicId}/complete`, {}, { params });
  }

  failPayment(publicId: string): Observable<ApiResponse<PaymentDTO>> {
    return this.http.post<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${publicId}/fail`, {});
  }

  refundPayment(publicId: string): Observable<ApiResponse<PaymentDTO>> {
    return this.http.post<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${publicId}/refund`, {});
  }

  getPaymentsByStatus(status: PaymentStatus, page = 0, size = 10): Observable<ApiResponse<PageResponse<PaymentDTO>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<PaymentDTO>>>(`${this.apiUrl}/status/${status}`, { params });
  }

  getAllPayments(page = 0, size = 10): Observable<ApiResponse<PageResponse<PaymentDTO>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<PaymentDTO>>>(`${this.apiUrl}/admin/all`, { params });
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case PaymentStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50';
      case PaymentStatus.PROCESSING:
        return 'text-blue-600 bg-blue-50';
      case PaymentStatus.FAILED:
        return 'text-red-600 bg-red-50';
      case PaymentStatus.REFUNDED:
        return 'text-purple-600 bg-purple-50';
      case PaymentStatus.CANCELLED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return 'Credit Card';
      case PaymentMethod.DEBIT_CARD:
        return 'Debit Card';
      case PaymentMethod.PAYPAL:
        return 'PayPal';
      case PaymentMethod.STRIPE:
        return 'Stripe';
      case PaymentMethod.BANK_TRANSFER:
        return 'Bank Transfer';
      case PaymentMethod.CASH:
        return 'Cash';
      case PaymentMethod.OTHER:
        return 'Other';
      default:
        return method;
    }
  }
}
