// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { environment } from '../environments/environment';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    // REMOVED: provideZonelessChangeDetection() - This was causing change detection issues
    provideRouter(routes),
    provideEchartsCore({ echarts }),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor])
    ),
    provideAnimations(),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: environment.auth0.redirectUri,
        // audience: environment.auth0.audience,  // Temporarily disabled for testing
        scope: 'openid profile email'
      }
      // httpInterceptor disabled temporarily for testing
      // httpInterceptor: {
      //   allowedList: [
      //     {
      //       uri: `${environment.apiUrl}/*`,
      //       tokenOptions: {
      //         authorizationParams: {
      //           audience: environment.auth0.audience,
      //           scope: 'openid profile email'
      //         }
      //       }
      //     }
      //   ]
      // }
    })
  ]
};
