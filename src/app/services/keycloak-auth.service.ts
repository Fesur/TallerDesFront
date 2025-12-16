import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { KeycloakEventType } from 'keycloak-angular';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  private userProfile$ = new BehaviorSubject<UserProfile | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private platformId = inject(PLATFORM_ID);
  private kcEventsSub?: Subscription;

  constructor(private keycloakService: KeycloakService) {
    this.initializeAuth();
    this.subscribeToEvents();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      this.isAuthenticated$.next(isLoggedIn);
      
      if (isLoggedIn) {
        await this.loadProfile();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.isAuthenticated$.next(false);
    }
  }

  private subscribeToEvents(): void {
    this.kcEventsSub = this.keycloakService.keycloakEvents$?.subscribe(async event => {
      if (!event) return;
      switch (event.type) {
        case KeycloakEventType.OnAuthSuccess:
        case KeycloakEventType.OnTokenExpired:
        case KeycloakEventType.OnAuthRefreshSuccess:
          this.isAuthenticated$.next(true);
          await this.loadProfile();
          break;
        case KeycloakEventType.OnAuthLogout:
        case KeycloakEventType.OnAuthError:
          this.isAuthenticated$.next(false);
          this.userProfile$.next(null);
          break;
      }
    });
  }

  /**
   * Redirige al login de Keycloak
   */
  login(): Promise<void> {
    const redirectUri = this.getRedirectOrigin();
    return this.keycloakService.login({ redirectUri });
  }

  /**
   * Realiza logout y redirige
   */
  logout(): Promise<void> {
    this.userProfile$.next(null);
    this.isAuthenticated$.next(false);
    const redirectUri = this.getRedirectOrigin();
    return this.keycloakService.logout(redirectUri);
  }

  /**
   * Obtiene el token de acceso
   */
  getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): Promise<boolean> {
    return Promise.resolve(this.keycloakService.isLoggedIn());
  }

  /**
   * Observable del estado de autenticación
   */
  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Observable del perfil del usuario
   */
  get userProfile(): Observable<UserProfile | null> {
    return this.userProfile$.asObservable();
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfile$.value;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Obtiene todos los roles del usuario
   */
  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verifica si el usuario es empleado
   */
  isEmpleado(): boolean {
    return this.hasRole('empleado');
  }

  /**
   * Verifica si el usuario es un usuario estándar
   */
  isUser(): boolean {
    return this.hasRole('user');
  }

  /**
   * Obtiene el header de autorización para las peticiones HTTP
   */
  async getAuthorizationHeader(): Promise<{ Authorization: string }> {
    const token = await this.getToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Actualiza el token si es necesario
   */
  updateToken(minValidity: number = 5): Promise<boolean> {
    return this.keycloakService.updateToken(minValidity);
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.keycloakService.loadUserProfile();
      const roles = this.keycloakService.getUserRoles();
      const userProfile: UserProfile = {
        id: profile.id || '',
        username: profile.username || '',
        email: profile.email || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        roles
      };
      this.userProfile$.next(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
      this.userProfile$.next(null);
    }
  }

  private getRedirectOrigin(): string | undefined {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      return window.location.origin;
    }
    return undefined;
  }
}