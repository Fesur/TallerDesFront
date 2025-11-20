import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

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
    { name: 'Gestión de Roles', icon: 'fa-user-shield', route: '/admin/roles' },
    { name: 'Editar Acerca De', icon: 'fa-info-circle', route: '/admin/about' },
    { name: 'Ir al Sitio', icon: 'fa-home', route: '/' }
  ];

  currentUser: User | null = null;
  isAdmin = false;
  loading = true; // Add loading state
  private platformId = inject(PLATFORM_ID);

  constructor(private auth: Auth, private router: Router, private firestore: Firestore) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(this.auth, async (user) => {
        this.currentUser = user;
        this.loading = false;
        let userRole = '';
        if (user) {
          // Leer el rol desde Firestore
          const userDocRef = doc(this.firestore, 'User', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            userRole = userSnap.data()['Rol'];
            localStorage.setItem('userRole', userRole);
          } else {
            localStorage.removeItem('userRole');
          }
        } else {
          localStorage.removeItem('userRole');
        }
        const isAdminByRole = userRole === 'admin' || userRole === 'NAkhkUa3UOP4mBFLFHkz';
        if (isAdminByRole) {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
          if (!user) {
            this.router.navigate(['/login']);
          } else {
            this.router.navigate(['/']);
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

