import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  menuItems = [
    { name: 'Dashboard', icon: 'fa-tachometer-alt', route: '/admin' },
    { name: 'Gestión de Libros', icon: 'fa-book', route: '/admin/books' },
    { name: 'Reservas', icon: 'fa-bookmark', route: '/admin/reservations' },
    { name: 'Roles', icon: 'fa-users', route: '/admin/roles' },
    { name: 'Editar Acerca De', icon: 'fa-info-circle', route: '/admin/about' },
    { name: 'Ir al Sitio', icon: 'fa-home', route: '/' }
  ];

  currentUser: User | null = null;
  isAdmin = false;
  loading = true; // Add loading state
  private platformId = inject(PLATFORM_ID);

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    // Check if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Check localStorage first for quick access determination
      const isAdminByStorage = localStorage.getItem('userRole') === 'admin';
      
      // If admin role is in localStorage, allow access immediately
      if (isAdminByStorage) {
        this.isAdmin = true;
        this.loading = false;
        console.log('Admin access granted via localStorage in component');
      }
      
      // Set up a persistent listener for auth state
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.loading = false; // Authentication state resolved
        
        // Only check and potentially redirect if we're not already admin by localStorage
        if (!isAdminByStorage) {
          // Double-check admin status
          const isAdminByEmail = user?.email === 'admin@gmail.com';
          
          if (!user) {
            console.log('No user authenticated, redirecting to login');
            this.router.navigate(['/login']);
          } else if (!isAdminByEmail) {
            console.log('User authenticated but not admin, redirecting to home');
            this.router.navigate(['/']);
          } else if (user && isAdminByEmail) {
            // Ensure admin role is saved consistently
            localStorage.setItem('userRole', 'admin');
            this.isAdmin = true;
            console.log('Admin access confirmed via email in dashboard component');
          }
        }
      });
    }
  }

  // Add a method to check if we're on the main admin route
  isAdminRoute(): boolean {
    return this.router.url === '/admin';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.signOut().then(() => {
        localStorage.removeItem('userRole');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/login']);
      });
    }
  }
}
