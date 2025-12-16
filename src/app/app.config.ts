import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { KeycloakTokenInterceptor } from './interceptors/keycloak-token.interceptor';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { environment } from './environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const keycloakServerStub: Partial<KeycloakService> = {
  isLoggedIn: () => false,
  login: async () => undefined,
  logout: async () => undefined,
  loadUserProfile: async () => ({}) as any,
  getUserRoles: () => [],
  getToken: async () => '',
  updateToken: async () => true,
  isUserInRole: () => false,
};

function initializeKeycloak(keycloak: KeycloakService) {
  if (!isBrowser) {
    return () => Promise.resolve(true);
  }

  const origin = window.location.origin;
  const silentRedirect = `${origin}/assets/silent-check-sso.html`;

  return async () => {
    try {
      await keycloak.init({
        config: {
          url: 'http://localhost:8180',
          realm: 'library-realm',
          clientId: 'library-client',
        },
        initOptions: {
          onLoad: 'login-required',
          silentCheckSsoRedirectUri: silentRedirect,
          checkLoginIframe: false,
          pkceMethod: 'S256',
          flow: 'implicit'
        },
      });
    } catch (err) {
      console.error('Keycloak init failed; continuing without SSO:', err);
    }
  };
}

const keycloakProviders = isBrowser
  ? [
      KeycloakService,
      {
        provide: APP_INITIALIZER,
        useFactory: initializeKeycloak,
        multi: true,
        deps: [KeycloakService],
      },
    ]
  : [
      { provide: KeycloakService, useValue: keycloakServerStub as unknown as KeycloakService },
      {
        provide: APP_INITIALIZER,
        useValue: () => Promise.resolve(true),
        multi: true,
      },
    ];

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([KeycloakTokenInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    ...keycloakProviders,
  ],
};