import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, NavbarComponent, SidebarComponent],
  template: `
    <!-- Don't show navbar in admin/empleado panels -->
    <app-navbar *ngIf="!isAdminRoute && !isEmpleadoRoute"></app-navbar>
    
    <!-- Show sidebar in main user routes -->
    <app-sidebar *ngIf="showSidebar"></app-sidebar>
    
    <div class="main-content" [ngClass]="{
      'admin-mode': isAdminRoute || isEmpleadoRoute,
      'with-sidebar': showSidebar
    }">
      <router-outlet></router-outlet>
    </div>
    
    <!-- Don't show footer in admin/empleado panels -->
    <app-footer *ngIf="!isAdminRoute && !isEmpleadoRoute"></app-footer>
  `,
  styles: [`
    .main-content {
      min-height: 100vh;
      padding-top: 80px;
      transition: margin-left 0.3s ease;
    }
    
    .main-content.with-sidebar {
      margin-left: 250px;
    }
    
    .main-content.admin-mode {
      margin-left: 0;
      padding-top: 0;
      padding: 0;
    }
    
    @media (max-width: 768px) {
      .main-content.with-sidebar {
        margin-left: 60px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'proyecto-sis';
  isAdminRoute = false;
  isEmpleadoRoute = false;
  showSidebar = true; // Enable sidebar by default
  private platformId = inject(PLATFORM_ID);
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Subscribe to router events to check current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateRouteFlags(event.url);
    });

    // Check initial route
    this.updateRouteFlags(this.router.url);
  }

  private updateRouteFlags(url: string) {
    this.isAdminRoute = url.includes('/admin');
    this.isEmpleadoRoute = url.includes('/empleado');
    
    // Show sidebar only on main user routes (not admin/empleado routes)
    this.showSidebar = !this.isAdminRoute && !this.isEmpleadoRoute;
  }
  
  redirectToHome() {
    this.router.navigate(['/home']);
  }
}
