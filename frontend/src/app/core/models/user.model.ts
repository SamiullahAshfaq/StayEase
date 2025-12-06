export interface User {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  language: string;
  currency: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  accountStatus: AccountStatus;
  authorities: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  agreeToTerms: boolean;
  isLandlord?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  language?: string;
  currency?: string;
  password?: string;
}