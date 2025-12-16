import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const KeycloakTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);

  // Solo añadir token para peticiones al backend (Gateway)
  if (shouldAddToken(req.url)) {
    return from(addTokenToRequest(req, keycloakService)).pipe(
      switchMap(request => next(request))
    );
  }

  return next(req);
};

function shouldAddToken(url: string): boolean {
  // Añadir token solo para peticiones al Gateway de microservicios
  const gatewayUrl = 'http://localhost:8090';
  const microservicesUrls = ['/ms-book/', '/api/'];

  return url.startsWith(gatewayUrl) ||
         microservicesUrls.some(path => url.includes(path));
}

async function addTokenToRequest(req: any, keycloakService: KeycloakService): Promise<any> {
  try {
    const isLoggedIn = await keycloakService.isLoggedIn();

    if (isLoggedIn) {
      // Actualizar token si es necesario
      await keycloakService.updateToken(30);
      const token = await keycloakService.getToken();

      if (token) {
        return req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }
  } catch (error) {
    console.error('Error adding token:', error);
  }

  return req;
}