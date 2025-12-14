// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  auth0: {
    domain: 'dev-k03ztn804p2l0zs8.us.auth0.com',
    clientId: 'VbSEaE4pZLPwIoGAd5N8ue23H8ci2wQs',
    audience: 'https://stayease-api',
    redirectUri: 'http://localhost:4200/callback'
  }
};
