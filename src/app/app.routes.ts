import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { CarritoComponent } from './carrito/carrito.component';
import { LibroDetalleComponent } from './libro/libro-detalle.component';
import { InventarioComponent } from './inventario/inventario.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { KeycloakAuthGuard, RoleGuard } from './guards/keycloak-auth.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminBooksComponent } from './admin/books/admin-books.component';
import { AdminReservationsComponent } from './admin/reservations/admin-reservations.component';
import { AdminAboutComponent } from './admin/about/admin-about.component';
import { EmpleadoDashboardComponent } from './empleado/dashboard/empleado-dashboard.component';
import { EmpleadoBooksComponent } from './empleado/books/empleado-books.component';
import { EmpleadoReservationsComponent } from './empleado/reservations/empleado-reservations.component';
import { AdminRolesComponent } from './admin/roles/admin-roles.component';
import { KeycloakTestComponent } from './keycloak-test/keycloak-test.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'about',
        component: AboutComponent,
        canActivate: [KeycloakAuthGuard]
    },
    {
        path: 'carrito',
        component: CarritoComponent,
        canActivate: [KeycloakAuthGuard]
    },
    {
        path: 'libro/:id',
        component: LibroDetalleComponent
    },
    {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [KeycloakAuthGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [KeycloakAuthGuard]
    },
    {
        path: 'keycloak-test',
        component: KeycloakTestComponent,
        canActivate: [KeycloakAuthGuard]
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [KeycloakAuthGuard, RoleGuard],
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: AdminBooksComponent },
            { path: 'reservations', component: AdminReservationsComponent },
            { path: 'roles', component: AdminRolesComponent },
            { path: 'about', component: AdminAboutComponent }
        ]
    },
    {
        path: 'empleado',
        component: EmpleadoDashboardComponent,
        canActivate: [KeycloakAuthGuard, RoleGuard],
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: EmpleadoBooksComponent },
            { path: 'reservations', component: EmpleadoReservationsComponent }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
