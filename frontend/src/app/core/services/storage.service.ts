import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage', error);
      }
    }
  }

  getItem(key: string): string | null {
    if (this.isBrowser) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage', error);
        return null;
      }
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage', error);
      }
    }
  }

  clear(): void {
    if (this.isBrowser) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage', error);
      }
    }
  }
}
