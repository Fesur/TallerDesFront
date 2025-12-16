import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthGuard implements CanActivate {

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  private platformId = inject(PLATFORM_ID);

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      
      if (isLoggedIn) {
        return true;
      }

      // Si no está autenticado, redirige al login de Keycloak
      const redirectUri = isPlatformBrowser(this.platformId) && typeof window !== 'undefined'
        ? window.location.href
        : undefined;
      await this.keycloakService.login({ redirectUri });
      
      return false;
    } catch (error) {
      console.error('Error en AuthGuard:', error);
      return this.router.parseUrl('/');
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    
    if (!isLoggedIn) {
      await this.keycloakService.login();
      return false;
    }

    // Verificar roles específicos según la ruta
    const url = this.router.url;
    
    if (url.includes('/admin')) {
      return this.keycloakService.isUserInRole('admin');
    }
    
    if (url.includes('/empleado')) {
      return this.keycloakService.isUserInRole('empleado') || 
             this.keycloakService.isUserInRole('admin');
    }

    return this.keycloakService.isUserInRole('user') || 
           this.keycloakService.isUserInRole('empleado') || 
           this.keycloakService.isUserInRole('admin');
  }
}