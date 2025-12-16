import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PLATFORM_ID } from '@angular/core';
import { KeycloakAuthService, UserProfile } from '../../services/keycloak-auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isMenuOpen = false;
  isAdmin = false;
  isEmpleado = false;
  userProfile: UserProfile | null = null;
  platformId = inject(PLATFORM_ID);
  
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: Auth,
    private router: Router,
    private keycloakAuthService: KeycloakAuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de autenticación de Keycloak
    const authSub = this.keycloakAuthService.isAuthenticated.subscribe(
      (isAuth) => {
        this.isLoggedIn = isAuth;
      }
    );
    
    const profileSub = this.keycloakAuthService.userProfile.subscribe(
      (profile) => {
        this.userProfile = profile;
        if (profile) {
          this.isAdmin = profile.roles.includes('admin');
          this.isEmpleado = profile.roles.includes('empleado');
        } else {
          this.isAdmin = false;
          this.isEmpleado = false;
        }
      }
    );

    this.subscriptions.push(authSub, profileSub);

    // Mantener compatibilidad con Firebase Auth (si aún se usa para algunas funciones)
    if (isPlatformBrowser(this.platformId)) {
      // Verificar estado inicial
      this.checkInitialAuthState();
      
      // Listener para Firebase (mantener por compatibilidad)
      onAuthStateChanged(this.auth, (user) => {
        if (isPlatformBrowser(this.platformId) && !this.isLoggedIn) {
          // Solo usar Firebase si Keycloak no está activo
          const userRole = localStorage.getItem('userRole');
          
          const isAdminByStorage = userRole === 'admin';
          const isAdminByEmail = user?.email === 'admin@gmail.com';
          
          const isEmpleadoByStorage = userRole === 'empleado';
          const isEmpleadoByEmail = user?.email === 'empleado@gmail.com';

          if (user && !this.isLoggedIn) {
            // Solo actualizar si Keycloak no está activo
            this.isAdmin = isAdminByStorage || isAdminByEmail;
            this.isEmpleado = isEmpleadoByStorage || isEmpleadoByEmail;
        
            // Set logged in state
            this.isLoggedIn = !!user || this.isAdmin || this.isEmpleado;
        
            // Ensure consistent state in localStorage
            if (this.isAdmin && !isAdminByStorage) {
              localStorage.setItem('userRole', 'admin');
            } else if (this.isEmpleado && !isEmpleadoByStorage) {
              localStorage.setItem('userRole', 'empleado');
            } else if (user && !this.isAdmin && !this.isEmpleado) {
              localStorage.setItem('userRole', 'user');
            }
          }
        }
      });
    }

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async checkInitialAuthState(): Promise<void> {
    try {
      const isKeycloakLoggedIn = await this.keycloakAuthService.isLoggedIn();
      if (!isKeycloakLoggedIn) {
        // Solo verificar localStorage si Keycloak no está activo
        const userRole = localStorage.getItem('userRole');
        this.isAdmin = userRole === 'admin';
        this.isEmpleado = userRole === 'empleado';
        this.isLoggedIn = !!userRole;
      }
    } catch (error) {
      console.error('Error checking initial auth state:', error);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async cerrarSesion() {
    try {
      // Verificar si hay sesión de Keycloak activa
      const isKeycloakLoggedIn = await this.keycloakAuthService.isLoggedIn();
      
      if (isKeycloakLoggedIn) {
        // Logout de Keycloak
        const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'Se cerrará tu sesión',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, cerrar sesión',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        });

        if (result.isConfirmed) {
          await this.keycloakAuthService.logout();
          // El logout de Keycloak redirigirá automáticamente
        }
      } else {
        // Logout de Firebase (compatibilidad)
        if (this.auth.currentUser) {
          await signOut(this.auth);
        }
        
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('userRole');
        }
        
        // Reset component state
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.isEmpleado = false;
        
        await Swal.fire({
          icon: 'success',
          title: '¡Hasta pronto!',
          text: 'Has cerrado sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });
        
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar la sesión'
      });
    }
  }

  /**
   * Login with Keycloak
   */
  async iniciarSesionKeycloak() {
    try {
      await this.keycloakAuthService.login();
    } catch (error) {
      console.error('Error al iniciar sesión con Keycloak:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión'
      });
    }
  }
}