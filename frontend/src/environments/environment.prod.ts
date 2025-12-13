// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api',
  oauth: {
    google: {
      clientId: 'YOUR_PRODUCTION_GOOGLE_CLIENT_ID',
      redirectUri: 'https://your-production-domain.com/oauth2/redirect'
    },
    facebook: {
      clientId: 'YOUR_PRODUCTION_FACEBOOK_APP_ID',
      redirectUri: 'https://your-production-domain.com/oauth2/redirect'
    }
  }
};
