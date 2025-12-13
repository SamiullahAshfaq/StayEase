// src/app/core/models/auth.models.ts

export interface User {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  bio?: string;
  emailVerified: boolean;
  authorities: string[];
  oauthProvider?: string;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  authorities: string[];
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: UserType;
}

export enum UserType {
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD'
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: Date;
}
