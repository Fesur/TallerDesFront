import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-empleado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empleado-dashboard.component.html',
  styleUrl: './empleado-dashboard.component.css'
})
export class EmpleadoDashboardComponent implements OnInit {
  menuItems = [
    { name: 'Productos', icon: 'fa-book', route: '/empleado/books' },
    { name: 'Reservas', icon: 'fa-bookmark', route: '/empleado/reservations' },
    { name: 'Ir al Sitio', icon: 'fa-home', route: '/' }
  ];
  isEmpleado = false;
  loading = true;
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const isEmpleadoByStorage = localStorage.getItem('userRole') === 'empleado';
      this.isEmpleado = isEmpleadoByStorage;
      this.loading = false;
      if (!this.isEmpleado) {
        this.router.navigate(['/']);
      }
    }
  }
}