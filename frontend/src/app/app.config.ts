// Change the import to the stable version
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { customAuthInterceptor } from './core/auth/custom-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Use the stable provider
    provideZonelessChangeDetection(),
    
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([customAuthInterceptor])),
    provideAnimations()
  ]
};