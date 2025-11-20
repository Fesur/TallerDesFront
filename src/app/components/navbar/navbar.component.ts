import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isMenuOpen = false;
  isAdmin = false;
  isEmpleado = false;
  platformId = inject(PLATFORM_ID);

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check initial state from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const userRole = localStorage.getItem('userRole');
      this.isAdmin = userRole === 'admin';
      this.isEmpleado = userRole === 'empleado';
      this.isLoggedIn = !!userRole;
    }

    // Set up a listener for auth state
    onAuthStateChanged(this.auth, (user) => {
      if (isPlatformBrowser(this.platformId)) {
        const userRole = localStorage.getItem('userRole');
        
        // Check for admin
        const isAdminByStorage = userRole === 'admin';
        const isAdminByEmail = user?.email === 'admin@gmail.com';
        this.isAdmin = isAdminByStorage || isAdminByEmail;
        
        // Check for empleado
        const isEmpleadoByStorage = userRole === 'empleado';
        const isEmpleadoByEmail = user?.email === 'empleado@gmail.com';
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
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async cerrarSesion() {
    try {
      // Only sign out from Firebase if there's an actual Firebase user
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
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar la sesión'
      });
    }
  }
}