// Change the import to the stable version
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, InMemoryScrollingOptions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { customAuthInterceptor } from './core/auth/custom-auth.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled'
};

export const appConfig: ApplicationConfig = {
  providers: [
    // Use the stable provider
    provideZonelessChangeDetection(),
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withInMemoryScrolling(scrollConfig),
      withViewTransitions()
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([customAuthInterceptor, authInterceptor])
    ),
  ]
};