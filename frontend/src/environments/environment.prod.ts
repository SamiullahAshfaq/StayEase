// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api',
  auth0: {
    domain: 'dev-k03ztn804p2l0zs8.us.auth0.com',
    clientId: 'VbSEaE4pZLPwIoGAd5N8ue23H8ci2wQs',
    audience: 'https://stayease-api',
    redirectUri: 'https://your-production-domain.com/callback'
  }
};
