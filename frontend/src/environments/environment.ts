// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  oauth: {
    google: {
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
      redirectUri: 'http://localhost:4200/oauth2/redirect'
    },
    facebook: {
      clientId: 'YOUR_FACEBOOK_APP_ID',
      redirectUri: 'http://localhost:4200/oauth2/redirect'
    }
  }
};
