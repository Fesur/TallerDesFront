import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private platformId: Object = inject(PLATFORM_ID);
  
  constructor(private auth: Auth, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      // During SSR, allow navigation
      if (!isPlatformBrowser(this.platformId)) {
        resolve(true);
        return;
      }
      
      const userRole = localStorage.getItem('userRole');
      
      // Admin routes - check localStorage for admin role
      if (state.url.includes('/admin')) {
        if (userRole === 'admin') {
          console.log('Admin access granted via localStorage');
          resolve(true);
          return;
        }
      }
      
      // Empleado routes - check localStorage for empleado role
      if (state.url.includes('/empleado')) {
        if (userRole === 'empleado') {
          console.log('Empleado access granted via localStorage');
          resolve(true);
          return;
        }
      }
      
      // Get current user first for a quicker check
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        // For admin routes, check if user is admin
        if (state.url.includes('/admin')) {
          if (currentUser.email === 'admin@gmail.com') {
            localStorage.setItem('userRole', 'admin');
            resolve(true);
            return;
          } else {
            this.router.navigate(['/']);
            resolve(false);
            return;
          }
        }
        
        // For empleado routes, check if user is empleado
        if (state.url.includes('/empleado')) {
          if (currentUser.email === 'empleado@gmail.com') {
            localStorage.setItem('userRole', 'empleado');
            resolve(true);
            return;
          } else {
            this.router.navigate(['/']);
            resolve(false);
            return;
          }
        }
        
        // For other protected routes (regular user routes)
        if (!state.url.includes('/admin') && !state.url.includes('/empleado')) {
          resolve(true);
          return;
        }
      }
      
      // If user role exists but no Firebase user (for admin/empleado hardcoded login)
      if (userRole) {
        if (state.url.includes('/admin') && userRole === 'admin') {
          resolve(true);
          return;
        }
        if (state.url.includes('/empleado') && userRole === 'empleado') {
          resolve(true);
          return;
        }
        if (!state.url.includes('/admin') && !state.url.includes('/empleado')) {
          resolve(true);
          return;
        }
      }
      
      // Wait for auth state to be fully determined
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          // For admin routes, check admin privileges
          if (state.url.includes('/admin')) {
            if (user.email === 'admin@gmail.com') {
              localStorage.setItem('userRole', 'admin');
              resolve(true);
            } else {
              this.router.navigate(['/']);
              resolve(false);
            }
          }
          // For empleado routes, check empleado privileges
          else if (state.url.includes('/empleado')) {
            if (user.email === 'empleado@gmail.com') {
              localStorage.setItem('userRole', 'empleado');
              resolve(true);
            } else {
              this.router.navigate(['/']);
              resolve(false);
            }
          }
          // Regular authenticated routes
          else {
            resolve(true);
          }
        } else {
          // Check if it's a hardcoded admin/empleado trying to access their routes
          const storedRole = localStorage.getItem('userRole');
          if (storedRole === 'admin' && state.url.includes('/admin')) {
            resolve(true);
          } else if (storedRole === 'empleado' && state.url.includes('/empleado')) {
            resolve(true);
          } else {
            // Not authenticated, redirect to login
            this.router.navigate(['/login']);
            resolve(false);
          }
        }
      });
    });
  }
}